import { nip19, SimplePool } from 'nostr-tools';
import { NostrUserProfile, RelayConfig, SignedNostrEvent, UnsignedNostrEvent } from '../types';
import { buildDeletionEvent } from '../importers/goodreads/event-builder';

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: {
        kind: number;
        tags: string[][];
        content: string;
        created_at: number;
        pubkey?: string;
      }): Promise<SignedNostrEvent>;
      getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>;
    };
  }
}

export const DEFAULT_BOOTSTRAP_RELAYS: string[] = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://relay.snort.social',
];

const STORAGE_PUBKEY_KEY = 'x2nostr_pubkey';
const STORAGE_RELAYS_KEY = 'x2nostr_custom_relays';

/** Timeout (ms) for profile and relay discovery queries */
const DISCOVERY_TIMEOUT_MS = 6000;

type AuthListener = (pubkey: string | null, npub: string | null) => void;
type RelayListener = (relays: RelayConfig[]) => void;
type ProfileListener = (profile: NostrUserProfile | null) => void;

class NostrService {
  private pubkey: string | null = null;
  private npub: string | null = null;
  private relays: RelayConfig[] = [];
  private profile: NostrUserProfile | null = null;
  private pool: SimplePool;
  private authListeners: Set<AuthListener> = new Set();
  private relayListeners: Set<RelayListener> = new Set();
  private profileListeners: Set<ProfileListener> = new Set();

  constructor() {
    this.pool = new SimplePool();
    this.initRelays();
    this.initSavedAuth();
  }

  private initRelays(): void {
    if (typeof window === 'undefined') return;

    const savedRelays = localStorage.getItem(STORAGE_RELAYS_KEY);
    if (savedRelays) {
      try {
        const parsed: RelayConfig[] = JSON.parse(savedRelays);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.relays = parsed;
          return;
        }
      } catch (err) {
        console.warn('Failed to parse saved relays:', err);
      }
    }

