import { GistFilterCategory, GistMigrationOptions, GistSnippetRecord, ImportSession, MigrationLog, MigrationProgress, SignedNostrEvent, UnsignedNostrEvent } from '../../types';
import { gitHubService } from './github-service';
import { parseCodeFiles, parseGistJsonString, parseGitHubGistItems } from './parser';
import { buildEncryptedGistEvent, buildGistSnippetEvent } from './event-builder';
import { nostrService } from '../../services/nostr';
import { importSessionService } from '../../services/import-session';

type ProgressListener = (progress: MigrationProgress) => void;
type LogListener = (log: MigrationLog) => void;
type SnippetsChangeListener = (snippets: GistSnippetRecord[]) => void;

class GistPipeline {
  private snippets: GistSnippetRecord[] = [];
  private logs: MigrationLog[] = [];
  private isPaused = false;
  private isCancelled = false;
  private isRunning = false;

  private sourceFingerprint: string | null = null;
  private activeSessionKey: string | null = null;

  private progress: MigrationProgress = {
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    phase: 'idle',
    percentage: 0,
  };

  private progressListeners: Set<ProgressListener> = new Set();
  private logListeners: Set<LogListener> = new Set();
  private snippetsListeners: Set<SnippetsChangeListener> = new Set();

  public getSnippets(): GistSnippetRecord[] {
    return [...this.snippets];
  }

  public getLogs(): MigrationLog[] {
    return [...this.logs];
  }

  public getProgress(): MigrationProgress {
    return { ...this.progress };
  }

  public getFingerprint(): string | null {
    return this.sourceFingerprint;
  }

  public getSessionKey(): string | null {
    return this.activeSessionKey;
  }

  /**
   * Dry run helper: generates all unsigned Nostr events for selected snippets without signing/publishing.
   */
  public async generateUnsignedEvents(options?: Partial<GistMigrationOptions>, customPubkey?: string): Promise<UnsignedNostrEvent[]> {
    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';
    const selected = this.snippets.filter((s) => s.selected);
    const events: UnsignedNostrEvent[] = [];

    const encryptPrivate = options?.encryptPrivateGists ?? true;

    for (const snippet of selected) {
      if (!snippet.isPublic && encryptPrivate) {
        // If extension is connected and can encrypt, encrypt; otherwise format preview string
        let ciphertext = `[NIP-44 Encrypted Payload Preview for ${snippet.name}]`;
        if (nostrService.getPubkey()) {
          try {
            const payloadObject = {
              name: snippet.name,
              extension: snippet.extension,
              language: snippet.language,
              description: snippet.description,
              content: snippet.content,
              repoUrl: snippet.repoUrl,
              createdAtTimestamp: snippet.createdAtTimestamp,
              tags: snippet.tags,
            };
            ciphertext = await nostrService.encryptPayload(pubkey, JSON.stringify(payloadObject));
          } catch {
            ciphertext = `[NIP-44 Encrypted: ${snippet.name} (${snippet.content.length} chars)]`;
          }
        }
        events.push(buildEncryptedGistEvent(snippet, pubkey, ciphertext));
      } else {
        events.push(buildGistSnippetEvent(snippet, pubkey, options as GistMigrationOptions | undefined));
      }
    }

    return events;
  }

  /**
   * Generates a single unsigned Nostr event for a specific snippet.
   */
  public async generateSingleSnippetEvent(snippetId: string, options?: Partial<GistMigrationOptions>, customPubkey?: string): Promise<UnsignedNostrEvent | null> {
    const snippet = this.snippets.find((s) => s.id === snippetId);
    if (!snippet) return null;
    const pubkey = customPubkey || nostrService.getPubkey() || '0000000000000000000000000000000000000000000000000000000000000000';

    if (!snippet.isPublic && options?.encryptPrivateGists) {
      let ciphertext = `[NIP-44 Encrypted Payload Preview for ${snippet.name}]`;
      if (nostrService.getPubkey()) {
        try {
          const payloadObject = {
            name: snippet.name,
            extension: snippet.extension,
            language: snippet.language,
            description: snippet.description,
            content: snippet.content,
            repoUrl: snippet.repoUrl,
            createdAtTimestamp: snippet.createdAtTimestamp,
            tags: snippet.tags,
          };
          ciphertext = await nostrService.encryptPayload(pubkey, JSON.stringify(payloadObject));
        } catch {
          ciphertext = `[NIP-44 Encrypted: ${snippet.name}]`;
        }
      }
      return buildEncryptedGistEvent(snippet, pubkey, ciphertext);
    }

    return buildGistSnippetEvent(snippet, pubkey, options as GistMigrationOptions | undefined);
  }

