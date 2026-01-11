# Routing & Portalization Audit
Source: `Breslov_Academy_Master_Plan_V11_Single_Source_of_Truth_500p.pdf` (PDF p. 26)
Status: Reviewed
Last updated: 2026-01-11

## Required Route Surfaces (PDF p. 26)
- Public marketing: `/`, `/about`, `/how-it-works`, `/faq`, `/contact`, `/privacy`, `/terms`
  - Status: Implemented in `src/App.jsx` with public layout.
- Login entry points: `/login/student`, `/login/teacher`, optional `/login/admin`
  - Status: Implemented; admin login added at `/login/admin`.
- Portals: `/student/*`, `/teacher/*`, `/admin/*`, `/superadmin/*`
  - Status: Implemented in `src/App.jsx` and portal route files.
- Storefront: `/s/:schoolSlug`, `/s/:schoolSlug/courses`, `/s/:schoolSlug/course/:courseId`,
  `/s/:schoolSlug/pricing`, `/s/:schoolSlug/checkout`, `/s/:schoolSlug/thank-you`
  - Status: Implemented in `src/portals/storefront/StorefrontPortal.jsx`.
- Legacy routes (e.g. `/Dashboard` vs `/dashboard`)
  - Status: Implemented via `src/portals/LegacyToAppRedirect.jsx` and case-insensitive matching in
    `src/portals/app/AppPortal.jsx` + `src/portals/shared/PortalPageResolver.jsx`.

## PortalGate Behavioral Contract (PDF p. 26)
- Reads session + audience intent
  - Status: `PortalGate` sets intent keys and reads session via `useSession`/`useAuth`.
- Enforces role gates before rendering portal shells
  - Status: `PortalGate` checks `allowedAudiences` and `requiresGlobalAdmin`.
- Normalizes activeSchoolId selection and blocks portals without active school when required
  - Status: `useSession` derives active school from memberships and `PortalGate` redirects to
    `/app/SchoolSelect` when needed.
- Portal-specific default nav + feature visibility
  - Status: `PortalLayout` uses the feature registry and audience override to scope nav.

## Follow-ups (non-blocking)
- Consider adding a portal-specific SchoolSelect route (optional) to keep portal context on redirect.
