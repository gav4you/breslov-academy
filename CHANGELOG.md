# Changelog

All notable changes to the Breslov Academy LMS project.

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