  /**
   * Fetches and parses all gists for a given GitHub username.
   */
  public async loadFromGitHub(username: string, token?: string): Promise<GistSnippetRecord[]> {
    this.addLog('info', `Connecting to GitHub API to fetch gists for @${username}...`);
    this.updateProgress({ phase: 'parsing', total: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });

    try {
      const gists = await gitHubService.fetchUserGists(username, token, (msg) => {
        this.addLog('info', msg);
      });

      this.addLog('info', `Found ${gists.length} gists. Parsing files and retrieving snippet contents...`);
      const parsed = await parseGitHubGistItems(gists, (msg) => {
        this.addLog('info', msg);
      });

      this.snippets = parsed;
      this.sourceFingerprint = `github_${username}_${parsed.length}_${Date.now()}`;

      const publicCount = parsed.filter((s) => s.isPublic).length;
      const secretCount = parsed.filter((s) => !s.isPublic).length;

      this.addLog(
        'success',
        `Successfully loaded ${parsed.length} code snippets (${publicCount} public, ${secretCount} secret/private).`
      );
      this.updateProgress({ phase: 'idle', total: parsed.length, percentage: 0 });
      this.notifySnippetsListeners();

      return this.snippets;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown GitHub fetch error';
      this.addLog('error', `Failed to load GitHub Gists: ${msg}`);
      this.updateProgress({ phase: 'error', percentage: 0 });
      throw err;
    }
  }

  /**
   * Fetches single or multiple Gists by ID or URL (comma, newline, or whitespace separated).
   */
  public async loadSingleGist(gistIdOrUrl: string, token?: string): Promise<GistSnippetRecord[]> {
    const rawItems = gistIdOrUrl
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    this.addLog('info', `Fetching ${rawItems.length} Gist(s) from GitHub...`);
    this.updateProgress({ phase: 'parsing', total: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });

    try {
      const gists = [];
      for (const item of rawItems) {
        try {
          const g = await gitHubService.fetchSingleGist(item, token);
          gists.push(g);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error fetching Gist';
          this.addLog('warning', `Could not fetch Gist "${item}": ${msg}`);
        }
      }

      if (gists.length === 0) {
        throw new Error('No valid Gists could be retrieved with the provided IDs/URLs.');
      }

      const parsed = await parseGitHubGistItems(gists);

      this.snippets = parsed;
      this.sourceFingerprint = `gists_${gists.map((g) => g.id).join('_')}_${parsed.length}`;

      const publicCount = parsed.filter((s) => s.isPublic).length;
      const secretCount = parsed.filter((s) => !s.isPublic).length;

      this.addLog(
        'success',
        `Successfully loaded ${parsed.length} files from ${gists.length} Gist(s) (${publicCount} public, ${secretCount} secret/private).`
      );
      this.updateProgress({ phase: 'idle', total: parsed.length, percentage: 0 });
      this.notifySnippetsListeners();

      return this.snippets;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch Gist(s)';
      this.addLog('error', `Error loading Gists: ${msg}`);
      this.updateProgress({ phase: 'error', percentage: 0 });
      throw err;
    }
  }

  /**
   * Loads code files or JSON snippet exports dropped by the user.
   */
  public async loadFiles(files: File[]): Promise<GistSnippetRecord[]> {
    this.addLog('info', `Processing ${files.length} uploaded files...`);
    this.updateProgress({ phase: 'parsing', total: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, percentage: 0 });

    try {
      let parsed: GistSnippetRecord[] = [];

      // Check if user uploaded a single .json export file
      if (files.length === 1 && files[0].name.toLowerCase().endsWith('.json')) {
        const jsonText = await files[0].text();
        parsed = parseGistJsonString(jsonText);
        this.sourceFingerprint = await importSessionService.computeFingerprint(files[0]);
      } else {
        parsed = await parseCodeFiles(files);
        this.sourceFingerprint = `files_${files.length}_${files[0]?.size || 0}`;
      }

      this.snippets = parsed;
      this.addLog('success', `Successfully parsed ${parsed.length} code snippets.`);
      this.updateProgress({ phase: 'idle', total: parsed.length, percentage: 0 });
      this.notifySnippetsListeners();

      return this.snippets;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error parsing code files';
      this.addLog('error', `Failed to load files: ${msg}`);
      this.updateProgress({ phase: 'error', percentage: 0 });
      throw err;
    }
  }

  public toggleSnippetSelection(id: string, selected?: boolean): void {
    const snippet = this.snippets.find((s) => s.id === id);
    if (snippet) {
      snippet.selected = selected !== undefined ? selected : !snippet.selected;
      this.notifySnippetsListeners();
    }
  }

  public toggleSnippetPrivacy(id: string): void {
    const snippet = this.snippets.find((s) => s.id === id);
    if (snippet) {
      snippet.isPublic = !snippet.isPublic;
      this.notifySnippetsListeners();
    }
  }

