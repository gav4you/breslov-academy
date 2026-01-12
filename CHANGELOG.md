# Changelog

All notable changes to the Breslov Academy LMS project.

## [Unreleased] - 2026-01-12
### Security & SSO
- Added OIDC id_token validation (JWKS signature, issuer/audience, nonce) and stored nonce in AuthState.
- Added authenticated cleanup endpoint for expired AuthState/AuthSession (`/api/auth/cleanup`).
- Enforced role-based access in the Entities API for admin/staff-only resources while preserving invite acceptance flows.
- Corrected domain policy evaluation for SSO domain-match requirements.
- Added configurable rate limiting for auth, checkout, and download token issuance.

### Media & Submissions
- Added R2 presign flow for submission attachments with student-safe key prefixes.
- Enabled attachment uploads and secure downloads in student submissions and grading views.

### Integrations & Feature Flags
- Added integration connect endpoint with API-key support and persistent connection records.
- Wired marketplace badges to live connection status and gated nav items by feature flags.
- Extended lesson and quiz authoring to capture language metadata.

### Mobile, AI, and VR
- Added mobile bridge for deep links and push notification registration, plus notification token endpoints.
- Implemented offline cache storage with native/IndexedDB fallback and updated Offline UX.
- Added AI tutor RAG endpoint with optional OpenAI integration and indexing API.
- Wired AI tutor UIs to server responses with sources and access checks.
- Upgraded Virtual Beit Midrash with shared media screen, voice toggle, and local avatar movement.

### Frontend & Dependencies
- Replaced the lesson editor rich text component with a Markdown-friendly textarea.
- Aligned @react-three dependencies to React 18 compatibility and removed unused react-leaflet.
- Updated homepage smoke test heading to match current public marketing copy.
- Added CLI scripts for integrity export and AI indexing, and tightened integrity scan regexes.
- Added dev seed and Playwright storage-state scripts for authenticated portal QA runs.
- Fixed API base URL path joining to support absolute URLs with `/api` prefixes.

### QA & Docs
- Added unit tests for tenancy scoping, access gating, and billing idempotency.
- Added image size budget check script and integrity report sample.
- Published Phase 0 reality map docs (codebase, route map, registry dump, invariants).

## [v11.0] - 2026-01-11
### Future Horizons
- **Mobile Native:** Added Capacitor configuration (`capacitor.config.json`) and updated layout for safe-area insets (iOS/Android notches).
- **AI Tutor:** Implemented conversational AI study partner (`/ai-tutor`) with context-aware chat interface.
- **Virtual Beit Midrash:** Launched experimental 3D study hall (`/virtual-beit-midrash`) with avatars and shared screens.

## [v10.0] - 2026-01-11
### Major Upgrades
- **Feature Flags Framework:** Implemented per-school/user feature toggling with Admin UI (`/schoolfeatures`) and `useFeatureFlag` hook.
- **Integrations Marketplace:** Added a centralized App Store (`/integrations`) for managing third-party connections (Zoom, Discord, Stripe).
- **Multi-Language Support:** Enabled course authoring in 5+ languages and added student-facing language filters in the catalog.

## [v9.5] - 2026-01-11
### Storefront & Trust
- **School Landing:** Redesigned public landing pages with modern Hero, Benefits, Testimonials, and FAQ sections.
- **Pricing Page:** Upgraded pricing display to support tiered Subscriptions, Bundles, and Add-ons with "Best Value" indicators.
- **Trust Signals:** Added secure checkout badges and satisfaction guarantee visual elements.

## [v9.4] - 2026-01-11
### Integrity & Performance
- **Integrity Dashboard:** Revamped `/integrity` with real-time tenancy warning streams and source code scans.
- **Performance:** Implemented `React.lazy` code splitting for 40+ non-critical routes (Admin, Teacher, Labs).
- **Bundle Size:** Significantly reduced initial load size by deferring heavy modules.

## [v9.3] - 2026-01-11
### Advanced Gamification
- **Leaderboards:** Added global/weekly rankings with "Top Scholar" highlighting.
- **Achievements:** Visual badge grid with progress bars and "locked" states.
- **Study Buddies:** New peer matching interface with "Match Score" visualization.
- **Gamification Layout:** Unified sub-layout for social features.

## [v9.2] - 2026-01-11
### Design System & Shell
- **University-Grade UI:** Introduced "Calm" design tokens (serif typography, glass cards, semantic colors).
- **Portal Shell:** Replaced legacy `Layout.jsx` with `PortalLayout`, featuring adaptive sidebars and global command palette.
- **Skeleton Loaders:** Added content-aware loading states (`DashboardSkeleton`, `CourseDetailSkeleton`).
- **Module Polish:** Redesigned Student Dashboard, Course Detail, Lesson Viewer, and Teacher Dashboard.

## [v9.1] - 2026-01-10
### Stable Foundation
- **Portalization:** Split app into `/student`, `/teacher`, `/admin` route groups.
- **Security:** Implemented "Zero-Trust" tenancy enforcement via `tenancyEnforcer.js`.
- **CI/CD:** Fixed pipeline build errors and linting violations.
- **Registry:** Established `features.jsx` as the single source of truth for navigation.
