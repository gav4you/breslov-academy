# V9 Route Map

This is the canonical route surface used for Phase 0 audits.

## Public Marketing (Unauthenticated)
- `/` (PublicHome)
- `/about`, `/how-it-works`, `/pricing`, `/faq`, `/contact`
- `/privacy`, `/terms`
- `/login`, `/login/student`, `/login/teacher`, `/login/admin`
- `/signup`, `/signup/student`, `/signup/teacher`, `/signup/school`

## Public Storefront
- `/s/:schoolSlug/*` (school-branded sales pages, pricing, checkout)

## Authenticated Portals
- `/app/*` (generic app portal)
- `/student/*`, `/teacher/*`, `/admin/*`, `/superadmin/*`
- Portal gate/role enforcement: `src/components/routing/PortalGate.jsx`

## Legacy Compatibility
- Non-public, non-storefront routes redirect to `/app/*` via `src/portals/LegacyToAppRedirect.jsx`.
- Explicit aliases: `/legal/privacy` -> `/privacy`, `/legal/terms` -> `/terms`.

## References
- Router definition: `src/App.jsx`
- Legacy route map: `docs/v9.1-legacy-route-map.md`
