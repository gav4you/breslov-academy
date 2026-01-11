# Implementation Worksheet WS-0002
Source: `Breslov_Academy_Master_Plan_V11_Single_Source_of_Truth_500p.pdf` (PDF pp. 26, 41-50)

## Feature/Change ID
- WS-0002 / ROUTING-PORTALIZATION-LOGIN-ADMIN
- Registry key: LoginAdminPublic
- Legacy aliases: N/A

## Tenant Scope
- Public/global (no tenant-scoped entities)

## Entry Points
- `src/App.jsx` route surface (`/login/admin`)
- `src/portals/public/pages/LoginAdmin.jsx`
- `src/portals/public/pages/LoginChooser.jsx`
- `src/components/config/features.jsx`

## Access States
- N/A (public login entry point)

## Security Controls
- Intended audience and portal prefix set to admin
- Return URL sanitized to internal admin paths only

## Performance
- No large data lists; no query impact

## QA Tests
- Navigate to `/login/admin` and confirm intent keys set to admin
- Click login and verify redirect uses `/admin?loginRole=admin`
- Ensure `/login/admin` appears in route coverage via integrity check

## Rollback Plan
- Remove `/login/admin` route and `LoginAdmin` component
- Remove `LoginAdminPublic` registry entry

## Sign-off
- Engineer:
- QA:
- Security:
