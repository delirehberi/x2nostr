# Contributing to x2nostr ⚡

Thank you for your interest in contributing to **x2nostr**! We are building a universal, sovereign, client-side data migration bridge from centralized platforms to the Nostr protocol.

---

## 🤖 AI Contribution Policy & Pull Request Guidelines

We explicitly welcome contributors using AI assistants, LLMs, and autonomous coding agents (such as Claude, ChatGPT, GitHub Copilot, Gemini/Antigravity, Cursor, etc.). 

However, to maintain high code quality and make review manageable:

> [!IMPORTANT]
> **Strict Diff Limit**: We **do not accept Pull Requests exceeding 500 lines of code changes (diff)**.
> 
> Massive, multi-thousand-line AI dumps are difficult to review and audit for security and sovereign client-side guarantees. If your feature is large:
> 1. Break it down into small, atomic, step-by-step PRs.
> 2. Submit parsers, event builders, and UI components in sequential, manageable PRs.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 22+ (configured via `.nvmrc`)
- **Package Manager**: `pnpm` (or `npm`)
- **Make**: For unified development tooling (`make help`)
- **Browser Extension**: A NIP-07 extension (e.g. [Alby](https://getalby.com/), [nos2x](https://github.com/fiatjaf/nos2x)) for live Nostr testing.

### Local Setup

```bash
# 1. Fork & clone repository
git clone https://github.com/YOUR-USERNAME/x2nostr.git
cd x2nostr

# 2. Use required Node.js version and install dependencies
nvm use
make install

# 3. Start local development server
make dev
```

Visit `http://localhost:5173` in your browser.

---

## 🏛️ Core Architecture Principles

1. **100% Sovereign Client-Side Execution**:
   - All parsing, credential handling, cryptographic signing (`window.nostr.signEvent`), and relay broadcasting happen directly in the user's browser.
   - **Never send private keys, user passwords, or raw CSV records to any remote server or backend.**

2. **Nostr Protocol Standard (NIPs)**:
   - **NIP-07**: Client-side signing via `window.nostr`.
   - **NIP-19**: Use `nostr-tools/nip19` for Bech32 `npub` / `note` conversions.
   - **NIP-51 Lists**: Kind `30003` Bookmark Sets and Bookstr-native lists (Kinds `10073`, `10074`, `10075`).
   - **NIP-32**: Kind `31985` parameterized review and rating events.
   - **NIP-23**: Kind `30023` long-form blog posts.

3. **Multilingual (i18n) Parity**:
   - We support **English (`en`)**, **Turkish (`tr`)**, and **Spanish (`es`)**.
   - Any new user-facing string must be added to all 3 dictionary files: `src/locales/en.ts`, `src/locales/tr.ts`, and `src/locales/es.ts`.
   - Verify parity by running `make verify-i18n`.

---

## 🧩 Adding a New Importer Plugin

To add a new platform importer (e.g., Spotify, Ghost, Substack):

1. **Define Types & Contract**: Implement the `ImporterPlugin<TRow, TEvent>` interface in `src/importers/base.ts`.
2. **Implement Parser**: Create `src/importers/<platform>/parser.ts` to parse the export file (CSV, JSON, XML).
3. **Event Builder**: Create `src/importers/<platform>/event-builder.ts` to build standard Nostr unsigned events (NIP-51, NIP-32, NIP-23, etc.).
4. **Pipeline**: Assemble the flow in `src/importers/<platform>/pipeline.ts`.
5. **UI View**: Add the importer view in `src/ui/components/<platform>-view.ts` and register in `src/ui/components/importer-menu.ts`.
6. **Tests**: Add unit tests in `tests/<platform>-parser.test.ts` and `tests/<platform>-event-builder.test.ts`.
7. **Translations**: Add corresponding keys across `src/locales/en.ts`, `src/locales/tr.ts`, and `src/locales/es.ts`.

---

## 🧪 Verification & Testing

Before submitting a Pull Request, ensure all quality checks pass:

```bash
# Run all quality checks: typecheck, i18n parity check, and unit test suite
make test

# Test production build
make build
```

---

## 📋 Pull Request Process

1. Create a descriptive branch: `git checkout -b feat/my-new-feature` or `fix/csv-quote-parsing`.
2. Keep changes focused and under **500 lines of diff**.
3. Commit with clear, meaningful commit messages following Conventional Commits (e.g., `feat: add Letterboxd CSV parser`, `fix: handle empty ISBN tags`).
4. Ensure all CI checks pass on your PR.
5. Provide screenshots or video recordings in the PR description for UI changes.

Thank you for helping liberate personal data to Nostr! ⚡
