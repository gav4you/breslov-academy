# V11 Release Gates

Status: Draft
Last updated: 2026-01-11

Release gates are ship/no-ship checks. All P0 gates must be green.

## Gate A: Tenant Isolation + RBAC
- scoped helpers enforced for school-scoped entities
- tenancy enforcer installed in runtime
- role-based route guard blocks unauthorized access
- automated test proving cross-tenant reads fail

## Gate B: Core Learning Flows
- course catalog and course detail available for students
- lesson access rules enforced (FULL, PREVIEW, LOCKED, DRIP_LOCKED)
- protected materials never fetched when locked

## Gate C: Identity and SSO
- Google OIDC login works end-to-end
- Microsoft OIDC login works end-to-end
- domain policy enforces allowed domains

## Gate D: Billing and Monetization
- Stripe Connect onboarding for schools
- application fee applied per transaction
- pricing changes require approval and audit logging
- subscription status and webhooks handled

## Gate E: Marketing + Onboarding Funnel
- public home, school directory, login, signup
- school storefront and pricing pages
- onboarding wizard creates a usable tenant

## Gate F: Security, Reliability, and Observability
- audit logs for sensitive actions (pricing, publishing, roles)
- Turnstile protection on auth forms
- error logging with correlation ids
- CI runs lint + spec validation + parity sweep
- unit tests for tenancy/access/idempotency (`npm run test:unit`)
- image size budget check (`npm run perf:check`)
