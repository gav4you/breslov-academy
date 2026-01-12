# Recovery Guide

Last updated: 2026-01-12 (Phase 0 audit + QA artifacts)

## Quick Recovery Checklist
1) Registry + Vault: verify `src/components/config/features.jsx` and `src/pages/Vault.jsx`.
2) Routes: check `src/App.jsx`, `src/portals/app/AppPortal.jsx`, `src/pages.config.js`.
3) Tenancy scoping: use `src/components/api/scoped.jsx` and confirm `tenancyEnforcer.js` is installed via `src/api/base44Client.js`.
4) Content protection: ensure `useLessonAccess` gates material queries and `shouldFetchMaterials()` is used before content fetch.
5) Storefront: confirm `/s/:schoolSlug/*` routes and legacy query params via `useStorefrontContext`.
6) Integrity: run `/integrity` and resolve any registry/scoping warnings.
7) Integrity sample: compare `/integrity` JSON output with `docs/integrity-samples/v9.0.sample.json`.

## Critical Files (never delete)
- `src/components/config/features.jsx`
- `src/pages/Vault.jsx`
- `src/pages/Integrity.jsx`
- `src/components/api/scoped.jsx`
- `src/components/api/scopedEntities.js`
- `src/components/api/tenancyEnforcer.js`
- `src/components/api/tenancyRuntime.js`
- `src/components/api/TenancyBridge.jsx`
- `src/components/hooks/useLessonAccess.jsx`
- `src/components/protection/ProtectedContent.jsx`
- `src/components/security/AccessGate.jsx`
- `src/portals/shared/PortalLayout.jsx`
- `src/portals/shared/PortalSidebar.jsx`

## Local State Reset (if routing or tenancy feels stuck)
- Clear `localStorage` keys: `active_school_id`, `ba_intended_audience`, `ba_portal_prefix`, `referral_code`.
- Re-login to re-seed session and memberships.

## Commands
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

