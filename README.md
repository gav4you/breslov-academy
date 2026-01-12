# Breslov Academy LMS

**Version:** 11.0 Future Horizons
**Architecture:** Multi-Tenant, Portalized, Registry-Driven, Lazy-Loaded, Native-Ready
**Status:** Strategic Baseline Synchronized (2026-01-11)

## Primary Source of Truth
- **[STRATEGIC MASTER PLAN V11.0](./MASTER_PLAN_V11_FULL_SPEC.md):** The unified, synthesized project roadmap and architectural specification.
- **[MASTER PLAN BOOK (PDF)](./BRESLOV_ACADEMY_MASTER_PLAN_V11_BOOK.pdf):** Consolidated historical and current documentation with an SSOT executive summary.
- **[Gemini Context](./GEMINI.md):** AI agent instructions and architectural invariants.
- **[SSOT-Aligned Roadmap](./ROADMAP.md):** Quarter-based roadmap aligned to the SSOT PDF.

## V11 Spec Pack and Release Discipline
- **[V11 Spec Pack](./docs/v11/README.md):** Master feature index, domain model, acceptance criteria, release gates, migration plan.
- **[Base44 + GitHub Release Discipline](./docs/ops/BASE44_GITHUB_RELEASE_MODEL.md):** Branch model and required checks.
- **[Repo Rename Log](./docs/branding/NAME_CHANGE.md):** Breslov Academy -> Breslov University rename checklist.

## Unified Strategic Goal
Transition from a legacy single-tenant LMS into a premier, multi-tenant white-label platform for high-trust Torah education. Deliver a "WOW" academic experience through immersive 3D study (VR), conversational AI tutoring, and airtight content protection.

## Key Features (v11.0 Complete)

### 🚀 Next-Gen Experiences
- **Mobile Native:** Capacitor configuration and safe-area aware layout for iOS/Android wrapping.
- **AI Tutor:** Context-aware conversational agent (`/ai-tutor`) for personalized study assistance.
- **Virtual Beit Midrash:** Immersive 3D multiplayer study environment (`/virtual-beit-midrash`) built with React Three Fiber.

### 🏢 Enterprise Capabilities
- **Feature Flags:** Decoupled deployment from release. Admins can toggle optional features (AI Tutor, Gamification) via `/schoolfeatures`.
- **Integrations Marketplace:** Dedicated App Store for connecting Zoom, Discord, Stripe, and more.
- **Multi-Language Support:** Courses can be authored and filtered by language (English, Hebrew, Spanish, etc.).

### 🎨 University-Grade Design System
- **Calm UI:** "Calm" gradients, glassmorphism cards (`GlassCard`), and serif typography for a premium academic feel.
- **Portal Shell:** Unified `PortalLayout` replacing legacy shells, featuring adaptive sidebars and global command palette.
- **Skeletons:** Content-aware loading states (`DashboardSkeleton`, `CourseDetailSkeleton`) for perceived performance.

### 🏆 Gamification & Social
- **Leaderboards:** Global and time-based rankings with "Top Scholar" highlighting.
- **Achievements:** Visual badge collection grid with progress tracking.
- **Study Buddies:** Peer matching system with "Match Score" and accountability tools.

### 🛡️ System Integrity
- **Diagnostics:** Real-time `/integrity` dashboard for admins to detect registry drift and tenancy leaks.
- **Tenancy Guard:** Runtime enforcement of `school_id` scoping via `tenancyEnforcer.js`.
- **Content Protection:** Strict gating of `LOCKED` and `DRIP_LOCKED` materials.

## Portal Structure
- **Public Site:** `/` (Marketing, generic landing)
- **Storefront:** `/s/:schoolSlug` (Tenant-branded sales pages)
- **Student Portal:** `/student` (Dashboard, Learning, Quizzes, Social, AI, VR)
- **Teacher Portal:** `/teacher` (Course Builder, Analytics, Grading)
- **Admin Portal:** `/admin` (Monetization, Staff, Integrity, Settings)

## Getting Started
1. **Install:** `npm install`
2. **Run:** `npm run dev`
3. **Verify:** Visit `/integrity` (as admin) to check system health.
4. **Export Integrity:** `npm run integrity:scan` (updates `docs/integrity-samples/v9.0.sample.json`)
5. **Build:** `npm run build` (generates `dist/`)
6. **QA:** `npm run test:unit` and `npm run perf:check`
7. **Portal QA (optional):** seed + auth state for Playwright portal smoke tests.
   - `npm run seed:dev` (requires a running API server)
   - `npm run playwright:state`

## Cloudflare Deployment (Pages + Functions)
This repo includes Cloudflare Pages Functions under `functions/api` to replace the Base44 SDK.
It provides minimal `/api` endpoints for auth, entity CRUD, and integrations.

### Required environment variables
- `VITE_APP_ID`: App identifier (used for public settings requests).
- `VITE_API_BASE_URL`: API base URL (defaults to `/api` when hosting on the same domain).
- `VITE_PUBLIC_BASE_URL`: Public site base URL (used for OAuth redirect hints).

### Optional environment variables (Functions)
- `DEV_TOKEN`: Dev login token used by `/api/auth/login` (defaults to `dev`).
- `DEV_EMAIL`: Email for the dev user (defaults to `dev@breslov.academy`).
- `DEV_ROLE`: Role for the dev user (defaults to `admin`).
- `AUTH_LOGIN_URL`: External auth login URL (if using a real IdP).
- `AUTH_LOGOUT_URL`: External auth logout URL.
- `AUTH_SESSION_TTL_HOURS`: Session lifetime in hours (default: 12).
- `AUTH_CLEANUP_TOKEN`: Optional token to authorize `/api/auth/cleanup` for expired AuthState/AuthSession removal.
- `CORS_ORIGIN`: Allowed origin for API responses.
- `REQUIRE_AUTH`: Set to `true` to enforce auth in public settings responses.
- `OIDC_ALLOW_ALL`: Allow SSO without a per-school policy (default: false).
- `GLOBAL_ADMIN_EMAILS`: Comma-separated list of global admin emails.
- `GLOBAL_ADMIN_ROLE`: Role name treated as global admin.

