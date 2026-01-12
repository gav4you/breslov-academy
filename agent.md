# Agent Worklog

Status: Phases 0 through 11 completed.
Last updated: 2026-01-12

## Overview
This file summarizes the work completed across Phases 0-11 for the Breslov Academy repo.
It documents the security hardening, portalization, media/billing upgrades, integrations,
feature flags, i18n, mobile scaffolding, AI tutor RAG, VR updates, and release packaging.

## Phase 0: Reality lock + docs
- Added Phase 0 codebase, route, registry, and invariants docs:
  - docs/V9_CODEBASE_MAP.md
  - docs/V9_ROUTE_MAP.md
  - docs/V9_FEATURE_REGISTRY_DUMP.md (generated via scripts/dump-feature-registry.mjs)
  - docs/V9_TENANCY_ACCESS_INVARIANTS.md
- Added doc index updates in docs/README.md.
- Added public SEO metadata on the public home page:
  - src/portals/public/pages/PublicHome.jsx

## Phase 1-2: Portals + SSO hardening
- Portalization preserved with public, storefront, and role portals in src/App.jsx.
- OIDC flow hardened with provider configs, policy enforcement, PKCE, and auth state handling:
  - functions/api/auth/oidc/_providers.js
  - functions/api/auth/oidc/_policy.js
  - functions/api/auth/oidc/start.js
  - functions/api/auth/oidc/callback.js
- Added session lifecycle in functions/api/_auth.js and cleanup endpoint:
  - functions/api/auth/cleanup.js

## Phase 3-4: Teaching tools + integrations foundations
- Integration connect/disconnect endpoints and audit logging:
  - functions/api/integrations/connect.js
  - functions/api/integrations/disconnect.js
- Integration UI hooks and marketplace status wiring:
  - src/components/hooks/useIntegration.js
  - src/pages/IntegrationsMarketplace.jsx
  - src/pages/IntegrationDetail.jsx

## Phase 5-6: Media + billing
- R2 presigned upload/download endpoint with role enforcement:
  - functions/api/media/r2/presign.js
- Submission attachments wired to R2 in student and teacher flows:
  - src/pages/SubmissionForm.jsx
  - src/pages/TeachGrading.jsx
- Checkout idempotency and Stripe improvements:
  - functions/api/checkout/create.js
  - functions/api/stripe/checkout.js
  - functions/api/stripe/webhook.js

## Phase 7-8: Release packaging + QA artifacts
- Added unit tests:
  - tests/unit/access-gating.test.mjs
  - tests/unit/tenancy-scope.test.mjs
  - tests/unit/billing-idempotency.test.mjs
- Added image budget script:
  - scripts/check-image-sizes.mjs
- Added registry dump script:
  - scripts/dump-feature-registry.mjs
- Added integrity report sample:
  - docs/integrity-samples/v9.0.sample.json
- Updated release gates and recovery notes:
  - docs/v11/V11_RELEASE_GATES.md
  - RECOVERY.md

## Phase 9: Mobile native scaffolds
- Offline cache storage abstraction with native/IndexedDB/local fallback:
  - src/components/mobile/offlineStorage.js
  - src/pages/Offline.jsx
- Mobile deep link + push notification bridge:
  - src/components/mobile/MobileBridge.jsx
  - functions/api/notifications/register.js
  - functions/api/notifications/unregister.js
- NotificationToken entity added to tenancy scoping and admin gating:
  - src/components/api/scopedEntities.js
  - functions/api/_tenancy.js
  - functions/api/entities/[entity].js
  - functions/api/entities/[entity]/[id].js

## Phase 10: AI tutor RAG
- AI tutor server endpoint with lesson-context RAG and OpenAI support:
  - functions/api/ai/chat.js
- AI index endpoint for staff to build lesson tokens:
  - functions/api/ai/index.js
- AI tutor UI wired to server responses + sources:
  - src/components/ai/AiTutorPanel.jsx
  - src/components/hooks/useAITutor.js
  - src/components/ai/aiClient.js
- RAG index entity added to tenancy scope + admin gating:
  - src/components/api/scopedEntities.js
  - functions/api/_tenancy.js
  - functions/api/entities/[entity].js
  - functions/api/entities/[entity]/[id].js

## Phase 11: VR Beit Midrash upgrades
- Shared media screen with local URL controls.
- Microphone toggle with permissions handling.
- Local avatar movement using keyboard controls.
- Files:
  - src/components/vr/VirtualBeitMidrash.jsx

## Post-phase hardening
- Resolved React peer conflicts by aligning @react-three packages to React 18:
  - package.json (set @react-three/fiber ^8.17.10, @react-three/drei ^9.88.17)
- Removed unused react-leaflet dependency.
- Replaced ReactQuill with a markdown-friendly Textarea in the lesson editor:
  - src/pages/TeachLesson.jsx
- Removed unused React imports to satisfy lint:
  - src/components/mobile/MobileBridge.jsx
  - src/components/seo/MetaTags.jsx
- Improved integrity scans to avoid false positives and validate scoped entities:
  - src/pages/Integrity.jsx
  - src/components/system/codeScanner.js
- Added CLI helpers for integrity export and AI indexing:
  - scripts/run-integrity-scan.mjs
  - scripts/run-ai-index.mjs
- Added local QA helpers for portal auth:
  - scripts/seed-dev-data.mjs
  - scripts/create-playwright-state.mjs
- Fixed API base URL joining for absolute `/api` prefixes:
  - src/api/appClient.js

## Cross-cutting security and access
- Rate limiting helper + usage:
  - functions/api/_rateLimit.js
  - functions/api/auth/login.js
  - functions/api/auth/oidc/start.js
  - functions/api/auth/oidc/callback.js
  - functions/api/downloads/secure.js
  - functions/api/checkout/create.js
  - functions/api/stripe/checkout.js
- Access gating + server sanitization for lessons/quizzes:
  - functions/api/_access.js
  - functions/api/entities/[entity].js
  - functions/api/entities/[entity]/[id].js

## Feature flags + i18n
- Feature flags and admin feature manager updates:
  - src/components/config/featureFlags.js
  - src/components/config/features.jsx
  - src/pages/SchoolFeatures.jsx
  - src/portals/shared/PortalSidebar.jsx
- Lesson and quiz language metadata saved:
  - src/pages/TeachLesson.jsx
  - src/pages/TeachQuizEditor.jsx
  - src/components/academic/quizEngine.jsx

## Docs and status
- Updated README with env vars and QA commands.
- Updated SECURITY_INVARIANTS.md and ROADMAP_STATUS.md.
- Updated CHANGELOG.md for this release.

## Tests run
- npm run test:unit
- npm run perf:check
- npm run build
- npm run lint
- npm run typecheck
- npm run test:e2e
- npm run integrity:scan
- npm run ai:index
- npm run seed:dev
- npm run playwright:state
- npm run lint

## Notes
- Run /integrity and compare output with docs/integrity-samples/v9.0.sample.json.
- POST /api/ai/index with school_id to build the AI RAG index (or use npm run ai:index).
- Use npm run perf:check to validate image budgets.
- Playwright portal smoke tests require auth and are skipped without credentials.
- npm run ai:index is skipped until AI_INDEX_BASE_URL, AI_INDEX_TOKEN, and AI_INDEX_SCHOOL_ID are set.
