paymentAPI.getTransactions()
# 🎬 Cineranda User Frontend

> Premium streaming experience for Cineranda subscribers. Built with React 18, TypeScript, and Vite, themed around the brand’s black, yellow (`#FFD700`), and red (`#E50914`) palette.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Status](https://img.shields.io/badge/Build-Ready-success)

This repository contains the entire user-facing application: landing, catalog browsing, purchase flow, wallet, and video playback surfaces. It already includes production-grade authentication, an opinionated API layer, responsive UI components, and contextual documentation so any contributor can get productive quickly.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [NPM Scripts](#npm-scripts)
6. [Project Structure](#project-structure)
7. [Configuration & Environment](#configuration--environment)
8. [Architecture & Data Flow](#architecture--data-flow)
9. [Feature Highlights](#feature-highlights)
10. [API Layer & Backend Integration](#api-layer--backend-integration)
11. [Styling & Design System](#styling--design-system)
12. [Testing & Quality](#testing--quality)
13. [Deployment Checklist](#deployment-checklist)
14. [Troubleshooting](#troubleshooting)
15. [Additional References](#additional-references)

---

## Overview

- **Goal:** Deliver a Netflix-grade UX tailored to the Rwandan market with localized payment flows (Flutterwave + coin wallet) and a curated library of premium titles.
- **Status:** Core layout, authentication, browsing, wallet, and media discovery features are live. Search, wallet screens, and the watch experience share a unified design language and are responsive down to 360px.
- **Key Documents:**
   - `USER_FRONTEND_REQUIREMENTS.md` – end-to-end product spec
   - `PROJECT_SUMMARY.md`, `IMPLEMENTATION_PLAN.md` – phased roadmap context
   - Postman collection `Cineranda API (Complete).postman_collection.json` – backend contract

---

## Tech Stack

| Layer | Tooling |
| --- | --- |
| Framework | React 18 (SPA) + React Router v6 |
| Language | TypeScript (strict typing) |
| Build Tooling | Vite 5 + SWC, pnpm/npm-compatible |
| Styling | CSS Modules + global tokens in `src/styles` |
| HTTP & Data | Axios instance with interceptors, React Context for auth/session |
| Video | `video.js` + custom controls (Watch page) |
| Notifications | `react-toastify` |
| Testing | Vitest + Testing Library + jsdom |

---

## Prerequisites

- **Node.js 18.17+** (LTS) and npm 9+ (or pnpm/yarn if preferred).
- **Git** for version control.
- **Backend API** reachable locally or remotely (default dev proxy assumes `http://localhost:5000/api/v1`).
- Optional: **Flutterwave sandbox keys** for testing purchase flows.

> Windows users can run `./setup.ps1`; macOS/Linux users can run `./setup.sh` to automate dependency installation and `.env` scaffolding.

---

## Quick Start

```bash
git clone https://github.com/CineRanda-Rwanda/user-frontend.git
cd user-frontend
npm install

# Copy and customize environment variables
cp .env.example .env

# Start Vite dev server (http://localhost:5173 by default)

```

### Environment template

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_PAYMENT_PROVIDER=FLUTTERWAVE
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxx
VITE_CDN_URL=https://cdn.cineranda.com

# Optional: machine-translation fallback for admin-provided English content
# Requires a running LibreTranslate instance (self-hosted recommended)
VITE_TRANSLATION_ENABLED=false
VITE_TRANSLATION_PROVIDER=libretranslate
# Default uses 5001 to avoid clashing with a typical backend dev server on 5000.
VITE_LIBRETRANSLATE_URL=http://localhost:5001
```

> Update `VITE_API_BASE_URL` to point to staging/production backends when deploying; all HTTP modules use this single source of truth.

---

## NPM Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Launch Vite in development mode with hot module reload |
| `npm run build` | Type-check (`tsc`) then generate optimized production bundle |
| `npm run preview` | Serve the built assets locally to verify production output |
| `npm run lint` | Run ESLint with TypeScript support; fails on warnings |
| `npm run test` | Execute Vitest unit/integration tests in watch or CI mode |

> `vite.config.ts` enables module aliasing (e.g. `@/components`) and configures the dev proxy if you need to forward `/api` calls to a local backend.

---

## Project Structure

```
user-frontend/
├── src/
│   ├── api/                # Axios instance + grouped REST clients (auth, content, wallet, etc.)
│   ├── components/
│   │   ├── common/         # Shared primitives (Loader, ScrollToTop, etc.)
│   │   ├── content/        # Carousel, cards, hero rows, continue-watching rail
│   │   ├── layout/         # Navbar, Footer, Layout wrapper
│   │   ├── search/         # GlobalSearchBar, filter panel, sort dropdowns
│   │   ├── ui/             # Button, Input, Modal, Skeleton, ProgressBar
│   │   └── wallet/         # Wallet-specific widgets
│   ├── contexts/           # `AuthContext` with login/register/verify flows
│   ├── pages/              # Route-level screens (Browse, Movies, Series, Watch, Wallet, etc.)
│   ├── styles/             # Global CSS, variables, animation helpers
│   ├── types/              # Content, user, payment, auth interfaces
│   └── utils/              # Formatters, validators, constants, storage keys
├── public/                 # Static assets served as-is (favicons, logos)
├── setup.ps1 / setup.sh    # One-command bootstrap scripts
├── tsconfig*.json          # TS + path aliases shared by Vite and IDEs
├── vite.config.ts          # Vite, React plugin, dev proxy, build options
└── README.md               # You are here
```

Each folder is self-sufficient; components import styles through CSS Modules (e.g., `ContentRow.module.css`) and keep business logic close to UI definitions for clarity.

---

## Configuration & Environment

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | ✅ | Base URL for all REST calls (e.g., `https://api.cineranda.com/api/v1`). Must include `/api/v1` if backend expects it. |
| `VITE_PAYMENT_PROVIDER` | ✅ | Currently `FLUTTERWAVE`. Enables provider-specific UI copy. |
| `VITE_FLUTTERWAVE_PUBLIC_KEY` | ✅ for live payments | Injected into payment modals for Flutterwave inline flows. |
| `VITE_CDN_URL` | Optional | Overrides default CDN root for posters, banners, and streaming assets. |

- Use `.env.local` for developer-specific overrides; never commit secrets.
- For CI/CD, surface these variables via your hosting provider or container orchestrator.
- `src/utils/constants.ts` exposes typed constants that read from `import.meta.env.*`, so updates propagate automatically.

---

## Architecture & Data Flow

- **Routing:** `App.tsx` lazy-loads every route behind `<Suspense>` to shrink the initial bundle. Protected routes wrap Watch/MyLibrary/Wallet/Profile while Browse, Movies, Series, Search are public for marketing discovery.
- **State & Auth:** `AuthContext` stores the hydrated `User`, login/register/verify workflows, refresh logic, and exposes helpers to update profile data. Tokens persist in `localStorage` using `STORAGE_KEYS` constants.
- **API Access:** `src/api/axios.ts` centralizes interceptors, adds bearer tokens, refreshes access tokens on 401s, and shows toast notifications on server errors. Feature-specific modules (content, wallet, payment, ratings, watchHistory) keep endpoint details isolated from UI components.
- **UI Composition:** Layout -> Page -> Feature components pattern. Example: `Browse` uses `Layout`, fetches data through `contentAPI`, and renders `AnimatedCarousel`, `ContentRow`, and `ContinueWatching` rails.
- **Modularity:** Most data-fetching functions return raw Axios responses to retain pagination metadata; pages normalize shapes before passing to components (see `Browse.tsx`).
- **Testing Harness:** `src/setupTests.ts` configures Testing Library + vitest DOM matchers; co-located tests live under `src/pages/__tests__` and can be added alongside components for better coverage.

---

## Feature Highlights

- **Authentication & Verification** (`src/pages/Auth/*`, `contexts/AuthContext.tsx`)
   - Email/password login, registration with verification code step, token refresh, guarded navigation, toast-based feedback.
- **Content Discovery** (`pages/Browse.tsx`, `components/content/*`)
   - Animated hero carousel, trending/new release rails, movie/series segregation, continue-watching shelf when authenticated.
- **Category Hubs** (`pages/Movies.tsx`, `pages/Series.tsx`)
   - Dedicated views with filters/sorting hooks that reuse `ContentRow` and `ContentCard` patterns.
- **Search Experience** (`components/search/*`, `pages/Search.tsx`)
   - Unified search bar, advanced filter panel (type, genre, pricing, year), responsive dropdown clustering, debounced requests, improved mobile layout (see recent `GlobalSearchBar.module.css` update).
- **Watch & Trailer Playback** (`pages/Watch.tsx`, `pages/TrailerPlayer.tsx`, `components/content/ContinueWatching.tsx`)
   - `video.js` integration, watch-history sync (save every 5 seconds), resume states, and cinematic trailer overlay.
- **Wallet & Payments** (`pages/Wallet.tsx`, `components/wallet/Wallet.tsx`, `api/payment.ts`, `api/wallet.ts`)
   - Balance overview, coin purchase flow, Flutterwave initiation/polling, transaction history cards.
- **Notifications & Feedback** (`react-toastify`, `components/common/Loader.tsx`, `components/ui/Skeleton.tsx`)
   - Consistent user feedback for loading/error states, skeleton placeholders for cards, and toast-based success/error messaging.
- **Responsive Design & Accessibility**
   - CSS Modules follow a tokenized spacing/typography system (`src/styles/global.css`). Layouts collapse elegantly; buttons respect minimum touch targets; focus states are preserved for keyboard navigation.

---

## API Layer & Backend Integration

- **Axios Instance (`src/api/axios.ts`):**
   - Adds `Authorization` headers when tokens exist.
   - Retries the original request after automatic refresh using `/auth/refresh-token`.
   - Centralizes timeout (30s) and toast-based error messaging.
- **Modules:**
   - `auth.ts` – login/register/verify/logout flows.
   - `content.ts` – listing, search, details, recommendations.
   - `user.ts` – profile, library, transactions, watch history.
   - `wallet.ts` / `payment.ts` – balance, coin purchases, Flutterwave initiation.
   - `watchHistory.ts` – progress syncing for “Continue Watching”.
   - `ratings.ts` – submit/view community ratings.
- **Contracts & Testing:**
   - Use the Postman collection `Cineranda API (Complete).postman_collection.json` to validate endpoints or mock responses when the backend is unavailable.
   - Update `API_ENDPOINTS_ANALYSIS.md` when backend contracts change; the README intentionally links there for deeper reference.

> During development, run the backend on `http://localhost:5000`; Vite’s dev server proxies API requests through `import.meta.env.VITE_API_BASE_URL` so there are no manual CORS tweaks.

---

## Styling & Design System

- **Tokens:** Defined in `src/styles/global.css` / `variables.css` (colors, typography, spacing, blur radii). Components consume them via CSS custom properties.
- **Modules:** Every feature has a dedicated `*.module.css` file to avoid class collisions. Example: `ContentRow.module.css`, `GlobalSearchBar.module.css`.
- **Themes:** Dark base with gradients, card blurs, and neon accent glows. Buttons use yellow for primary CTAs, red for destructive/purchase flows.
- **Animations:** Keyframes defined in `styles/animations.css` for hero carousels, hover lifts, shimmer skeletons.
- **Accessibility:** Font sizes scale with the viewport; interactive elements include focus outlines; toast notifications include ARIA roles via `react-toastify` defaults.

---

## Testing & Quality

```bash
# Unit / integration tests
npm run test          # watch mode
npm run test -- --run # single run for CI

# Static analysis
npm run lint
npx tsc --noEmit      # strict type checking without emitting JS
```

- `src/setupTests.ts` wires up Testing Library matchers (e.g., `toBeInTheDocument`).
- Store component-level tests next to their source (`ComponentName.test.tsx`) or under `pages/__tests__` for route-level flows.
- For API mocking, rely on `vi.mock('@/api/...')` or bring in `msw` if you need network-level simulations.

---

## Deployment Checklist

1. **Environment:** Provide production `.env` (API base URL, payment keys, CDN root, analytics IDs if applicable).
2. **Build:** `npm run build` – outputs to `dist/`.
3. **Preview:** `npm run preview` – sanity-check bundle locally.
4. **Hosting:** Upload `dist/` to Netlify, Vercel, CloudFront/S3, or any static host. Ensure SPA fallback rewrites `/* -> /index.html`.
4a. **LibreTranslate (recommended for Vercel):** Use the included Vercel Serverless Function proxy at `/api/translate`.
   - Set `VITE_LIBRETRANSLATE_URL` to your app origin endpoint: `https://<your-vercel-domain>/api/translate`.
   - Set a server-side env var on Vercel (NOT prefixed with `VITE_`): `LIBRETRANSLATE_URL=https://<your-libretranslate-host>`.
   - This avoids browser CORS issues and keeps your LibreTranslate host URL out of the client bundle.
5. **Security:**
    - Serve over HTTPS.
    - Configure CSP headers (see `USER_FRONTEND_REQUIREMENTS.md` §16).
    - Confirm Flutterwave redirect/callback URLs match production domain.
6. **Monitoring:** Enable analytics/error reporting (Sentry, LogRocket) if required by stakeholders.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `Network Error` on API calls | Wrong `VITE_API_BASE_URL` or backend offline | Verify `.env`, restart dev server after changes |
| Stuck on loading spinner after login | Refresh token missing/expired | Clear `localStorage`, log in again; inspect `/auth/refresh-token` response |
| Flutterwave modal never opens | Missing `VITE_FLUTTERWAVE_PUBLIC_KEY` | Populate key in `.env`, rebuild |
| Styles look double-bordered search bar | Use updated `GlobalSearchBar.module.css`; ensure CSS modules compiled (restart dev server) |
| Tests fail with DOM errors | Vitest not running in jsdom | Ensure `test` config uses jsdom (defaults applied via `setupTests.ts`) |

---

## Additional References

- `USER_FRONTEND_REQUIREMENTS.md` – authoritative feature-by-feature blueprint.
- `API_AUDIT_REPORT.md`, `API_INTEGRATION_UPDATE.md` – backend alignment notes.
- `FRONTEND_REFACTOR_SUMMARY.md`, `DEVELOPMENT_GUIDE.md` – historical decisions and coding conventions.
- `CHECKLIST.md`, `PROJECT_SUMMARY.md` – release and QA checklists.

For new contributors: skim the documents above, run through Quick Start, then pick up issues referencing the relevant sections in `USER_FRONTEND_REQUIREMENTS.md`. Consistent adherence to the design system and module boundaries keeps this codebase maintainable.

---

**Built with ❤️ for the Cineranda community.**
## 🔌 API Integration