    this.relays = DEFAULT_BOOTSTRAP_RELAYS.map((url) => ({
      url,
      read: true,
      write: true,
      status: 'connected' as const,
    }));
  }

  private initSavedAuth(): void {
    if (typeof window === 'undefined') return;

    const savedPubkey = localStorage.getItem(STORAGE_PUBKEY_KEY);
    if (savedPubkey && savedPubkey.length === 64) {
      try {
        this.pubkey = savedPubkey;
        this.npub = nip19.npubEncode(savedPubkey);
      } catch (e) {
        console.warn('Failed to encode saved pubkey:', e);
        this.pubkey = null;
        this.npub = null;
      }
    }
  }

  public hasExtension(): boolean {
    return typeof window !== 'undefined' && Boolean(window.nostr);
  }

  public async connect(): Promise<{ pubkey: string; npub: string }> {
    if (!this.hasExtension() || !window.nostr) {
      throw new Error('NIP-07 Nostr extension (e.g. Alby, nos2x) not detected in your browser.');
    }

    try {
      const pubkey = await window.nostr.getPublicKey();
      const npub = nip19.npubEncode(pubkey);

      this.pubkey = pubkey;
      this.npub = npub;

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_PUBKEY_KEY, pubkey);
      }

      // Notify auth listeners immediately so the UI shows the npub while discovery runs
      this.notifyAuthListeners();

      // Run relay discovery and profile fetch concurrently
      await Promise.allSettled([
        this.fetchAndApplyUserRelays(pubkey),
        this.fetchUserProfile(pubkey),
      ]);

      return { pubkey, npub };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'User rejected NIP-07 authentication request.';
      throw new Error(message);
    }
  }

  /**
   * Fetches the user's canonical relay list (NIP-65, Kind 10002) from bootstrap relays.
   * Falls back to NIP-07 window.nostr.getRelays() if no Kind 10002 event is found.
   * Replaces the current relay set and persists to localStorage.
   */
  private async fetchAndApplyUserRelays(pubkey: string): Promise<void> {
    try {
      const events = await this.pool.querySync(
        DEFAULT_BOOTSTRAP_RELAYS,
        { kinds: [10002], authors: [pubkey], limit: 1 },
        { maxWait: DISCOVERY_TIMEOUT_MS }
      );

      if (events.length > 0) {
        events.sort((a, b) => b.created_at - a.created_at);
        const event = events[0];

        const nip65Relays: RelayConfig[] = [];
        for (const tag of event.tags) {
          if (tag[0] !== 'r' || !tag[1]) continue;

          const url = tag[1].trim().replace(/\/$/, '');
          if (!url.startsWith('wss://') && !url.startsWith('ws://')) continue;

          const modifier = tag[2]; // 'read' | 'write' | undefined (means both)
          nip65Relays.push({
            url,
            read: modifier === undefined || modifier === 'read',
            write: modifier === undefined || modifier === 'write',
            status: 'connected',
          });
        }

        if (nip65Relays.length > 0) {
          this.relays = nip65Relays;
          this.saveRelays();
          this.notifyRelayListeners();
          return;
        }
      }
    } catch (err) {
      console.warn('NIP-65 relay discovery failed, falling back to NIP-07:', err);
    }

    // Fallback: NIP-07 extension relays
    if (window.nostr?.getRelays) {
      try {
        const extRelays = await window.nostr.getRelays();
        if (extRelays && Object.keys(extRelays).length > 0) {
          const existingUrls = new Set(this.relays.map((r) => r.url));
          for (const [url, config] of Object.entries(extRelays)) {
            const cleanUrl = url.trim().replace(/\/$/, '');
            if (!existingUrls.has(cleanUrl)) {
              this.relays.push({
                url: cleanUrl,
                read: config.read,
                write: config.write,
                status: 'connected',
              });
              existingUrls.add(cleanUrl);
            }
          }
          this.saveRelays();
          this.notifyRelayListeners();
        }
      } catch (relayErr) {
        console.warn('Could not fetch NIP-07 extension relays:', relayErr);
      }
    }
  }

  /**
   * Fetches the user's Kind 0 metadata event and builds a NostrUserProfile.
   * Display priority: display_name → name → truncated npub.
   */
  private async fetchUserProfile(pubkey: string): Promise<void> {
    const relayUrls = this.getWriteRelays();

    try {
      const events = await this.pool.querySync(
        relayUrls,
        { kinds: [0], authors: [pubkey], limit: 1 },
        { maxWait: DISCOVERY_TIMEOUT_MS }
      );

      if (events.length === 0) return;

      events.sort((a, b) => b.created_at - a.created_at);
      const event = events[0];

      let meta: Record<string, string> = {};
      try {
        meta = JSON.parse(event.content) as Record<string, string>;
      } catch {
        console.warn('Failed to parse Kind 0 content JSON for', pubkey);
        return;
      }

      const npub = this.npub ?? nip19.npubEncode(pubkey);
      const truncated = this.getTruncatedNpub() ?? npub;
      const displayName = (meta['display_name'] ?? '').trim();
      const name = (meta['name'] ?? '').trim();
      const username = displayName || name || truncated;

      this.profile = {
        pubkey,
        npub,
        username,
        name: name || undefined,
        displayName: displayName || undefined,
        about: (meta['about'] ?? '').trim() || undefined,
        picture: (meta['picture'] ?? '').trim() || undefined,
        banner: (meta['banner'] ?? '').trim() || undefined,
        nip05: (meta['nip05'] ?? '').trim() || undefined,
        lud16: (meta['lud16'] ?? '').trim() || undefined,
      };

      this.notifyProfileListeners();
    } catch (err) {
      console.warn('Failed to fetch user profile (Kind 0):', err);
    }
  }

  public disconnect(): void {
    this.pubkey = null;
    this.npub = null;
    this.profile = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_PUBKEY_KEY);
    }
    this.notifyAuthListeners();
    this.notifyProfileListeners();
  }

  public getPubkey(): string | null {
    return this.pubkey;
  }

  public getNpub(): string | null {
    return this.npub;
  }

  public getTruncatedNpub(prefixLen = 8, suffixLen = 4): string | null {
    if (!this.npub) return null;
    if (this.npub.length <= prefixLen + suffixLen + 3) return this.npub;
    return `${this.npub.slice(0, prefixLen)}...${this.npub.slice(-suffixLen)}`;
  }

  public getProfile(): NostrUserProfile | null {
    return this.profile;
  }

  /**
   * Returns the best available display name for the connected user.
   * Priority: display_name → name → truncated npub → null (not connected).
   */
  public getUsername(): string | null {
    if (!this.pubkey) return null;
    if (this.profile) return this.profile.username;
    return this.getTruncatedNpub();
  }

  public getRelays(): RelayConfig[] {
    return [...this.relays];
  }

  public getWriteRelays(): string[] {
    const active = this.relays.filter((r) => r.write).map((r) => r.url);
    return active.length > 0 ? active : DEFAULT_BOOTSTRAP_RELAYS;
  }

  public addRelay(url: string, read = true, write = true): boolean {
    const cleanUrl = url.trim().replace(/\/$/, '');
    if (!cleanUrl.startsWith('wss://') && !cleanUrl.startsWith('ws://')) {
      throw new Error('Relay URL must start with wss:// or ws://');
    }

    if (this.relays.some((r) => r.url === cleanUrl)) {
      return false;
    }

    this.relays.push({
      url: cleanUrl,
      read,
      write,
      status: 'connected',
    });

    this.saveRelays();
    this.notifyRelayListeners();
    return true;
  }

  public removeRelay(url: string): void {
    this.relays = this.relays.filter((r) => r.url !== url);
    this.saveRelays();
    this.notifyRelayListeners();
  }

  private saveRelays(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_RELAYS_KEY, JSON.stringify(this.relays));
    }
  }

  public async signEvent(event: UnsignedNostrEvent): Promise<SignedNostrEvent> {
    if (!this.hasExtension() || !window.nostr) {
      throw new Error('NIP-07 Nostr extension not available to sign events.');
    }

    const payload = {
      kind: event.kind,
      created_at: event.created_at || Math.floor(Date.now() / 1000),
      tags: event.tags,
      content: event.content,
      pubkey: this.pubkey || event.pubkey,
    };

    return await window.nostr.signEvent(payload);
  }

  /**
   * Publishes a signed event to all write relays in parallel.
   * SimplePool.publish() opens all WebSocket connections simultaneously and
   * returns Promise<string>[] — one per relay URL, resolving with the reason string on
   * success or rejecting on failure/timeout.
   */
  public async publishEvent(
    signedEvent: SignedNostrEvent,
    targetRelays?: string[]
  ): Promise<{ successfulRelays: string[]; failedRelays: string[] }> {
    const relaysToUse = targetRelays && targetRelays.length > 0 ? targetRelays : this.getWriteRelays();
    const successfulRelays: string[] = [];
    const failedRelays: string[] = [];

    const publishPromises: Promise<string>[] = this.pool.publish(relaysToUse, signedEvent);

    const results = await Promise.allSettled(publishPromises);

    results.forEach((res, idx) => {
      const relayUrl = relaysToUse[idx] ?? `relay-${idx + 1}`;
      if (res.status === 'fulfilled') {
        successfulRelays.push(relayUrl);
      } else {
        failedRelays.push(relayUrl);
      }
    });

    return { successfulRelays, failedRelays };
  }

  /**
   * Queries write relays for event IDs matching specific kinds published by the user.
   */
  public async fetchUserEventIds(pubkey: string, kinds: number[], limit = 1000): Promise<string[]> {
    const relays = this.getWriteRelays();
    try {
      const events = await this.pool.querySync(
        relays,
        { kinds, authors: [pubkey], limit },
        { maxWait: DISCOVERY_TIMEOUT_MS }
      );
      return events.map((e) => e.id);
    } catch (err) {
      console.warn('Failed to query user events for deletion:', err);
      return [];
    }
  }

  /**
   * Builds, signs, and broadcasts a NIP-09 Deletion Event (Kind 5) for a list of event IDs.
   */
  public async deleteEvents(
    eventIds: string[],
    reason = 'Deleting previously imported events via x2nostr',
    targetKind?: number
  ): Promise<{ successfulRelays: string[]; failedRelays: string[] }> {
    if (!this.pubkey || eventIds.length === 0) {
      return { successfulRelays: [], failedRelays: [] };
    }

    const unsigned = buildDeletionEvent(eventIds, reason, this.pubkey, targetKind);
    const signed = await this.signEvent(unsigned);
    return await this.publishEvent(signed);
  }

  public onAuthChange(listener: AuthListener): () => void {
    this.authListeners.add(listener);
    return () => {
      this.authListeners.delete(listener);
    };
  }

  public onRelaysChange(listener: RelayListener): () => void {
    this.relayListeners.add(listener);
    return () => {
      this.relayListeners.delete(listener);
    };
  }

  public onProfileChange(listener: ProfileListener): () => void {
    this.profileListeners.add(listener);
    return () => {
      this.profileListeners.delete(listener);
    };
  }

  private notifyAuthListeners(): void {
    this.authListeners.forEach((l) => {
      try {
        l(this.pubkey, this.npub);
      } catch (err) {
        console.error('Error in auth listener:', err);
      }
    });
  }

  private notifyRelayListeners(): void {
    this.relayListeners.forEach((l) => {
      try {
        l([...this.relays]);
      } catch (err) {
        console.error('Error in relay listener:', err);
      }
    });
  }

  private notifyProfileListeners(): void {
    this.profileListeners.forEach((l) => {
      try {
        l(this.profile);
      } catch (err) {
        console.error('Error in profile listener:', err);
      }
    });
  }
}

export const nostrService = new NostrService();

