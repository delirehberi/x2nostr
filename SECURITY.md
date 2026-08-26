# Security Policy

## 🔐 Sovereign Architecture & Security Guarantees

**x2nostr** is built from the ground up as a 100% sovereign client-side application:
- **No Private Keys Stored or Handled**: All cryptographic signing occurs via standard NIP-07 browser extensions (`window.nostr`).
- **No Centralized Data Ingestion**: User CSV files, reading logs, and exported data are parsed and transformed directly in the client's browser sandbox and never transmitted to our hosting infrastructure or third-party servers.
- **Direct Relay Communications**: Signed events are sent directly from your browser WebSocket connection to your configured Nostr relays.

---

## 🛡️ Supported Versions

We provide security updates and fixes for the latest release on the `master` branch and the live deployment at [x2nostr.emre.xyz](https://x2nostr.emre.xyz).

| Version / Branch | Supported          |
| ---------------- | ------------------ |
| `master` (Latest) | :white_check_mark: |
| Older tags / PRs | :x:                |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, parser sanitization flaw, or sensitive data leak, please report it responsibly rather than opening a public issue on GitHub.

- **Security Contact**: Emre Yılmaz ([emre@emre.xyz](mailto:emre@emre.xyz))
- **Subject Line**: `[SECURITY] x2nostr Vulnerability Report`

Please include:
1. A description of the issue and potential security impact.
2. Steps to reproduce the issue (including any sample sanitized CSV/export files).
3. Any proposed mitigations or patch suggestions if available.

We will acknowledge receipt within 48 hours and work with you to remediate the issue promptly.
