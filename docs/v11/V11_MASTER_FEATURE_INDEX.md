# V11 Master Feature Index (Breslov University)

Status: Draft, canon-targeted for v11
Last updated: 2026-01-11

This index enforces "no feature loss" by assigning a permanent ID to every feature or idea.
Do not delete rows. Mark status, priority, and owners instead.

ID scheme:
- V11-CORE-###, V11-TEACH-###, V11-ADMIN-###, V11-MKT-###, V11-LABS-###, V11-SYS-### for registry features
- V11-PLAT-### for platform and integration features

Priority:
- P0 = launch gate, must have owner + acceptance tests
- P1 = post-launch, planned
- P2 = future

Status:
- planned, building, verified, deferred

<!-- V11_FEATURE_INDEX_START -->
| Feature ID | Registry Key | Name | Roles | Priority | Status | Owner | Dependencies | Acceptance Tests | Migration Impact | UX Surfaces | API/Events |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V11-CORE-001 | Dashboard | Dashboard | student, teacher, admin | P0 | building | Learning | Session, scoped Course, entitlements | G/W/T: signed-in user lands on dashboard and only sees activeSchoolId data | None | /dashboard | AnalyticsEvent:view_dashboard |
| V11-CORE-002 | Courses | Courses | student, teacher, admin | P0 | building | Learning | scoped Course, feature registry | G/W/T: course list shows published only for students | None | /courses | AnalyticsEvent:view_courses |
| V11-CORE-003 | CourseDetail | Course Detail | student, teacher, admin | P0 | building | Learning | scoped Course, Lesson, entitlements | G/W/T: locked student sees no premium lesson fetch | None | /coursedetail | AnalyticsEvent:view_course |
| V11-CORE-004 | LessonViewer | Lesson Viewer | student, teacher, admin | P1 | building | Learning | useLessonAccess, materials engine | TBD | None | /lessonviewer | AnalyticsEvent:view_lesson |
| V11-CORE-005 | LessonViewerPremium | Lesson Viewer Premium | student, teacher, admin | P0 | building | Learning | useLessonAccess, materials engine | G/W/T: locked user sees AccessGate and no premium content fetch | None | /lessonviewerpremium | AnalyticsEvent:view_lesson |
| V11-CORE-006 | Reader | Smart Reader | student, teacher, admin | P1 | building | Learning | entitlements, Text | TBD | None | /reader | AnalyticsEvent:view_text |
| V11-CORE-007 | AITutor | AI Tutor | student, teacher, admin | P1 | building | Learning | AITutorPolicy, FeatureFlag | TBD | None | /ai-tutor | AiTutorSession |
| V11-CORE-008 | Feed | Community Feed | student, teacher, admin | P1 | building | Learning | Post, Comment | TBD | None | /feed | Post:create |
| V11-CORE-009 | SchoolSearch | Search | student, teacher, admin | P0 | building | Learning | scoped queries, no content leakage | G/W/T: search returns metadata only, no locked content bodies | None | /schoolsearch | AnalyticsEvent:search |
| V11-CORE-010 | MyProgress | My Progress | student | P1 | building | Learning | UserProgress | TBD | None | /myprogress | Progress:read |
| V11-CORE-011 | Downloads | Downloads | student, teacher, admin | P0 | building | Learning | DownloadToken, ContentProtectionPolicy | G/W/T: download returns tokenized URL only after entitlement check | None | /downloads | DownloadToken:issue |
| V11-CORE-012 | MyQuizzes | My Quizzes | student, teacher, admin | P1 | building | Learning | Quiz, QuizAttempt | TBD | None | /my-quizzes | QuizAttempt:create |
| V11-CORE-013 | QuizTake | Take Quiz | student, teacher, admin | P1 | building | Learning | Quiz, QuizQuestion | TBD | None | /quiz/:quizId | QuizAttempt:create |
| V11-CORE-014 | Assignments | Assignments | student, teacher, admin | P1 | building | Learning | Assignment, Submission | TBD | None | /assignments | Submission:create |
| V11-CORE-015 | AssignmentDetail | Assignment Detail | student, teacher, admin | P1 | building | Learning | Assignment, Submission | TBD | None | /assignmentdetail | Submission:update |
| V11-CORE-016 | SubmissionForm | Submission Form | student, teacher, admin | P1 | planned | Learning | Assignment, Submission | TBD | None | /submissionform | Submission:create |
| V11-CORE-017 | Community | Community Hub | student, teacher, admin | P2 | planned | Learning | Post, Discussion | TBD | None | /community | Discussion:create |
| V11-CORE-018 | Forums | Forums | student, teacher, admin | P2 | planned | Learning | Forum, Discussion | TBD | None | /forums | Forum:thread |
| V11-CORE-019 | LearningPaths | Learning Paths | student, teacher, admin | P2 | planned | Learning | LearningPath | TBD | None | /learningpaths | LearningPath:read |
| V11-CORE-020 | Messages | Messages | student, teacher, admin | P2 | planned | Learning | Message | TBD | None | /messages | Message:create |
| V11-CORE-021 | Account | My Account | student, teacher, admin | P1 | building | Learning | Subscription, Transaction | TBD | None | /account | Subscription:read |
| V11-TEACH-001 | Teach | Teach | teacher, admin | P0 | building | Teaching | CourseStaff, Course | G/W/T: instructor sees only courses in activeSchoolId | None | /teach | AnalyticsEvent:view_teach |
| V11-TEACH-002 | TeachCourse | Course Builder | teacher, admin | P0 | building | Teaching | Course, Lesson | G/W/T: course create writes school_id and audit log | None | /teachcourse | Course:create |
| V11-TEACH-003 | TeachCourseNew | New Course | teacher, admin | P0 | building | Teaching | Course | G/W/T: new course default is draft and scoped | None | /teachcoursenew | Course:create |
| V11-TEACH-004 | TeachLesson | Lesson Editor | teacher, admin | P0 | building | Teaching | Lesson | G/W/T: publish lesson writes audit log | None | /teachlesson | Lesson:update |
| V11-TEACH-005 | TeachQuizzes | Quizzes | teacher, admin | P1 | building | Teaching | Quiz | TBD | None | /teach/quizzes | Quiz:update |
| V11-TEACH-006 | TeachQuizEditor | Quiz Editor | teacher, admin | P1 | building | Teaching | Quiz, QuizQuestion | TBD | None | /teach/quizzes/:quizId | QuizQuestion:update |
| V11-TEACH-007 | TeachGrading | Grading | teacher, admin | P1 | planned | Teaching | Submission | TBD | None | /teach/grading | Submission:update |
| V11-TEACH-008 | TeachAnalytics | Teaching Analytics | teacher, admin | P2 | planned | Teaching | CourseMetricDaily | TBD | None | /teachanalytics | AnalyticsEvent:read |
| V11-ADMIN-001 | SchoolAdmin | School Admin | admin | P0 | building | Admin | School, SchoolMembership | G/W/T: non-admin is blocked; admin sees only activeSchoolId | None | /schooladmin | AuditLog:school_update |
| V11-ADMIN-002 | AdminOnboarding | Admin Onboarding | admin | P1 | planned | Admin | ContentProtectionPolicy | TBD | None | /admin-onboarding | AuditLog:onboarding |
| V11-ADMIN-003 | SchoolAnalytics | School Analytics | admin | P1 | building | Admin | AnalyticsEvent | TBD | None | /schoolanalytics | AnalyticsEvent:read |
| V11-ADMIN-004 | SchoolMonetization | Monetization | admin | P0 | building | Admin | Offer, Coupon, PricingChangeRequest | G/W/T: pricing changes require approval and audit logs | None | /schoolmonetization | PricingChangeRequest:create |
| V11-ADMIN-005 | SchoolNew | Create School | admin | P0 | building | Admin | School | G/W/T: new school generates admin membership | None | /schoolnew | School:create |
| V11-ADMIN-006 | AdminHardening | Security Hardening | admin | P1 | planned | Admin | AuditLog, Integrity | TBD | None | /adminhardening | AuditLog:read |
| V11-ADMIN-007 | LegacyMigration | Legacy Migration | admin | P2 | planned | Admin | Migration tools | TBD | Data backfill | /legacymigration | Migration:run |
| V11-ADMIN-008 | NetworkAdmin | Network Admin | admin | P2 | planned | Admin | Global admin, TenantApplication | TBD | None | /networkadmin | TenantApplication:update |
| V11-ADMIN-009 | SchoolStaff | Staff Management | admin | P0 | building | Admin | SchoolMembership, SchoolInvite | G/W/T: invite acceptance writes audit log | None | /schoolstaff | SchoolInvite:create |
| V11-ADMIN-010 | SchoolFeatures | Feature Manager | admin | P1 | building | Admin | FeatureFlag, SchoolSetting | TBD | None | /schoolfeatures | FeatureFlag:update |
| V11-ADMIN-011 | AuditLogViewer | Audit Log | admin | P0 | building | Admin | AuditLog | G/W/T: audit entries scoped by school | None | /auditlogviewer | AuditLog:read |
| V11-ADMIN-012 | Integrity | Integrity Check | admin | P0 | building | Admin | code scanner, tenancy warnings | G/W/T: integrity scan flags unscoped reads | None | /integrity | Integrity:run |
| V11-MKT-001 | PublicHome | Public Home | public | P0 | building | Growth | School directory, login, signup | G/W/T: public home lists only is_public schools | None | / | AnalyticsEvent:view_public_home |
| V11-MKT-002 | PublicSchools | Public Schools | public | P0 | building | Growth | School directory | G/W/T: only is_public schools show | None | /schools | AnalyticsEvent:view_school_dir |
| V11-MKT-003 | PublicAbout | Public About | public | P2 | planned | Growth | content | TBD | None | /about | AnalyticsEvent:view_public_about |
| V11-MKT-004 | PublicHowItWorks | Public How It Works | public | P2 | planned | Growth | content | TBD | None | /how-it-works | AnalyticsEvent:view_public_how |
| V11-MKT-005 | PublicPricing | Public Pricing | public | P1 | planned | Growth | Offer summary | TBD | None | /pricing | AnalyticsEvent:view_public_pricing |
| V11-MKT-006 | PublicFAQ | Public FAQ | public | P2 | planned | Growth | content | TBD | None | /faq | AnalyticsEvent:view_public_faq |
| V11-MKT-007 | PublicContact | Public Contact | public | P2 | planned | Growth | contact | TBD | None | /contact | AnalyticsEvent:view_public_contact |
| V11-MKT-008 | LoginChooserPublic | Login | public | P0 | building | Growth | Auth adapter | G/W/T: portal choice routes to correct login | None | /login | Auth:login |
| V11-MKT-009 | LoginStudentPublic | Student Login | public | P0 | building | Growth | Auth adapter | G/W/T: student login starts auth flow | None | /login/student | Auth:login |
| V11-MKT-010 | LoginTeacherPublic | Teacher Login | public | P0 | building | Growth | Auth adapter | G/W/T: teacher login starts auth flow | None | /login/teacher | Auth:login |
| V11-MKT-011 | LoginAdminPublic | Admin Login | public | P0 | building | Growth | Auth adapter | G/W/T: admin login starts auth flow | None | /login/admin | Auth:login |
| V11-MKT-012 | SignupChooserPublic | Signup | public | P0 | building | Growth | Auth adapter | G/W/T: signup choice leads to correct onboarding | None | /signup | Auth:signup |
| V11-MKT-013 | SignupStudentPublic | Student Signup | public | P0 | building | Growth | Auth adapter | G/W/T: student signup creates user | None | /signup/student | Auth:signup |
| V11-MKT-014 | SignupTeacherPublic | Teacher Signup | public | P0 | building | Growth | Auth adapter | G/W/T: teacher signup creates user | None | /signup/teacher | Auth:signup |
| V11-MKT-015 | SignupSchoolPublic | School Signup | public | P0 | building | Growth | School onboarding | G/W/T: school signup creates pending tenant | None | /signup/school | TenantApplication:create |
| V11-MKT-016 | LegalPrivacy | Privacy Policy | public | P2 | planned | Growth | content | TBD | None | /privacy | AnalyticsEvent:view_privacy |
| V11-MKT-017 | LegalTerms | Terms of Service | public | P2 | planned | Growth | content | TBD | None | /terms | AnalyticsEvent:view_terms |
| V11-MKT-018 | SchoolLanding | Landing Page | public, student, teacher, admin | P0 | building | Growth | School, Course | G/W/T: school landing shows published courses only | None | /schoollanding | AnalyticsEvent:view_storefront |
| V11-MKT-019 | SchoolCourses | Course Catalog | public, student, teacher, admin | P0 | building | Growth | Course | G/W/T: catalog only shows published for students | None | /schoolcourses | AnalyticsEvent:view_catalog |
| V11-MKT-020 | CourseSales | Sales Page | public, student, teacher, admin | P1 | planned | Growth | Offer, Course | TBD | None | /coursesales | AnalyticsEvent:view_sales |
| V11-MKT-021 | SchoolPricing | Pricing | public, student, teacher, admin | P0 | building | Growth | Offer, Coupon | G/W/T: pricing shows school-scoped offers only | None | /schoolpricing | AnalyticsEvent:view_pricing |
| V11-MKT-022 | SchoolCheckout | Checkout | public, student, teacher, admin | P0 | building | Growth | Transaction | G/W/T: checkout creates pending transaction with audit | None | /schoolcheckout | Transaction:create |
| V11-MKT-023 | SchoolThankYou | Thank You | public, student, teacher, admin | P0 | building | Growth | Transaction | G/W/T: thank you page reads only activeSchoolId | None | /schoolthankyou | AnalyticsEvent:view_thankyou |
| V11-MKT-024 | AffiliateProgram | Affiliate Program Info | public, student, teacher, admin | P2 | planned | Growth | Affiliate | TBD | None | /affiliateprogram | AnalyticsEvent:view_affiliate |
| V11-MKT-025 | CertificateVerify | Certificate Verification | public | P1 | planned | Growth | Certificate | TBD | None | /certificateverify | Certificate:verify |
| V11-LABS-001 | LanguageLearning | Languages | student, teacher, admin | P2 | planned | Labs | LanguageVariant | TBD | None | /languagelearning | LanguageVariant:read |
| V11-LABS-002 | Languages | Languages (Legacy) | student, teacher, admin | P2 | planned | Labs | LanguageVariant | TBD | None | /languages | LanguageVariant:read |
| V11-LABS-003 | AdaptiveLearning | Adaptive Learning | student, teacher, admin | P2 | planned | Labs | AdaptiveLearning | TBD | None | /adaptivelearning | AdaptiveLearning:read |
| V11-LABS-004 | AlumniNetwork | Alumni Network | student, teacher, admin | P2 | planned | Labs | Alumni | TBD | None | /alumninetwork | Alumni:read |
| V11-LABS-005 | StudySets | Study Sets | student, teacher, admin | P2 | planned | Labs | StudySet | TBD | None | /studysets | StudySet:read |
| V11-LABS-006 | StudySetNew | New Study Set | student, teacher, admin | P2 | planned | Labs | StudySet | TBD | None | /studysetnew | StudySet:create |
| V11-LABS-007 | StudySetPractice | Practice | student, teacher, admin | P2 | planned | Labs | StudySet | TBD | None | /studysetpractice | StudySession:create |
| V11-LABS-008 | Cohorts | Cohorts | student, teacher, admin | P2 | planned | Labs | Cohort | TBD | None | /cohorts | Cohort:read |
| V11-LABS-009 | CohortDetail | Cohort Detail | student, teacher, admin | P2 | planned | Labs | Cohort | TBD | None | /cohortdetail | Cohort:read |
| V11-LABS-010 | Offline | Offline | student, teacher, admin | P2 | planned | Labs | Download, Cache | TBD | None | /offline | Offline:sync |
| V11-LABS-011 | Achievements | Achievements | student, teacher, admin | P2 | planned | Labs | Achievement | TBD | None | /achievements | Achievement:read |
| V11-LABS-012 | Challenges | Challenges | student, teacher, admin | P2 | planned | Labs | Challenge | TBD | None | /challenges | Challenge:read |
| V11-LABS-013 | Affiliate | Affiliate Program | student, teacher, admin | P2 | planned | Labs | Affiliate, Referral | TBD | None | /affiliate | Referral:read |
| V11-LABS-014 | Analytics | Analytics | student, teacher, admin | P2 | planned | Labs | AnalyticsEvent | TBD | None | /analytics | AnalyticsEvent:read |
| V11-LABS-015 | CareerPaths | Career Paths | student, teacher, admin | P2 | planned | Labs | CareerPath | TBD | None | /careerpaths | CareerPath:read |
| V11-LABS-016 | Events | Events | student, teacher, admin | P2 | planned | Labs | Event | TBD | None | /events | Event:read |
| V11-LABS-017 | HabitTracker | Habit Tracker | student | P2 | planned | Labs | Habit | TBD | None | /habittracker | Habit:read |
| V11-LABS-018 | Leaderboard | Leaderboard | student, teacher, admin | P2 | planned | Labs | Leaderboard | TBD | None | /leaderboard | Leaderboard:read |
| V11-LABS-019 | LiveStreams | Live Streams | student, teacher, admin | P2 | planned | Labs | LiveStream | TBD | None | /livestreams | LiveStream:read |
| V11-LABS-020 | Marketplace | Marketplace | student, teacher, admin | P2 | planned | Labs | Offer | TBD | None | /marketplace | Offer:read |
| V11-LABS-021 | Mentorship | Mentorship | student, teacher, admin | P2 | planned | Labs | Mentorship | TBD | None | /mentorship | Mentorship:read |
| V11-LABS-022 | Microlearning | Microlearning | student | P2 | planned | Labs | Microlesson | TBD | None | /microlearning | Microlesson:read |
| V11-LABS-023 | RewardsShop | Rewards Shop | student | P2 | planned | Labs | Reward | TBD | None | /rewardsshop | Reward:read |
| V11-LABS-024 | Scholarships | Scholarships | student | P2 | planned | Labs | Scholarship | TBD | None | /scholarships | Scholarship:read |
| V11-LABS-025 | Skills | Skills | student, teacher, admin | P2 | planned | Labs | SkillAssessment | TBD | None | /skills | SkillAssessment:read |
| V11-LABS-026 | StudyBuddies | Study Buddies | student | P2 | planned | Labs | StudyBuddy | TBD | None | /studybuddies | StudyBuddy:read |
| V11-LABS-027 | StudySet | Study Set | student, teacher, admin | P2 | planned | Labs | StudySet | TBD | None | /studyset | StudySet:read |
| V11-LABS-028 | Tournaments | Tournaments | student | P2 | planned | Labs | Tournament | TBD | None | /tournaments | Tournament:read |
| V11-LABS-029 | VirtualBeitMidrash | Virtual Beit Midrash | student, teacher, admin | P1 | planned | Labs | VR | TBD | None | /virtual-beit-midrash | VR:session |
| V11-SYS-001 | SchoolSelect | School Select | student, teacher, admin | P0 | building | Platform | SchoolMembership | G/W/T: user selects activeSchoolId and session updates | None | /schoolselect | Session:update |
| V11-SYS-002 | IntegrationsMarketplace | App Store | admin | P1 | planned | Platform | Integration | TBD | None | /integrations | Integration:read |
| V11-SYS-003 | IntegrationDetail | App Details | admin | P1 | planned | Platform | Integration | TBD | None | /integrations/:appId | Integration:read |
| V11-SYS-004 | Portfolio | Profile | student, teacher, admin | P2 | planned | Platform | Portfolio | TBD | None | /portfolio | Portfolio:read |
| V11-SYS-005 | Vault | Vault | student, teacher, admin | P1 | planned | Platform | Feature registry | TBD | None | /vault | Vault:read |
| V11-SYS-006 | oauth2callback | OAuth Callback | public | P0 | building | Platform | OAuth tokens | G/W/T: OAuth callback stores token and scopes user | None | /oauth2callback | OAuthToken:create |
| V11-SYS-007 | Subscription | Subscription | student, teacher, admin | P1 | planned | Platform | Subscription | TBD | None | /subscription | Subscription:read |
| V11-SYS-008 | InviteAccept | Accept Invite | public | P0 | building | Platform | SchoolInvite, StaffInvite | G/W/T: valid invite creates membership and logs audit | None | /inviteaccept | SchoolMembership:create |
| V11-SYS-009 | SchoolJoin | Join School | student, teacher, admin | P0 | building | Platform | SchoolInvite | G/W/T: join flow respects invite token and school scope | None | /schooljoin | SchoolMembership:create |
| V11-PLAT-001 | N/A | Tenant Isolation Guard | platform | P0 | building | Platform | scoped helpers, tenancy enforcer | G/W/T: cross-tenant reads return empty or error | None | API middleware | tenancyEnforcer |
| V11-PLAT-002 | N/A | RBAC + Policy Engine | platform | P0 | building | Platform | SchoolMembership, roles | G/W/T: role checks block unauthorized routes | None | App guards | AccessGate |
| V11-PLAT-003 | N/A | Audit Logging Core | platform | P0 | building | Platform | AuditLog | G/W/T: publish/pricing changes write audit logs | None | Admin surfaces | AuditLog:create |
| V11-PLAT-004 | N/A | Content Protection Policy Engine | platform | P0 | building | Platform | ContentProtectionPolicy | G/W/T: policy toggles enforce copy/download rules | None | Admin settings | ContentProtectionPolicy:update |
| V11-PLAT-005 | N/A | Protected Materials Engine | platform | P0 | building | Platform | materialsEngine, useLessonAccess | G/W/T: LOCKED never fetches premium content | None | Lesson viewers | shouldFetchMaterials |
| V11-PLAT-006 | N/A | Feature Registry + Vault | platform | P0 | building | Platform | features registry | G/W/T: route added only via registry | None | Registry | FEATURES |
| V11-PLAT-007 | N/A | Base44 + GitHub Release Discipline | platform | P0 | building | Platform | branch model | G/W/T: main only via PR and checks | None | GitHub settings | CODEOWNERS |
| V11-PLAT-008 | N/A | Google OIDC SSO | platform | P0 | building | Platform | OIDC, domain policy | G/W/T: Google login issues session and role mapping | None | Auth | auth/login/google |
| V11-PLAT-009 | N/A | Microsoft OIDC SSO | platform | P0 | deferred | Platform | OIDC, domain policy | G/W/T: Microsoft login issues session and role mapping | None | Auth | auth/login/microsoft |
| V11-PLAT-010 | N/A | Domain Verification + IdP Policies | platform | P0 | building | Platform | DNS verify | G/W/T: unverified domain blocks SSO enable | None | Admin settings | DomainPolicy:update |
| V11-PLAT-011 | N/A | Google Classroom Sync | platform | P1 | building | Platform | Classroom API | TBD | None | Admin integrations | Classroom:sync |
| V11-PLAT-012 | N/A | Google Drive Attachments | platform | P1 | building | Platform | Drive API | TBD | None | Authoring | Drive:attach |
| V11-PLAT-013 | N/A | Microsoft OneDrive/SharePoint Attachments | platform | P1 | building | Platform | Graph API | TBD | None | Authoring | OneDrive:attach |
| V11-PLAT-014 | N/A | Stripe Connect + Application Fees | platform | P0 | building | Platform | Stripe Connect | G/W/T: payment splits apply platform fee | None | Monetization | Stripe:webhook |
| V11-PLAT-015 | N/A | Billing + Metering | platform | P0 | planned | Platform | Stripe, usage metrics | G/W/T: billing invoices reflect usage tiers | Data backfill | Admin billing | Invoice:create |
| V11-PLAT-016 | N/A | Cloudflare Stream Uploads | platform | P1 | building | Platform | Stream API | TBD | None | Authoring | Stream:upload |
| V11-PLAT-017 | N/A | R2 Presigned Files | platform | P1 | planned | Platform | R2 | TBD | None | Materials | R2:presign |
| V11-PLAT-018 | N/A | Cloudflare Pages/Workers Deployment | platform | P0 | building | Platform | CI/CD | G/W/T: main deploys to Pages + Workers | None | Cloudflare | pages:deploy |
| V11-PLAT-019 | N/A | Turnstile + Bot Protection | platform | P0 | building | Platform | Turnstile | G/W/T: signup/login protected by Turnstile | None | Auth | Turnstile:verify |
| V11-PLAT-020 | N/A | Observability + Release Gates | platform | P0 | building | Platform | logs, checks | G/W/T: release gates fail on missing P0 specs | None | CI | spec:validate |
| V11-PLAT-021 | N/A | Parity Sweep Automation | platform | P0 | building | Platform | scripts | G/W/T: parity script flags registry drift | None | CI | parity:report |
| V11-PLAT-022 | N/A | Download Tokenization | platform | P0 | building | Platform | DownloadToken | G/W/T: file URL never exposed before token validation | None | Downloads | DownloadToken:issue |
| V11-PLAT-023 | N/A | SSO Admin Wizard | platform | P1 | building | Platform | domain policy | TBD | None | Admin settings | SSOConfig:update |
| V11-PLAT-024 | N/A | Onboarding Wizard | platform | P0 | building | Platform | tenant setup | G/W/T: onboarding creates school, admin, first course | None | Public onboarding | TenantApplication:create |
| V11-PLAT-025 | N/A | Background Jobs/Queue | platform | P2 | planned | Platform | workers | TBD | None | Background | Job:run |
| V11-PLAT-026 | N/A | Video Watermarking | platform | P2 | planned | Platform | Stream | TBD | None | Video | Stream:watermark |
| V11-PLAT-027 | N/A | Data Migration Framework | platform | P1 | planned | Platform | D1/R2 | TBD | Data backfill | Migration | Migration:run |
| V11-PLAT-028 | N/A | Org Units (Campus/Department) | platform | P1 | planned | Platform | OrgUnit | TBD | Schema changes | Admin | OrgUnit:create |
| V11-PLAT-029 | N/A | Payment Webhooks + Ledger | platform | P0 | building | Platform | Stripe | G/W/T: webhook updates ledger and audit log | Data backfill | Payments | Ledger:update |
| V11-PLAT-030 | N/A | Compliance Exports | platform | P1 | planned | Platform | AuditLog | TBD | None | Admin | Export:run |
<!-- V11_FEATURE_INDEX_END -->

Notes:
- Registry Key is required for features in src/components/config/features.jsx. Use N/A for platform-only features.
- This file is validated by scripts/validate-v11-spec.mjs. P0 rows must include Owner and Acceptance Tests.
