# Breslov Academy LMS

**Version:** 9.4 Integrity & Performance
**Architecture:** Multi-Tenant, Portalized, Registry-Driven, Lazy-Loaded
**Status:** Production Ready (2026-01-11)

## Documentation
- **[Coding Book (PDF)](./Breslov_Academy_Coding_Book_v9_1.pdf):** The architectural source of truth.
- **[Gemini Context](./GEMINI.md):** AI agent instructions and architectural invariants.
- **[Architecture Map](./docs/REALITY_MAP.md):** Current codebase structure.
- **[Audit Report](./docs/AUDIT_REPORT_V9_1.md):** Zero-Trust security audit results.

## Key Features (v9.4)

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

### ⚡ Performance
- **Lazy Loading:** Route-level code splitting (`React.lazy`) for Admin, Teacher, and Labs portals.
- **Bundle Optimization:** Critical path (Student Dashboard, Learning) prioritized for fast Time-to-Interactive (TTI).

## Portal Structure
- **Public Site:** `/` (Marketing, generic landing)
- **Storefront:** `/s/:schoolSlug` (Tenant-branded sales pages)
- **Student Portal:** `/student` (Dashboard, Learning, Quizzes, Social)
- **Teacher Portal:** `/teacher` (Course Builder, Analytics, Grading)
- **Admin Portal:** `/admin` (Monetization, Staff, Integrity)

## Getting Started
1. **Install:** `npm install`
2. **Run:** `npm run dev`
3. **Verify:** Visit `/integrity` (as admin) to check system health.
4. **Build:** `npm run build` (generates `dist/`)

## Technical Invariants
*   **Registry First:** All routes must be defined in `src/components/config/features.jsx`.
*   **Scoped Data:** All school queries must use `scopedFilter` or `scopedList`.
*   **Rules of Hooks:** No conditional hooks; use `SkeletonLoaders` for waiting states.
