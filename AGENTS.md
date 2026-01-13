# Repository Guidelines

## Project Structure and Module Organization
- `src/`: React application code. Portals live under `src/portals/` (public, student, teacher, admin). Shared UI and logic live under `src/components/`.
- `functions/api/`: Cloudflare Pages Functions for auth, entities, integrations, and billing.
- `public/`: Static assets and prerendered marketing snapshots (generated at build).
- `tests/`: Unit tests in `tests/unit/*.test.mjs`; Playwright specs in `tests/*.spec.js`.
- `scripts/`: Automation for public prerendering, spec checks, integrity scans, and AI indexing.
- `docs/`: Release gates, spec pack, ops docs, and architecture notes.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server (uses `scripts/generate-public-pages.mjs` prehook).
- `npm run build`: Production build and SPA 404 copy.
- `npm run preview`: Serve the production build locally.
- `npm run lint` / `npm run lint:fix`: ESLint checks and fixes.
- `npm run typecheck`: TypeScript validation via `jsconfig.json`.
- `npm run test:unit`: Node test runner for unit tests.
- `npm run test:e2e`: Playwright end-to-end tests.
- `npm run perf:check`: Image budget check.
- `npm run spec:check`: Spec validation + parity sweep.

## Coding Style and Naming Conventions
- Use 2-space indentation and ES modules.
- React components in PascalCase; hooks use `useX` naming.
- Linting is enforced by ESLint (see `eslint.config.js`).
- Registry-first routing: add routes to `src/components/config/features.jsx` before `src/App.jsx`.
- School-scoped data must use scoped helpers (`scopedFilter`, `scopedList`); avoid direct entity calls for tenant data.

## Testing Guidelines
- Unit tests: `tests/unit/*.test.mjs` using Node test runner.
- E2E: Playwright specs in `tests/*.spec.js`.
- Portal smoke tests require auth state (`npm run seed:dev` and `npm run playwright:state`).

## Commit and Pull Request Guidelines
- Commit messages are short, imperative, and often use prefixes like `ci:` or `chore:` (e.g., "ci: add cloudflare pages auto-deploy workflow").
- Main is PR-only; required checks include `npm run lint`, `npm run spec:validate`, and `npm run spec:parity`.
- CODEOWNERS apply for sensitive areas (see `.github/CODEOWNERS`).

## Security and Configuration
- Store secrets in `.env.local` or `.dev.vars` (both gitignored).
- Cloudflare Pages Functions expect Turnstile, OIDC, and Stripe secrets; see `README.md` for env keys.