  public setSnippetsPrivacy(ids: string[], isPublic: boolean): void {
    const idSet = new Set(ids);
    this.snippets.forEach((s) => {
      if (idSet.has(s.id)) {
        s.isPublic = isPublic;
      }
    });
    this.notifySnippetsListeners();
  }

  public selectAll(selected = true, filterCategory?: GistFilterCategory, filterLanguage?: string): void {
    this.snippets.forEach((s) => {
      let matchesCat = true;
      if (filterCategory === 'public') matchesCat = s.isPublic;
      if (filterCategory === 'secret') matchesCat = !s.isPublic;

      let matchesLang = true;
      if (filterLanguage && filterLanguage !== 'all') {
        matchesLang = s.language.toLowerCase() === filterLanguage.toLowerCase();
      }

      if (matchesCat && matchesLang) {
        s.selected = selected;
      }
    });
    this.notifySnippetsListeners();
  }

  public pause(): void {
    if (this.isRunning) {
      this.isPaused = true;
      this.updateProgress({ phase: 'paused' });
      this.addLog('warning', 'Migration paused by user.');
    }
  }

  public resume(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.updateProgress({ phase: 'broadcasting' });
      this.addLog('info', 'Migration resumed.');
    }
  }

  public cancel(): void {
    if (this.isRunning) {
      this.isCancelled = true;
      this.isRunning = false;
      this.isPaused = false;
      this.updateProgress({ phase: 'idle' });
      this.addLog('warning', 'Migration cancelled by user.');
    }
  }

  public async startMigration(options: GistMigrationOptions): Promise<void> {
    if (this.isRunning) return;

    const pubkey = nostrService.getPubkey();
    if (!pubkey) {
      this.addLog('error', 'Cannot start migration: Nostr account not connected.');
      throw new Error('Please connect your Nostr extension before migrating.');
    }

    const selectedSnippets = this.snippets.filter((s) => s.selected);
    if (selectedSnippets.length === 0) {
      this.addLog('warning', 'No code snippets selected for migration.');
      throw new Error('Please select at least one code snippet to migrate.');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.isCancelled = false;

    // Session setup
    const { resumeSession, ...coreOptions } = options;
    let session: ImportSession;
    if (resumeSession) {
      session = resumeSession;
      this.activeSessionKey = session.sessionKey;
      this.addLog('info', `Resuming previous Gist import session (${session.completedBookIds.length} snippets already published).`);
    } else {
      const fingerprint = this.sourceFingerprint ?? `gists_${Date.now()}`;
      session = importSessionService.createSession(
        'gists',
        pubkey,
        fingerprint,
        selectedSnippets.length,
        coreOptions
      );
      this.activeSessionKey = session.sessionKey;
    }

    const completedIds = new Set(session.completedBookIds);
    let processed = session.completedBookIds.length;
    let succeeded = processed;
    let failed = 0;
    let skipped = 0;

    this.updateProgress({
      total: selectedSnippets.length,
      processed,
      succeeded,
      failed,
      skipped,
      phase: 'resolving',
      percentage: selectedSnippets.length === 0 ? 100 : Math.round((processed / selectedSnippets.length) * 100),
    });

    this.addLog('info', `Starting migration for ${selectedSnippets.length} snippets...`);

    try {
      // Step 0: Deletion of previous events if requested
      if (options.deletePreviousSnippetsBeforeImport) {
        this.addLog('info', 'Searching for previous code snippet events (Kinds 1337 & 30078) on your relays...');
        this.updateProgress({ phase: 'signing' });
        try {
          const prevPublicIds = await nostrService.fetchUserEventIds(pubkey, [1337]);
          const prevPrivateIds = await nostrService.fetchUserEventIds(pubkey, [30078]);
          const allPreviousIds = [...prevPublicIds, ...prevPrivateIds];

          if (allPreviousIds.length > 0) {
            this.addLog('info', `Found ${allPreviousIds.length} previous snippet events. Requesting NIP-09 deletion signature...`);
            const { successfulRelays } = await nostrService.deleteEvents(
              allPreviousIds,
              'Replacing previous code snippets via x2nostr'
            );
            this.addLog('success', `Broadcast NIP-09 deletion for ${allPreviousIds.length} events to ${successfulRelays.length} relays.`);
          }
        } catch (delErr: unknown) {
          const msg = delErr instanceof Error ? delErr.message : 'Deletion error';
          this.addLog('warning', `Could not broadcast NIP-09 deletion: ${msg}`);
        }
      }

      // Step 1: Sign and Broadcast Snippet Events
      this.updateProgress({ phase: 'broadcasting' });

      for (const snippet of selectedSnippets) {
        if (this.isCancelled) return;
        while (this.isPaused) {
          await new Promise((r) => setTimeout(r, 300));
          if (this.isCancelled) return;
        }

        if (completedIds.has(snippet.id)) {
          skipped++;
          processed++;
          this.updateProgress({
            processed,
            succeeded,
            failed,
            skipped,
            percentage: Math.round((processed / selectedSnippets.length) * 100),
          });
          continue;
        }

        this.updateProgress({ currentTitle: snippet.name });

        try {
          let unsignedEvent;

          if (!snippet.isPublic && options.encryptPrivateGists) {
            // NIP-44 encrypted private snippet payload
            this.addLog('info', `Encrypting private snippet "${snippet.name}" with your Nostr public key (NIP-44)...`);
            const payloadObject = {
              name: snippet.name,
              extension: snippet.extension,
              language: snippet.language,
              description: snippet.description,
              content: snippet.content,
              repoUrl: snippet.repoUrl,
              createdAtTimestamp: snippet.createdAtTimestamp,
              tags: snippet.tags,
            };
            const encryptedCiphertext = await nostrService.encryptPayload(pubkey, JSON.stringify(payloadObject));
            unsignedEvent = buildEncryptedGistEvent(snippet, pubkey, encryptedCiphertext);
          } else {
            // Public NIP-C0 Kind 1337 snippet
            this.addLog('info', `Requesting signature for NIP-C0 snippet: "${snippet.name}" (${snippet.language})...`);
            unsignedEvent = buildGistSnippetEvent(snippet, pubkey, options);
          }

          const signedEvent: SignedNostrEvent = await nostrService.signEvent(unsignedEvent);
          const { successfulRelays } = await nostrService.publishEvent(signedEvent);

          if (successfulRelays.length > 0) {
            succeeded++;
            importSessionService.markBookCompleted(session.sessionKey, snippet.id);
            completedIds.add(snippet.id);
            this.addLog('success', `Published snippet "${snippet.name}" to ${successfulRelays.length} relays.`);
          } else {
            failed++;
            this.addLog('warning', `Relays did not acknowledge snippet "${snippet.name}"`);
          }
        } catch (err: unknown) {
          failed++;
          const msg = err instanceof Error ? err.message : 'User rejected signing or encryption error';
          this.addLog('error', `Could not publish snippet "${snippet.name}": ${msg}`);
        }

        processed++;
        this.updateProgress({
          processed,
          succeeded,
          failed,
          skipped,
          percentage: Math.round((processed / selectedSnippets.length) * 100),
        });
      }

      this.isRunning = false;
      importSessionService.completeSession(session.sessionKey);
      this.activeSessionKey = null;
      this.updateProgress({ phase: 'completed', percentage: 100 });
      this.addLog('success', `Gist migration completed! ${succeeded} snippets published successfully, ${failed} failed, ${skipped} skipped.`);
    } catch (err: unknown) {
      this.isRunning = false;
      const msg = err instanceof Error ? err.message : 'Unexpected migration error';
      this.addLog('error', `Gist migration aborted: ${msg}`);
      this.updateProgress({ phase: 'error' });
      throw err;
    }
  }

  public addLog(level: MigrationLog['level'], message: string, details?: Record<string, unknown> | string): void {
    const log: MigrationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
      level,
      message,
      details,
    };
    this.logs.unshift(log);
    if (this.logs.length > 200) this.logs.pop();
    this.notifyLogListeners(log);
  }

  public clearLogs(): void {
    this.logs = [];
    this.notifyLogListeners({ id: 'clear', timestamp: new Date(), level: 'info', message: '' });
  }

  private updateProgress(patch: Partial<MigrationProgress>): void {
    this.progress = { ...this.progress, ...patch };
    this.notifyProgressListeners();
  }

  public onProgress(listener: ProgressListener): () => void {
    this.progressListeners.add(listener);
    return () => {
      this.progressListeners.delete(listener);
    };
  }

  public onLog(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => {
      this.logListeners.delete(listener);
    };
  }

  public onSnippetsChange(listener: SnippetsChangeListener): () => void {
    this.snippetsListeners.add(listener);
    return () => {
      this.snippetsListeners.delete(listener);
    };
  }

  private notifyProgressListeners(): void {
    this.progressListeners.forEach((l) => {
      try {
        l({ ...this.progress });
      } catch (err) {
        console.error('Error in progress listener:', err);
      }
    });
  }

  private notifyLogListeners(log: MigrationLog): void {
    this.logListeners.forEach((l) => {
      try {
        l(log);
      } catch (err) {
        console.error('Error in log listener:', err);
      }
    });
  }

  private notifySnippetsListeners(): void {
    this.snippetsListeners.forEach((l) => {
      try {
        l([...this.snippets]);
      } catch (err) {
        console.error('Error in snippets listener:', err);
      }
    });
  }
}

export const gistPipeline = new GistPipeline();
