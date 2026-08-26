# Project Roadmap — x2nostr (x2nostr.emre.xyz)

This document outlines the phased development roadmap for **x2nostr**, tracking milestones from the initial Goodreads to Bookstr release to a comprehensive, multi-platform decentralized migration suite.

---

## Phase 1: Foundation, Landing Page & Goodreads Importer 🟢 *(Completed)*

- [x] **Project Scaffolding & Blueprint**:
  - Hono on Cloudflare Pages setup (`wrangler.toml` targeting `x2nostr.emre.xyz`).
  - TypeScript, Vite, Tailwind CSS v4, `.nvmrc` (Node 22+).
  - Autonomous agent operating documentation (`AGENT.md`, `ARCHITECTURE.md`).
- [x] **High-Converting Landing Page**:
  - Educational portal: "Why Move to Nostr?" (Data sovereignty, anti-censorship, universal `npub`, Lightning zaps).
  - Post-migration ecosystem showcase (Bookstr, Habla, Yakihonne, Damus, Amethyst, Primal, Wavelake, ZapStream).
  - Multilingual support (`en` default, `tr`, `es`) with live locale switcher.
- [x] **Nostr Authentication (NIP-07)**:
  - `window.nostr` extension login (`getPublicKey`, `getRelays`).
  - Bech32 `npub1...` format display and relay connectivity badge.
- [x] **Goodreads to Bookstr Importer**:
  - `PapaParse` CSV parser with Goodreads sanitization.
  - Open Library API resolver with in-memory caching and polite 350ms rate-limiting queue.
  - Book preview table with cover thumbnails, shelf status tags, and star ratings.
  - Modular Nostr event builder (NIP-51 Kind 30001 list events and reading status events).
  - Single-by-single signing loop with `window.nostr.signEvent()`.
  - Multi-relay broadcast via `nostr-tools/SimplePool` (Damus, nos.lol, nostr.band + custom relays).
  - Live progress bar, error handling, pause/resume, and activity log console.
- [x] **Importers Menu with Coming Soon Alerts**:
  - Interactive modal dialogs for Blog, IMDb, Letterboxd, Twitter, Instagram, and Spotify importers.

---

## Phase 2: Long-Form Blog Importer (NIP-23) 🟡

- [ ] **Supported Formats**:
  - Hugo (Markdown + YAML Frontmatter)
  - Blogspot / Blogger (XML export)
  - Ghost (JSON export)
  - WordPress (eXtended RSS XML)
- [ ] **Nostr Target**:
  - NIP-23 Kind `30023` Long-form Content Events.
  - Compatible with [Habla.news](https://habla.news), [Yakihonne](https://yakihonne.com), and [Highlighter](https://highlighter.com).
- [ ] **Features**:
  - Slug preservation, tags extraction, published timestamp backdating, image embedding preservation.

---

## Phase 3: Film & Cinema Importers (IMDb & Letterboxd) 🟡

- [ ] **Supported Formats**:
  - IMDb ratings & watchlist CSV exports.
  - Letterboxd diary, reviews, and lists CSV exports.
- [ ] **Metadata Resolution**:
  - The Movie Database (TMDB) API & Open Movie Database (OMDb) integration.
- [ ] **Nostr Target**:
  - NIP-51 Film Lists (Kind `30001` with `d` tags: `watched`, `watchlist`, `favorites`).
  - Film review & rating events (Kind `1985`).

---

## Phase 4: Social Media & Music Importers 🟡

- [ ] **Twitter / X Archive Importer**:
  - Ingestion of Twitter data archive (`tweets.js`).
  - Thread reconstruction into Nostr root notes and replies (Kind `1`).
- [ ] **Instagram Media Importer**:
  - Ingestion of Instagram photo & video archive.
  - Media hosting via NIP-96 / Blossom servers.
  - Picture post events (NIP-68 / Kind `20`).
- [ ] **Spotify Playlist & Favorites Importer**:
  - Ingestion of Spotify JSON/CSV track exports.
  - Track matching with decentralized music platforms ([Wavelake](https://wavelake.com), [Stemstr](https://stemstr.app)).
  - Music bookmark lists (Kind `30001`).

---

## Phase 5: Advanced Ecosystem & Reliability ⚪

- [ ] **Relay Sync & Verification**:
  - Post-migration event query to confirm successful relay indexing.
  - Batch republishing for missing events.
- [ ] **Offline & P2P Archive Exporter**:
  - Download signed Nostr events as JSONL archive for cold storage.
- [ ] **Self-Hosted Docker Image**:
  - Containerized deployment for self-hosters and local-only relay operators.
