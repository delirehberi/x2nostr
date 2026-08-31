# x2nostr — Move to Nostr ⚡

> **Universal, client-side sovereign data migration platform from centralized services to the Nostr protocol.**  
> 🌐 Live App: **[x2nostr.emre.xyz](https://x2nostr.emre.xyz)** • 📦 GitHub: **[github.com/delirehberi/x2nostr](https://github.com/delirehberi/x2nostr)**

[![CI](https://github.com/delirehberi/x2nostr/actions/workflows/ci.yml/badge.svg)](https://github.com/delirehberi/x2nostr/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Nostr NIP-07](https://img.shields.io/badge/Nostr-NIP--07-8A2BE2.svg)](https://github.com/nostr-protocol/nips/blob/master/07.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020.svg)](https://pages.cloudflare.com/)
[![i18n](https://img.shields.io/badge/Languages-EN%20%7C%20TR%20%7C%20ES-success.svg)](#-multilingual-support-i18n)

---

## 🌟 Why Move to Nostr?

Centralized platforms lock your memories, reviews, reading history, and social graph inside closed walled gardens. **x2nostr** empowers you to reclaim your sovereign digital identity:

- 🔐 **True Data Ownership**: Your reading logs, articles, and reviews are cryptographically signed with your private key and stored across permissionless relays.
- 🚫 **Censorship & Deplatforming Resistance**: No single company or algorithm can delete your account or shadowban your history.
- 🆔 **One Identity Across the Entire Internet**: A single Nostr public key (`npub`) connects you to reading apps, social networks, blog platforms, audio apps, and video streams.
- ⚡ **Native Monetization via Bitcoin Lightning (Zaps)**: Receive direct tips and micro-payments directly on your content without intermediaries.
- 🛡️ **100% Client-Side Sovereign Privacy**: All parsing, signing, and broadcasting occurs exclusively inside your browser sandbox. No passwords, private keys, or personal CSV records are ever sent to our servers.

---

## 🧭 The Nostr Ecosystem: What Apps Can You Use?

Once you migrate your data using **x2nostr**, your content is instantly accessible across the broader Nostr app universe:

| Category | Apps & Platforms | Nostr Kinds & NIPs |
| :--- | :--- | :--- |
| 📚 **Books & Reading** | [Bookstr.xyz](https://bookstr.xyz) | Kind `30003` (NIP-51 Bookmark Sets), Kinds `10073`-`10075`, Kind `31985` (NIP-32 Reviews) |
| 📝 **Long-Form Blogs** | [Ditto.pub](https://ditto.pub), [Yakihonne](https://yakihonne.com), [Highlighter](https://highlighter.com) | Kind `30023` (NIP-23 Articles) |
| 💬 **Microblogging & Social** | [Damus](https://damus.io) (iOS), [Amethyst](https://github.com/vitorpamplona/amethyst) (Android), [Primal](https://primal.net), [Coracle](https://coracle.social), [Snort](https://snort.social) | Kind `1` (Notes), Kind `6` (Reposts) |
| 🎵 **Music & Podcasts** | [Wavelake](https://wavelake.com), [Stemstr](https://stemstr.app) | Kind `30003` Playlists |
| 🎥 **Video & Streaming** | [ZapStream](https://zapstream.com), [Flare](https://flare.pub) | Kind `30311` (Live Events), Kind `20` |
| 🎬 **Movies & Reviews** | Nostr Cinema Trackers | Kind `30003` Sets & Kind `31985` (NIP-32 Reviews) |

---

## 🧰 Importers Catalog & Status

| Importer | Source Format | Target Nostr NIPs | Status |
| :--- | :--- | :--- | :--- |
| 📚 **Goodreads to Bookstr** | Goodreads CSV Export | NIP-51 (Kind `30003`), Bookstr (Kinds `10073`-`10075`), NIP-32 (Kind `31985`) | 🟢 **Active** |
| 🎬 **Filmler ve Diziler (IMDb & Letterboxd)** | IMDb & Letterboxd CSV | NIP-51 Curated Sets (Kind `30003`), NIP-32 Reviews (Kind `31985`) | 🟢 **Active** |
| 📝 **Uzun Format Bloglar** | Hugo / Ghost / WordPress / Markdown | NIP-23 Long-form Content (Kind `30023`) | 🟡 **Next Up** |
| 🎧 **Spotify Çalma Listeleri** | Spotify Playlists / Favorites CSV | NIP-51 Audio Sets (Kind `30003`) | 🟡 **Planned** |

See [ROADMAP.md](ROADMAP.md) for detailed milestone tracking.

---

## 🌐 Multilingual Support (i18n)

**x2nostr** supports full localization across multiple languages with 100% key parity:
- 🇬🇧 **English (`en`)** — Default
- 🇹🇷 **Türkçe (`tr`)** — Turkish
- 🇪🇸 **Español (`es`)** — Spanish

Switch languages instantly via the top navigation bar.

---

## 🤖 AI Contribution & Pull Request Size Policy

We warmly welcome contributions assisted by AI tools (LLMs, Copilots, Autonomous Coding Agents). However, to ensure every change can be thoroughly reviewed, audited, and tested:

> [!IMPORTANT]
> **Strict Diff Policy**: We **do not accept Pull Requests exceeding 500 lines of code changes (diff)**.
>
> If you are building a large feature, please break it down into clean, atomic PRs (e.g., PR 1: Parser & Unit Tests, PR 2: Event Builder, PR 3: UI View & Translations).

---

## 🚀 Local Development Quickstart

### Prerequisites
- Node.js 22+ (managed with `.nvmrc`)
- [pnpm](https://pnpm.io/) package manager
- A Nostr NIP-07 extension ([Alby](https://getalby.com/), [nos2x](https://github.com/fiatjaf/nos2x))

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/delirehberi/x2nostr.git
cd x2nostr

# 2. Use designated Node.js version
nvm use

# 3. Install dependencies
make install

# 4. Start local development server
make dev
```

### Quality & Verification Tooling

```bash
# Run all quality checks (TypeScript typecheck + i18n parity + Vitest suite)
make test

# Compile production-ready static assets in dist/
make build
```

---

## 🤝 Contributing & Community

- Read our [CONTRIBUTING.md](CONTRIBUTING.md) for architecture guidelines, plugin creation workflows, and testing expectations.
- Read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.
- Check [SECURITY.md](SECURITY.md) for security reporting and sovereign cryptographic guarantees.
- Join the conversation on [GitHub Discussions](https://github.com/delirehberi/x2nostr/discussions) or connect via Nostr.

---

## 📄 License

Distributed under the **MIT License**. Created with 💜 by [Emre Yılmaz](https://emre.xyz) ([@delirehberi](https://github.com/delirehberi)).
