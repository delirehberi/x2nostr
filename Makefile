SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

# Environment & NVM Loader
NVM_DIR ?= $(HOME)/.nvm
NVM_LOAD = set +u; export NVM_DIR="$(NVM_DIR)"; [ -s "$$NVM_DIR/nvm.sh" ] && \. "$$NVM_DIR/nvm.sh"; nvm use > /dev/null 2>&1 || true; [ -n "$${NVM_BIN:-}" ] && export PATH="$$NVM_BIN:$$PATH"; set -u

# Formatting Colors
CYAN   := \033[36m
GREEN  := \033[32m
YELLOW := \033[33m
RED    := \033[31m
BOLD   := \033[1m
RESET  := \033[0m

##@ Help & Diagnostics
.PHONY: help doctor
help: ## Display this help message
	@echo -e "$(BOLD)$(CYAN)x2nostr — Development & Build Tooling$(RESET)"
	@echo -e "Usage: $(YELLOW)make [target]$(RESET)\n"
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z0-9_-]+:.*?##/ { printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BOLD)$(CYAN)%s$(RESET)\n", $$1, $$2 } ' $(MAKEFILE_LIST)

doctor: ## Verify development environment, Node version (.nvmrc), and required tooling
	@echo -e "$(CYAN)[x2nostr] Running environment diagnostics...$(RESET)"
	@$(NVM_LOAD) && node -v >/dev/null 2>&1 && echo -e "  $(GREEN)✓$(RESET) Node.js: $$(node -v) (Expected: $$(cat .nvmrc 2>/dev/null || echo 'N/A'))" || echo -e "  $(RED)✗$(RESET) Node.js not detected"
	@$(NVM_LOAD) && command -v pnpm >/dev/null 2>&1 && echo -e "  $(GREEN)✓$(RESET) pnpm: $$(pnpm -v)" || echo -e "  $(YELLOW)!$(RESET) pnpm not found in PATH (will fallback to npx pnpm or local binaries)"
	@if [ -d "node_modules" ]; then echo -e "  $(GREEN)✓$(RESET) Dependencies: node_modules present"; else echo -e "  $(YELLOW)!$(RESET) Dependencies: node_modules missing (run 'make install')"; fi
	@echo -e "$(GREEN)✓ Environment diagnostics completed.$(RESET)"

##@ Setup & Dependencies
.PHONY: setup install clean-install outdated
setup: install ## Alias for install

install: ## Install package dependencies using pnpm
	@echo -e "$(CYAN)[x2nostr] Loading node environment and installing dependencies...$(RESET)"
	@$(NVM_LOAD) && pnpm install
	@echo -e "$(GREEN)✓ Dependencies installed successfully.$(RESET)"

clean-install: ## Perform fresh dependency installation from lockfile
	@echo -e "$(YELLOW)[x2nostr] Removing node_modules and performing fresh install...$(RESET)"
	@rm -rf node_modules
	@$(NVM_LOAD) && pnpm install --frozen-lockfile
	@echo -e "$(GREEN)✓ Fresh installation complete.$(RESET)"

outdated: ## Check for outdated dependencies
	@echo -e "$(CYAN)[x2nostr] Checking for outdated dependencies...$(RESET)"
	@$(NVM_LOAD) && pnpm outdated || true

##@ Development & Preview
.PHONY: dev dev-host preview
dev: ## Start Vite local development server
	@echo -e "$(CYAN)[x2nostr] Starting Vite dev server...$(RESET)"
	@$(NVM_LOAD) && ./node_modules/.bin/vite

dev-host: ## Start Vite dev server bound to 0.0.0.0 (for LAN/mobile testing)
	@echo -e "$(CYAN)[x2nostr] Starting Vite dev server bound to network host...$(RESET)"
	@$(NVM_LOAD) && ./node_modules/.bin/vite --host

preview: ## Preview production build locally in browser
	@echo -e "$(CYAN)[x2nostr] Starting Vite preview server...$(RESET)"
	@$(NVM_LOAD) && ./node_modules/.bin/vite preview

##@ Quality & Testing
.PHONY: typecheck verify-i18n test-unit test-watch test check
typecheck: ## Run TypeScript compiler typechecks (tsc --noEmit)
	@echo -e "$(CYAN)[x2nostr] Running TypeScript typecheck...$(RESET)"
	@$(NVM_LOAD) && ./node_modules/.bin/tsc --noEmit
	@echo -e "$(GREEN)✓ TypeScript typecheck passed with 0 errors.$(RESET)"

verify-i18n: ## Verify 100% translation key parity across en, tr, es
	@echo -e "$(CYAN)[x2nostr] Verifying i18n key parity (en, tr, es)...$(RESET)"
	@$(NVM_LOAD) && node scripts/verify-i18n.js
	@echo -e "$(GREEN)✓ Translation key parity verified across all locales.$(RESET)"

test-unit: ## Run Vitest automated unit test suite
	@echo -e "$(CYAN)[x2nostr] Running unit test suite (vitest)...$(RESET)"
	@$(NVM_LOAD) && ./node_modules/.bin/vitest run
	@echo -e "$(GREEN)✓ Unit tests completed successfully.$(RESET)"

test-watch: ## Run Vitest in interactive watch mode
	@echo -e "$(CYAN)[x2nostr] Starting Vitest watch mode...$(RESET)"
	@$(NVM_LOAD) && ./node_modules/.bin/vitest

test: typecheck verify-i18n test-unit ## Run all test and verification checks (typecheck, i18n, unit tests)
	@echo -e "$(GREEN)✓ All quality and verification checks passed.$(RESET)"

check: test ## Alias for test

##@ Build & Clean
.PHONY: build build-only clean clean-all distclean
build: typecheck verify-i18n ## Compile production-ready static assets to dist/ (runs checks first)
	@echo -e "$(CYAN)[x2nostr] Building production bundle with Vite...$(RESET)"
	@$(NVM_LOAD) && ./node_modules/.bin/vite build
	@echo -e "$(GREEN)✓ Production assets successfully generated in dist/$(RESET)"

build-only: ## Compile production assets directly without re-running checks
	@echo -e "$(CYAN)[x2nostr] Building production bundle (fast)...$(RESET)"
	@$(NVM_LOAD) && ./node_modules/.bin/vite build
	@echo -e "$(GREEN)✓ Fast build complete in dist/$(RESET)"

clean: ## Clean build output artifacts and caches
	@echo -e "$(YELLOW)[x2nostr] Cleaning dist/ and cache directories...$(RESET)"
	@rm -rf dist .vite
	@echo -e "$(GREEN)✓ Clean complete.$(RESET)"

clean-all: clean ## Clean build output artifacts and node_modules
	@echo -e "$(YELLOW)[x2nostr] Cleaning node_modules...$(RESET)"
	@rm -rf node_modules
	@echo -e "$(GREEN)✓ Deep clean complete.$(RESET)"

distclean: clean-all ## Alias for clean-all

##@ Deployment
.PHONY: deploy
deploy: build ## Deploy production build to Cloudflare Pages (x2nostr)
	@echo -e "$(CYAN)[x2nostr] Deploying to Cloudflare Pages (x2nostr.emre.xyz)...$(RESET)"
	@$(NVM_LOAD) && ./node_modules/.bin/wrangler pages deploy dist --project-name=x2nostr
