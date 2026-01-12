# Feature Registry Dump (v9)

Generated from `src\components\config\features.jsx` on 2026-01-12T08:42:52.016Z.

| Registry ID | Feature Key | Label | Route | Area | Audiences | Flag Key | Hidden | Vault Only |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dashboard | Dashboard | Dashboard | /dashboard | core | student, teacher, admin | - | - | - |
| courses | Courses | Courses | /courses | core | student, teacher, admin | - | - | - |
| courseDetail | CourseDetail | Course Detail | /coursedetail | core | student, teacher, admin | - | true | - |
| lessonViewer | LessonViewer | Lesson Viewer | /lessonviewer | core | student, teacher, admin | - | true | - |
| lessonViewerPremium | LessonViewerPremium | Lesson Viewer Premium | /lessonviewerpremium | core | student, teacher, admin | - | true | - |
| reader | Reader | Smart Reader | /reader | core | student, teacher, admin | - | - | - |
| aiTutor | AITutor | AI Tutor | /ai-tutor | core | student, teacher, admin | ENABLE_AI_TUTOR | - | - |
| feed | Feed | Community | /feed | core | student, teacher, admin | - | - | - |
| schoolSearch | SchoolSearch | Search | /schoolsearch | core | student, teacher, admin | - | - | - |
| myProgress | MyProgress | My Progress | /myprogress | core | student | - | - | true |
| downloads | Downloads | Downloads | /downloads | core | student, teacher, admin | - | - | true |
| myQuizzes | MyQuizzes | My Quizzes | /my-quizzes | core | student, teacher, admin | - | - | - |
| quizTake | QuizTake | Take Quiz | /quiz/:quizId | core | student, teacher, admin | - | true | - |
| assignments | Assignments | Assignments | /assignments | core | student, teacher, admin | - | - | - |
| assignmentDetail | AssignmentDetail | Assignment Detail | /assignmentdetail | core | student, teacher, admin | - | true | - |
| submissionForm | SubmissionForm | Submission Form | /submissionform | labs | student, teacher, admin | - | true | - |
| teach | Teach | Teach | /teach | teach | teacher, admin | - | - | - |
| teachCourse | TeachCourse | Course Builder | /teachcourse | teach | teacher, admin | - | true | - |
| teachCourseNew | TeachCourseNew | New Course | /teachcoursenew | teach | teacher, admin | - | true | - |
| teachLesson | TeachLesson | Lesson Editor | /teachlesson | teach | teacher, admin | - | true | - |
| teachQuizzes | TeachQuizzes | Quizzes | /teach/quizzes | teach | teacher, admin | - | - | - |
| teachQuizEditor | TeachQuizEditor | Quiz Editor | /teach/quizzes/:quizId | teach | teacher, admin | - | true | - |
| teachGrading | TeachGrading | Grading | /teach/grading | teach | teacher, admin | - | - | - |
| teachAnalytics | TeachAnalytics | Teaching Analytics | /teachanalytics | teach | teacher, admin | - | - | - |
| schoolAdmin | SchoolAdmin | School Admin | /schooladmin | admin | admin | - | - | - |
| adminOnboarding | AdminOnboarding | Admin Onboarding | /admin-onboarding | admin | admin | - | true | true |
| schoolAnalytics | SchoolAnalytics | School Analytics | /schoolanalytics | admin | admin | - | - | - |
| schoolMonetization | SchoolMonetization | Monetization | /schoolmonetization | admin | admin | - | - | - |
| schoolNew | SchoolNew | Create School | /schoolnew | admin | admin | - | true | - |
| schoolJoin | SchoolJoin | Join School | /schooljoin | system | student, teacher, admin | - | true | - |
| adminHardening | AdminHardening | Security Hardening | /adminhardening | admin | admin | - | - | true |
| legacyMigration | LegacyMigration | Legacy Migration | /legacymigration | admin | admin | - | - | true |
| publicHome | PublicHome | Home | / | marketing | public | - | true | - |
| publicSchools | PublicSchools | Schools | /schools | marketing | public | - | true | - |
| publicAbout | PublicAbout | About | /about | marketing | public | - | true | - |
| publicHowItWorks | PublicHowItWorks | How It Works | /how-it-works | marketing | public | - | true | - |
| publicPricing | PublicPricing | Pricing | /pricing | marketing | public | - | true | - |
| publicFAQ | PublicFAQ | FAQ | /faq | marketing | public | - | true | - |
| publicContact | PublicContact | Contact | /contact | marketing | public | - | true | - |
| loginChooserPublic | LoginChooserPublic | Login | /login | marketing | public | - | true | - |
| loginStudentPublic | LoginStudentPublic | Student Login | /login/student | marketing | public | - | true | - |
| loginTeacherPublic | LoginTeacherPublic | Teacher Login | /login/teacher | marketing | public | - | true | - |
| loginAdminPublic | LoginAdminPublic | Admin Login | /login/admin | marketing | public | - | true | - |
| signupChooserPublic | SignupChooserPublic | Signup | /signup | marketing | public | - | true | - |
| signupStudentPublic | SignupStudentPublic | Student Signup | /signup/student | marketing | public | - | true | - |
| signupTeacherPublic | SignupTeacherPublic | Teacher Signup | /signup/teacher | marketing | public | - | true | - |
| signupSchoolPublic | SignupSchoolPublic | School Signup | /signup/school | marketing | public | - | true | - |
| legalPrivacy | LegalPrivacy | Privacy Policy | /privacy | marketing | public | - | true | - |
| legalTerms | LegalTerms | Terms of Service | /terms | marketing | public | - | true | - |
| schoolLanding | SchoolLanding | Landing Page | /schoollanding | marketing | public, student, teacher, admin | - | - | - |
| schoolCourses | SchoolCourses | Course Catalog | /schoolcourses | marketing | public, student, teacher, admin | - | - | - |
| courseSales | CourseSales | Sales Page | /coursesales | marketing | public, student, teacher, admin | - | true | - |
| schoolPricing | SchoolPricing | Pricing | /schoolpricing | marketing | public, student, teacher, admin | - | true | - |
| schoolCheckout | SchoolCheckout | Checkout | /schoolcheckout | marketing | public, student, teacher, admin | - | true | - |
| schoolThankYou | SchoolThankYou | Thank You | /schoolthankyou | marketing | public, student, teacher, admin | - | true | - |
| languageLearning | LanguageLearning | Languages | /languagelearning | labs | student, teacher, admin | - | - | - |
| languages | Languages | Languages (Legacy) | /languages | labs | student, teacher, admin | - | - | true |
| adaptiveLearning | AdaptiveLearning | Adaptive Learning | /adaptivelearning | labs | student, teacher, admin | - | - | true |
| alumniNetwork | AlumniNetwork | Alumni Network | /alumninetwork | labs | student, teacher, admin | - | - | true |
| studySets | StudySets | Study Sets | /studysets | labs | student, teacher, admin | - | - | - |
| studySetNew | StudySetNew | New Study Set | /studysetnew | labs | student, teacher, admin | - | true | - |
| studySetPractice | StudySetPractice | Practice | /studysetpractice | labs | student, teacher, admin | - | true | - |
| cohorts | Cohorts | Cohorts | /cohorts | labs | student, teacher, admin | - | - | - |
| cohortDetail | CohortDetail | Cohort Detail | /cohortdetail | labs | student, teacher, admin | - | true | - |
| offline | Offline | Offline | /offline | labs | student, teacher, admin | - | - | - |
| achievements | Achievements | Achievements | /achievements | labs | student, teacher, admin | ENABLE_GAMIFICATION | - | - |
| challenges | Challenges | Challenges | /challenges | labs | student, teacher, admin | ENABLE_GAMIFICATION | - | - |
| affiliate | Affiliate | Affiliate Program | /affiliate | labs | student, teacher, admin | - | - | true |
| schoolSelect | SchoolSelect | School Select | /schoolselect | system | student, teacher, admin | - | true | - |
| integrationsMarketplace | IntegrationsMarketplace | App Store | /integrations | system | admin | ENABLE_INTEGRATIONS | - | - |
| integrationDetail | IntegrationDetail | App Details | /integrations/:appId | system | admin | ENABLE_INTEGRATIONS | true | - |
| portfolio | Portfolio | Profile | /portfolio | system | student, teacher, admin | - | - | - |
| vault | Vault | Vault | /vault | system | student, teacher, admin | - | - | - |
| oauth2callback | oauth2callback | OAuth Callback | /oauth2callback | system | public | - | true | - |
| integrity | Integrity | Integrity Check | /integrity | system | admin | - | - | true |
| subscription | Subscription | Subscription | /subscription | system | student, teacher, admin | - | true | - |
| analytics | Analytics | Analytics | /analytics | labs | student, teacher, admin | - | - | true |
| careerPaths | CareerPaths | Career Paths | /careerpaths | labs | student, teacher, admin | - | - | true |
| community | Community | Community | /community | core | student, teacher, admin | - | - | true |
| events | Events | Events | /events | labs | student, teacher, admin | - | - | true |
| forums | Forums | Forums | /forums | core | student, teacher, admin | - | - | true |
| habitTracker | HabitTracker | Habit Tracker | /habittracker | labs | student | - | - | true |
| leaderboard | Leaderboard | Leaderboard | /leaderboard | labs | student, teacher, admin | ENABLE_GAMIFICATION | - | true |
| learningPaths | LearningPaths | Learning Paths | /learningpaths | core | student, teacher, admin | - | - | true |
| liveStreams | LiveStreams | Live Streams | /livestreams | labs | student, teacher, admin | - | - | true |
| virtualBeitMidrash | VirtualBeitMidrash | Virtual Beit Midrash | /virtual-beit-midrash | labs | student, teacher, admin | - | - | - |
| marketplace | Marketplace | Marketplace | /marketplace | labs | student, teacher, admin | - | - | true |
| mentorship | Mentorship | Mentorship | /mentorship | labs | student, teacher, admin | - | - | true |
| messages | Messages | Messages | /messages | core | student, teacher, admin | - | - | true |
| microlearning | Microlearning | Microlearning | /microlearning | labs | student | - | - | true |
| rewardsShop | RewardsShop | Rewards Shop | /rewardsshop | labs | student | ENABLE_GAMIFICATION | - | true |
| scholarships | Scholarships | Scholarships | /scholarships | labs | student | - | - | true |
| skills | Skills | Skills | /skills | labs | student, teacher, admin | - | - | true |
| studyBuddies | StudyBuddies | Study Buddies | /studybuddies | labs | student | - | - | true |
| studySet | StudySet | Study Set | /studyset | labs | student, teacher, admin | - | true | - |
| tournaments | Tournaments | Tournaments | /tournaments | labs | student | ENABLE_GAMIFICATION | - | true |
| affiliateProgram | AffiliateProgram | Affiliate Program Info | /affiliateprogram | marketing | public, student, teacher, admin | - | - | true |
| account | Account | My Account | /account | core | student, teacher, admin | - | - | - |
| networkAdmin | NetworkAdmin | Network Admin | /networkadmin | admin | admin | - | - | true |
| certificateVerify | CertificateVerify | Certificate Verification | /certificateverify | marketing | public | - | true | - |
| schoolStaff | SchoolStaff | Staff Management | /schoolstaff | admin | admin | - | - | true |
| schoolFeatures | SchoolFeatures | Feature Manager | /schoolfeatures | admin | admin | - | - | true |
| auditLogViewer | AuditLogViewer | Audit Log | /auditlogviewer | admin | admin | - | - | true |
| inviteAccept | InviteAccept | Accept Invite | /inviteaccept | system | public | - | true | - |

Notes:
- Update `src\components\config\features.jsx` to change registry data.
- Re-run `node scripts/dump-feature-registry.mjs` after registry edits.
