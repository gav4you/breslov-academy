# Implementation Worksheet Template
Source: `Breslov_Academy_Master_Plan_V11_Single_Source_of_Truth_500p.pdf` (PDF pp. 41-50)

## Purpose
Provide a repeatable, auditable worksheet for implementing a unit of work (feature, refactor, security
change) without regressions.

## Worksheet
Feature/Change ID:
- Unique ID; link to registry key; include legacy aliases if applicable.

Tenant Scope:
- school-scoped or global; list entities touched; ensure scoped queries/writes.

Entry Points:
- All routes/components where the change can be reached (including legacy).

Access States:
- FULL/PREVIEW/LOCKED/DRIP_LOCKED behavior; forbidden actions for each.

Security Controls:
- RBAC gates; ProtectedContent rules; download/license rules; audit events.

Performance:
- Query limits; caching keys include activeSchoolId; virtualization if list > 200.

QA Tests:
- Unit/integration/E2E; regression list; integrity report snapshot attached.

Rollback Plan:
- Switch flags; revert adapters; restore old route behavior; data safety.

Sign-off:
- Engineer + QA + Security reviewer initials/date.
