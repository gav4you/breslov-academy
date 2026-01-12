# Implementation Worksheet WS-0006
Source: `Breslov_Academy_Master_Plan_V11_Single_Source_of_Truth_500p.pdf` (PDF pp. 21, 28, 38, 41-50)

## Feature/Change ID
- WS-0006 / V11-FUTURE-HORIZONS
- Registry key: AITutor, VirtualBeitMidrash, Offline
- Legacy aliases: N/A

## Tenant Scope
- Notification tokens + AI logs are school-scoped
- Entities touched: NotificationToken, AiRagIndex, AiTutorPolicyLog, AiTutorSession

## Entry Points
- `src/pages/Offline.jsx`
- `src/components/mobile/MobileBridge.jsx`
- `src/components/ai/AiTutorPanel.jsx`
- `src/components/hooks/useAITutor.js`
- `src/components/vr/VirtualBeitMidrash.jsx`
- `functions/api/ai/chat.js`
- `functions/api/ai/index.js`
- `functions/api/notifications/register.js`

## Access States
- AI tutor blocked for locked content (client + server)
- Offline downloads require entitlement/license checks

## Security Controls
- Server-side lesson sanitization via `_access.js`
- Membership checks for push token registration + AI requests
- RAG indexing restricted to staff roles

## Performance
- RAG sources capped and truncated
- Offline cache uses IndexedDB/native storage when available

## QA Tests
- `npm run test:unit` (tenancy, access gating, billing idempotency)
- `/integrity` report matches `docs/integrity-samples/v9.0.sample.json`
- AI tutor responds using lesson context; locked lessons reject AI requests
- Offline cache persists across reloads

## Rollback Plan
- Remove MobileBridge + AI endpoints and revert to local mock responses
- Delete AiRagIndex entries and disable offline storage abstraction

## Sign-off
- Engineer:
- QA:
- Security:
