# AGENT.md — Autonomous Agent Operating Guidelines for x2nostr

Welcome to **x2nostr** (`x2nostr.emre.xyz`). This document contains strict operational directives, coding standards, architecture protocols, and development workflows for all autonomous coding agents working on this codebase.

---

## 1. Golden Rules & Directives

1. **Product-Grade Quality Only**:
   - Every file, component, function, and module must be production-ready.
   - **Never leave `TODO`, `FIXME`, or placeholder stubs**. If you encounter incomplete logic, stop, rethink the architecture, and write the complete, robust implementation.

2. **Step-by-Step, Function-by-Function Execution**:
   - Build and refactor atomically.
   - Test and typecheck each function/service before proceeding to the next.

3. **Node.js Environment Protocol**:
   - Always run `nvm use` before executing any node, pnpm, or npm commands (reads `.nvmrc`).
   - Use `pnpm` as the package manager (`pnpm install`, `pnpm build`, `pnpm dev`).

4. **Nostr Protocol & NIP Standards Strictness**:
   - **NIP-07 (`window.nostr`)**: Client-side only. Check `window.nostr` existence before calling `getPublicKey()`, `signEvent()`, `getRelays()`.
   - **NIP-19**: Use `nostr-tools/nip19` for converting between hex pubkeys and `npub1...` Bech32 formats.
   - **NIP-51 Lists & Bookstr Shelves**: NIP-51 Bookmark Sets (Kind `30003` with `d` tags: `read`, `currently-reading`, `to-read` and clean `content: ""` for Coracle/NIP-51 clients) and Bookstr-native reading lists (Kinds `10073`, `10074`, `10075` with `["k", "isbn"]` and `["i", "isbn:..."]`).
   - **NIP-32 / Reviews**: Kind `31985` Parameterized Replaceable Events with `d: "isbn:<isbn>"`, `["k", "isbn"]`, and standard NIP-32 labels (`L`, `l`, `rating`, `rating/max`).

5. **Internationalization (i18n) Parity**:
   - Supported languages: **English (`en`) [Default]**, **Turkish (`tr`)**, **Spanish (`es`)**.
   - All user-facing strings must be routed through the translation dictionary. Never hardcode static text in components.
   - When adding a new key, update `src/locales/en.ts`, `src/locales/tr.ts`, and `src/locales/es.ts` simultaneously.

---

## 2. Architecture & Design Patterns

### 2.1. Client-Side Sovereign Execution
All authentication, cryptographic signing, and data migration happens directly inside the user's browser. No user credentials, private keys, CSV data, or personal records are ever transmitted to or stored on a backend server.

### 2.2. Pluggable Importer Plugin Contract
Every importer (Goodreads, Blogs, IMDb, Letterboxd, Twitter, Instagram, Spotify) implements the standard plugin interface:

```typescript
export interface ImporterPlugin<TRow, TEvent> {
  readonly id: string;
  readonly name: string;
  readonly descriptionKey: string;
  readonly icon: string;
  readonly targetPlatform: string;
  readonly status: 'active' | 'coming-soon' | 'beta';
  readonly acceptedFileTypes: string[];
  
  parseFile(file: File): Promise<TRow[]>;
  resolveMetadata?(row: TRow, onProgress?: (status: string) => void): Promise<TRow>;
  buildEvent(row: TRow, pubkey: string): Promise<TEvent> | TEvent;
}
```

### 2.3. Event Construction & Broadcasting Loop
1. Parse raw data into typed rows.
2. Enrich missing metadata via external API (with in-memory cache and polite rate-limiting).
3. Build unsigned Nostr event payload with timestamp, kind, and tags.
4. Await `window.nostr.signEvent(unsignedEvent)`.
5. Broadcast signed event to connected relays via `SimplePool.publish()`.
6. Stream real-time status to the UI progress bar and activity log console.

---

## 3. Subagent Strategy & Task Delegation

When working on complex multi-importer features:
- **Research Agent**: Inspect third-party schemas (e.g., Open Library API, TMDB API, Ghost JSON exports, Hugo frontmatter).
- **Core Agent**: Implement type-safe parsers and event builders.
- **UI/i18n Agent**: Implement responsive views, language dictionaries, and accessible controls.

---

## 4. Verification Checklist

Before reporting completion on any task:
- [ ] `nvm use && pnpm typecheck` passes with zero errors.
- [ ] `pnpm build` compiles clean production assets in `dist/`.
- [ ] All 3 locale dictionaries (`en`, `tr`, `es`) have 100% key parity.
- [ ] No `any` types without explicit justification; strict TypeScript throughout.
- [ ] Clean error handling for missing NIP-07 extensions, rate limits, and network disconnects.
