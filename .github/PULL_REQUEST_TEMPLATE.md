## 📝 Description

Please provide a concise description of the changes made and the motivation behind them.

---

## 🔍 PR Size & AI Contribution Checklist

> [!IMPORTANT]
> **Strict Diff Policy**: To keep reviews thorough and manageable, PRs exceeding **500 lines of code changes (diff)** will not be accepted. Please break large changes into smaller, reviewable PRs.

- [ ] This PR contains fewer than **500 lines of diff** (or is an approved single data/mock asset addition).
- [ ] If AI coding tools were used, the generated code has been fully reviewed, understood, and manually tested by the author.

---

## ✅ Quality & Verification Checklist

- [ ] `nvm use && make test` passes with zero errors:
  - [ ] TypeScript typecheck (`tsc --noEmit`) passes with 0 errors.
  - [ ] Translation key parity check (`scripts/verify-i18n.js`) passes across all 3 locales (`en`, `tr`, `es`).
  - [ ] Vitest unit tests pass (`pnpm test`).
- [ ] `make build` compiles production assets cleanly in `dist/`.
- [ ] All new user-facing strings are added to `src/locales/en.ts`, `src/locales/tr.ts`, and `src/locales/es.ts`.
- [ ] No sensitive keys or user credentials are leaked or stored.

---

## 📸 Screenshots or Recordings (if UI changes were made)

*Attach screenshots or screencasts demonstrating before/after UI behavior.*
