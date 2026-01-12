# V9 Codebase Map

This is the compact map used during Phase 0 audits. It complements `docs/REALITY_MAP.md`.

## Entry Points
- App bootstrap: `src/main.jsx`
- Router shell: `src/App.jsx`
- Portal router + page registry: `src/portals/shared/PortalPageResolver.jsx`, `src/pages.config.js`

## Portal Structure
- Public marketing: `src/portals/public/`
- Storefront (school-branded): `src/portals/storefront/`
- App shell: `src/portals/app/`
- Student/Teacher/Admin portals: `src/portals/student/`, `src/portals/teacher/`, `src/portals/admin/`
- Legacy redirects: `src/portals/LegacyToAppRedirect.jsx`

## Feature Registry + Vault
- Feature registry (SSOT): `src/components/config/features.jsx`
- Vault renderer: `src/pages/Vault.jsx`
- Sidebar/nav builder: `src/portals/shared/PortalSidebar.jsx`

## Tenancy + Access Enforcement
- Scoped helpers: `src/components/api/scoped.jsx`
- Runtime guard: `src/components/api/tenancyEnforcer.js`
- Access gating: `src/components/hooks/useLessonAccess.jsx`
- Server-side access sanitization: `functions/api/_access.js`

## Backend API (Cloudflare Functions)
- Auth + SSO: `functions/api/auth/`
- Entities CRUD: `functions/api/entities/`
- Integrations: `functions/api/integrations/`
- Media uploads (R2 presign): `functions/api/media/r2/presign.js`
- Billing/checkout: `functions/api/checkout/`, `functions/api/stripe/`

## Tests + Scripts
- Playwright smoke tests: `tests/public-smoke.spec.js`, `tests/portal-smoke.spec.js`
- Spec validation: `scripts/validate-v11-spec.mjs`

## Related Docs
- Reality map: `docs/REALITY_MAP.md`
- Repo snapshot: `docs/repo-snapshot.md`