### Optional environment variables (Stripe)
- `STRIPE_SECRET_KEY`: Stripe secret key for Connect onboarding.
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret.
- `STRIPE_API_VERSION`: Stripe API version override (defaults to 2023-10-16).
- `PLATFORM_FEE_PERCENT`: Default platform fee percent for Connect (optional).

### Optional environment variables (OIDC)
- `GOOGLE_OIDC_CLIENT_ID`: Google Workspace OAuth client ID.
- `GOOGLE_OIDC_CLIENT_SECRET`: Google Workspace OAuth client secret.
- `GOOGLE_OIDC_REDIRECT_URI`: Override callback URL (defaults to `/api/auth/oidc/callback`).
- `GOOGLE_OIDC_SCOPES`: Override scopes (defaults to `openid email profile`).
- `GOOGLE_OIDC_PROMPT`: Override prompt parameter (defaults to `select_account`).
- `MICROSOFT_OIDC_CLIENT_ID`: Microsoft 365 OAuth client ID.
- `MICROSOFT_OIDC_CLIENT_SECRET`: Microsoft 365 OAuth client secret.
- `MICROSOFT_OIDC_TENANT`: Azure tenant (defaults to `common`).
- `MICROSOFT_OIDC_REDIRECT_URI`: Override callback URL (defaults to `/api/auth/oidc/callback`).
- `MICROSOFT_OIDC_SCOPES`: Override scopes (defaults to `openid email profile`).
- `MICROSOFT_OIDC_PROMPT`: Override prompt parameter (defaults to `select_account`).

### Optional environment variables (Integrations)
- `GOOGLE_INTEGRATION_CLIENT_ID`: Google OAuth client ID for Classroom/Drive.
- `GOOGLE_INTEGRATION_CLIENT_SECRET`: Google OAuth client secret for Classroom/Drive.
- `GOOGLE_INTEGRATION_REDIRECT_URI`: Override Google integration callback URL.
- `MICROSOFT_GRAPH_CLIENT_ID`: Microsoft OAuth client ID for OneDrive/SharePoint.
- `MICROSOFT_GRAPH_CLIENT_SECRET`: Microsoft OAuth client secret.
- `MICROSOFT_GRAPH_TENANT`: Microsoft tenant (defaults to `common`).
- `MICROSOFT_GRAPH_REDIRECT_URI`: Override Microsoft integration callback URL.

### Optional environment variables (Cloudflare Stream)
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID for Stream.
- `CLOUDFLARE_STREAM_TOKEN`: API token with Stream permissions.

### Optional environment variables (Cloudflare R2)
- `R2_ACCESS_KEY_ID`: R2 access key ID for presigned uploads.
- `R2_SECRET_ACCESS_KEY`: R2 secret access key.
- `R2_BUCKET`: R2 bucket name.
- `R2_ENDPOINT`: R2 endpoint URL (e.g. `https://<account>.r2.cloudflarestorage.com`).
- `R2_REGION`: Region identifier (defaults to `auto`).

### Optional environment variables (Rate limiting)
- `RATE_LIMIT_DISABLED`: Set to `true` to bypass rate limiting.
- `RATE_LIMIT_AUTH`: Max auth attempts per window (defaults to 30).
- `RATE_LIMIT_AUTH_WINDOW_SECONDS`: Auth rate limit window (defaults to 60 seconds).
- `RATE_LIMIT_DOWNLOADS`: Max download token attempts per window (defaults to 20).
- `RATE_LIMIT_DOWNLOADS_WINDOW_SECONDS`: Download rate limit window (defaults to 60 seconds).
- `RATE_LIMIT_CHECKOUT`: Max checkout attempts per window (defaults to 10).
- `RATE_LIMIT_CHECKOUT_WINDOW_SECONDS`: Checkout rate limit window (defaults to 60 seconds).

### Optional environment variables (AI tutor)
- `OPENAI_API_KEY`: Enable OpenAI-backed responses for `/api/ai/chat`.
- `OPENAI_MODEL`: Override OpenAI model (default: `gpt-4o-mini`).
- `LLM_FALLBACK`: Fallback response when no provider is configured.

### Optional environment variables (Performance budgets)
- `MAX_IMAGE_KB`: Max image size for `npm run perf:check` (default: 500).

### D1 schema
The API uses a simple generic entity table. Apply `cloudflare/schema.sql` to your D1 database.

### Notes
- For production auth, wire `/api/auth/*` to your IdP and replace the dev-token logic.
- For local API testing, run Pages Functions with Wrangler and set `VITE_API_BASE_URL` to the dev URL.
- AI tutor indexing: run `npm run ai:index` (requires `AI_INDEX_BASE_URL`, `AI_INDEX_TOKEN`, `AI_INDEX_SCHOOL_ID`).
- Portal smoke tests: set `PLAYWRIGHT_STORAGE_STATE` to the generated state file and `PLAYWRIGHT_ROLE=superadmin` to run all portal checks.

## Technical Invariants
*   **Registry First:** All routes must be defined in `src/components/config/features.jsx`.
*   **Scoped Data:** All school queries must use `scopedFilter` or `scopedList`.
*   **Rules of Hooks:** No conditional hooks; use `SkeletonLoaders` for waiting states.
