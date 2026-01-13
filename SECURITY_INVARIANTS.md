# Security Invariants

These are **non-negotiable** rules enforced by architecture.

## Tenancy
- Any entity listed in `src/components/api/scopedEntities.js` is **school-scoped**.
- All creates/updates/deletes for school-scoped entities must use:
  - `scopedCreate`, `scopedUpdate`, `scopedDelete`
- Direct calls to `base44.entities.<SchoolScopedEntity>.create/update/delete` are forbidden.
- The runtime enforcer will block missing/incorrect `school_id`.

## Access
- Expiring entitlements must be checked with `isEntitlementActive`.
- Lesson access uses `useLessonAccess` (drip + preview + license add-ons).

## SSO
- OIDC id_token must pass JWKS signature, issuer/audience, and nonce validation before session creation.
- AuthState/AuthSession records are time-bound and subject to cleanup.

## Content protection
- Locked users must not receive full premium lesson content.
- Preview content must be strictly limited by policy.
- Watermarks must include user identity (email) when protected.
- Lesson and quiz payloads are sanitized server-side for non-entitled users (no full content leakage).
- AI tutor requests must be blocked and logged when content is locked.
- AI tutor context snippets must be derived from server-sanitized lesson content.

## Quizzes
- If questions are stored in `QuizQuestion`, do **not** fetch them when access is LOCKED.

## Bot protection
- Public auth and tenant application flows must enforce Turnstile verification when configured.
