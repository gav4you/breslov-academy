# Implementation Worksheet WS-0001
Source: `Breslov_Academy_Master_Plan_V11_Single_Source_of_Truth_500p.pdf` (PDF pp. 24-26, 41-50)

## Feature/Change ID
- WS-0001 / ARCH-SESSION-SSOT
- Registry key: N/A (session infrastructure)
- Legacy aliases: N/A

## Tenant Scope
- school-scoped session selection
- Entities touched: SchoolMembership, School, UserSchoolPreference
- Scope rule: activeSchoolId must be derived from memberships (no client-forged tenant_id)

## Entry Points
- `src/components/hooks/useSession.jsx`
- Portal routing: `src/components/routing/PortalGate.jsx`
- App portal landing: `src/portals/app/AppPortal.jsx`

## Access States
- N/A (session-only change, no lesson/material fetch)

## Security Controls
- Validates preferred school against membership list
- Avoids using stale localStorage school_id if not in memberships
- Audience derived from role + intended portal, not URL alone

## Performance
- Keeps session selection in memory + localStorage hint
- Avoids extra queries when no memberships
- No large list rendering in this change

## QA Tests
- Login with single membership: activeSchoolId set from preference or membership
- Login with multiple memberships: activeSchoolSource set to firstMembership and needsSchoolSelection true
- Stale localStorage school_id not in memberships: activeSchoolId cleared and reselected

## Rollback Plan
- Revert `useSession` changes and worksheet entry

## Sign-off
- Engineer:
- QA:
- Security:
