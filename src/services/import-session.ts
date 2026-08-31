import { ImportSession } from '../types';

/** localStorage key prefix — all session entries share this prefix for easy enumeration. */
const SESSION_PREFIX = 'x2nostr_session_';

/** Sessions older than this are automatically pruned (30 days in ms). */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Computes a stable fingerprint for a CSV File using the SubtleCrypto Web API.
 * The fingerprint is a SHA-256 hex digest of the first 512 bytes of the file
 * concatenated with the file's total byte size as a decimal string.
 *
 * This is intentionally lightweight — we don't hash the full file to keep
 * the UI responsive for large CSVs. The combination of file size + first 512
 * bytes is sufficient to distinguish different Goodreads exports.
 */
async function computeFileFingerprint(file: File): Promise<string> {
  const SAMPLE_BYTES = 512;
  const slice = file.slice(0, SAMPLE_BYTES);
  const arrayBuffer = await slice.arrayBuffer();

  // Append file size as a little-endian uint32 into the buffer so that two
  // files with identical first-512 bytes but different sizes produce different
  // fingerprints (e.g. a truncated re-export).
  const sizeBytes = new Uint8Array(4);
  const view = new DataView(sizeBytes.buffer);
  view.setUint32(0, file.size & 0xffffffff, true);

  const combined = new Uint8Array(arrayBuffer.byteLength + 4);
  combined.set(new Uint8Array(arrayBuffer), 0);
  combined.set(sizeBytes, arrayBuffer.byteLength);

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Builds the composite localStorage key for a session.
 * Format: x2nostr_session_{importerID}_{pubkeyPrefix8}_{fingerprintHex64}
 */
function buildSessionKey(importerID: string, pubkeyPrefix: string, csvFingerprint: string): string {
  return `${SESSION_PREFIX}${importerID}_${pubkeyPrefix}_${csvFingerprint}`;
}

class ImportSessionService {
  /**
   * Computes the content fingerprint for the given file.
   * Exposed so the pipeline can compute it once after CSV parsing and reuse.
   */
  public async computeFingerprint(file: File): Promise<string> {
    return computeFileFingerprint(file);
  }

  /**
   * Returns the composite session key without creating anything in storage.
   * Useful for pre-checking before calling findSession.
   */
  public buildKey(importerID: string, pubkeyHex: string, csvFingerprint: string): string {
    return buildSessionKey(importerID, pubkeyHex.slice(0, 8), csvFingerprint);
  }

  /**
   * Looks up an existing in-progress session that matches the given importer,
   * pubkey, and CSV fingerprint. Returns null if no matching session exists or
   * if the matching session is already marked completed.
   */
  public findSession(
    importerID: string,
    pubkeyHex: string,
    csvFingerprint: string
  ): ImportSession | null {
    this.pruneExpiredSessions();

    const key = buildSessionKey(importerID, pubkeyHex.slice(0, 8), csvFingerprint);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const session: ImportSession = JSON.parse(raw);
      if (session.phase === 'completed') return null;
      return session;
    } catch {
      // Corrupt entry — remove it
      localStorage.removeItem(key);
      return null;
    }
  }

  /**
   * Creates a new session in localStorage.
   * Must be called before startMigration so that progress is tracked from the
   * very first event.
   */
  public createSession(
    importerID: string,
    pubkeyHex: string,
    csvFingerprint: string,
    totalBooks: number,
    options: Record<string, unknown>
  ): ImportSession {
    const pubkeyPrefix = pubkeyHex.slice(0, 8);
    const sessionKey = buildSessionKey(importerID, pubkeyPrefix, csvFingerprint);
    const now = new Date().toISOString();

    const session: ImportSession = {
      sessionKey,
      importerID,
      pubkeyPrefix,
      csvFingerprint,
      createdAt: now,
      updatedAt: now,
      options,
      completedBookIds: [],
      shelvesCompleted: [],
      totalBooks,
      phase: 'in-progress',
    };

    this.persist(session);
    return session;
  }

  /**
   * Appends a book ID to the completedBookIds list and flushes to localStorage.
   * Called immediately after each successful Kind 1985 publish.
   */
  public markBookCompleted(sessionKey: string, bookId: string): void {
    const session = this.loadRaw(sessionKey);
    if (!session || session.phase === 'completed') return;

    if (!session.completedBookIds.includes(bookId)) {
      session.completedBookIds.push(bookId);
      session.updatedAt = new Date().toISOString();
      this.persist(session);
    }
  }

  /**
   * Records a shelf as fully published (Kind 30001).
   * Called immediately after each successful shelf list publish.
   */
  public markShelfCompleted(sessionKey: string, shelf: string): void {
    const session = this.loadRaw(sessionKey);
    if (!session || session.phase === 'completed') return;

    if (!session.shelvesCompleted.includes(shelf)) {
      session.shelvesCompleted.push(shelf);
      session.updatedAt = new Date().toISOString();
      this.persist(session);
    }
  }

  /**
   * Marks the session as fully completed.
   * Completed sessions are retained in localStorage for 30 days so the user
   * can see that the same CSV was already imported (no resume banner is shown).
   */
  public completeSession(sessionKey: string): void {
    const session = this.loadRaw(sessionKey);
    if (!session) return;

    session.phase = 'completed';
    session.updatedAt = new Date().toISOString();
    this.persist(session);
  }

  /**
   * Removes a session from localStorage entirely.
   * Used when the user explicitly chooses "Start Fresh".
   */
  public clearSession(sessionKey: string): void {
    localStorage.removeItem(sessionKey);
  }

  /**
   * Removes all sessions that are older than SESSION_TTL_MS.
   * Called automatically on findSession to keep localStorage clean.
   */
  public pruneExpiredSessions(): void {
    const cutoff = Date.now() - SESSION_TTL_MS;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(SESSION_PREFIX)) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const session: ImportSession = JSON.parse(raw);
        const updatedAt = new Date(session.updatedAt).getTime();
        if (updatedAt < cutoff) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }

  private loadRaw(sessionKey: string): ImportSession | null {
    const raw = localStorage.getItem(sessionKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ImportSession;
    } catch {
      localStorage.removeItem(sessionKey);
      return null;
    }
  }

  private persist(session: ImportSession): void {
    localStorage.setItem(session.sessionKey, JSON.stringify(session));
  }
}

export const importSessionService = new ImportSessionService();
