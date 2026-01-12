# V9 Tenancy + Access Invariants

This is the Phase 0 snapshot of non-negotiable tenancy and access rules.

## Tenancy Rules
- School-scoped entities are defined in `src/components/api/scopedEntities.js` and `functions/api/_tenancy.js`.
- All school-scoped writes must use `scopedCreate`, `scopedUpdate`, `scopedDelete`.
- Direct `base44.entities.<SchoolScopedEntity>.create/update/delete` is forbidden.
- `tenancyEnforcer.js` blocks unscoped reads/writes at runtime.

## Access Rules (Content Protection)
- Lesson access is computed via `useLessonAccess` (client) and `_access.js` (server).
- Locked lessons must never deliver full content; previews must be trimmed by policy.
- Quiz questions must not be returned when access is LOCKED (preview only if configured).
- AI tutor requests are blocked and logged when content is locked.

## Server Enforcement
- `functions/api/entities/*` sanitizes lessons + quiz questions based on entitlements.
- `functions/api/_access.js` applies policy-based truncation for previews.

## Audit + Logging
- Policy changes emit `AuditLog` entries (ContentProtectionSettings, Feature Flags, Integrations).
- Tenancy warnings are captured via `src/components/api/tenancyWarnings`.

## References
- Security invariants: `SECURITY_INVARIANTS.md`
- Access policy UI: `src/components/admin/ContentProtectionSettings.jsx`
