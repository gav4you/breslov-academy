# Breslov Academy - Gemini Instructional Context

This file provides instructional context for Gemini AI agents working on the Breslov Academy LMS project. Adhere to these standards and architectural invariants for all code modifications and feature implementations.

## Project Overview
Breslov Academy is a **multi-tenant white-label Learning Management System (LMS)** designed for high-trust educational content delivery.

- **Primary Technologies:** React (v18), Vite, Tailwind CSS, shadcn/ui, TanStack Query (v5), Lucide React.
- **Backend/SDK:** Powered by the **Base44 SDK**, which handles authentication, data persistence, and multi-tenancy.
- **Architecture:** 
    - **Portalized Surfaces:** The application is split into four primary surfaces:
        - `/`: Public marketing site (guest-safe).
        - `/student`: Learner experience, course progress, and quizzes.
        - `/teacher`: Content authoring, grading, and analytics.
        - `/admin`: School-level configuration and monetization.
    - **Feature Registry:** A single source of truth (`src/components/config/features.jsx`) defines all 76+ features, their routes, allowed audiences, and UI visibility.
    - **Tenancy Scoping:** Strictly enforced school-level isolation using `school_id`.

## Building and Running
The project uses standard `npm` scripts defined in `package.json`:

- `npm install`: Standard dependency installation.
- `npm run dev`: Starts the Vite development server. Runs a pre-render script for public pages.
- `npm run build`: Generates a production build in the `dist/` directory.
- `npm run lint`: Runs ESLint with strict rules against unused imports and hook violations.
- `npm run typecheck`: Runs TypeScript compiler in check-only mode via `jsconfig.json`.
- `npm run preview`: Previews the production build locally.

## Development Conventions & Invariants

### 1. Registry-First Policy
**NEVER** add a route to `src/App.jsx` without first registering it in `src/components/config/features.jsx`. The registry is the project's "anti-loss safety net" used for navigation, the Command Palette (Cmd+K), and integrity checks.

### 2. Multi-Tenant Scoping (The "Scoped Rule")
All entities listed in `src/components/api/scopedEntities.js` are **school-scoped**.
- **PROHIBITED:** Direct calls to `base44.entities.<Entity>.*` in page components.
- **REQUIRED:** Use scoped helpers from `src/components/api/scoped.jsx`:
    - `scopedFilter(entity, schoolId, filters)`
    - `scopedCreate(entity, schoolId, payload)`
    - `scopedUpdate(entity, id, payload, schoolId, strict)`

### 3. Content Protection (The "Locked Rule")
- **Hard Invariant:** If a lesson is `LOCKED` or `DRIP_LOCKED`, the application **must not** fetch or render premium materials (Text, Transcripts, Downloads).
- Use the `useLessonAccess` hook to determine the user's access level before triggering content queries.
- Protected content must be wrapped in the `ProtectedContent` component to prevent unauthorized copying/printing.

### 4. Import Standards
- Always use the `@/` alias for internal imports (e.g., `import { ... } from '@/components/api/scoped'`).
- Avoid brittle relative paths (`../../`).

### 5. Rules of Hooks
React Hooks (`useState`, `useEffect`, `useMemo`, `useMutation`, etc.) must be called at the top level of components. **Never** call hooks inside loops, conditions, or after early returns.

## Key Files & Directories
- `src/App.jsx`: Main routing table.
- `src/components/config/features.jsx`: Canonical feature registry.
- `src/components/api/scoped.jsx`: Tenant-safe query wrappers.
- `src/components/hooks/useSession.jsx`: Single source of truth for user session and active school.
- `src/pages/Integrity.jsx`: Diagnostic page for verifying system health.
- `_specpack/`: Detailed technical specifications and roadmaps.

## Integrity Checks
Admins can visit `/integrity` to run automated scans for:
- Registry-to-router alignment.
- Data leakage patterns (e.g., direct `file_url` exposure).
- Unscoped query regressions.
