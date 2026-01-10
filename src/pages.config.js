import React from 'react';
import PortalLayout from './portals/shared/PortalLayout.jsx';

// Core & Critical Path (Eager Load)
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonViewer';
import LessonViewerPremium from './pages/LessonViewerPremium';
import MyProgress from './pages/MyProgress';
import MyQuizzes from './pages/MyQuizzes';
import QuizTake from './pages/QuizTake';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import Reader from './pages/Reader';
import SchoolSearch from './pages/SchoolSearch'; // Search is core
import Account from './pages/Account'; // Frequently accessed

// Lazy-Loaded: Teacher Portal (Large bundle)
const Teach = React.lazy(() => import('./pages/Teach'));
const TeachAnalytics = React.lazy(() => import('./pages/TeachAnalytics'));
const TeachCourse = React.lazy(() => import('./pages/TeachCourse'));
const TeachCourseNew = React.lazy(() => import('./pages/TeachCourseNew'));
const TeachLesson = React.lazy(() => import('./pages/TeachLesson'));
const TeachQuizzes = React.lazy(() => import('./pages/TeachQuizzes'));
const TeachQuizEditor = React.lazy(() => import('./pages/TeachQuizEditor'));
const TeachGrading = React.lazy(() => import('./pages/TeachGrading'));

// Lazy-Loaded: Admin Portal (Restricted access)
const SchoolAdmin = React.lazy(() => import('./pages/SchoolAdmin'));
const SchoolAnalytics = React.lazy(() => import('./pages/SchoolAnalytics'));
const SchoolMonetization = React.lazy(() => import('./pages/SchoolMonetization'));
const SchoolStaff = React.lazy(() => import('./pages/SchoolStaff'));
const AuditLogViewer = React.lazy(() => import('./pages/AuditLogViewer'));
const AdminHardening = React.lazy(() => import('./pages/AdminHardening'));
const LegacyMigration = React.lazy(() => import('./pages/LegacyMigration'));
const NetworkAdmin = React.lazy(() => import('./pages/NetworkAdmin'));
const Integrity = React.lazy(() => import('./pages/Integrity'));

// Lazy-Loaded: Labs & Experimental (Non-critical)
const Achievements = React.lazy(() => import('./pages/Achievements'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const StudyBuddies = React.lazy(() => import('./pages/StudyBuddies'));
const Tournaments = React.lazy(() => import('./pages/Tournaments'));
const AdaptiveLearning = React.lazy(() => import('./pages/AdaptiveLearning'));
const LanguageLearning = React.lazy(() => import('./pages/LanguageLearning'));
const Languages = React.lazy(() => import('./pages/Languages'));
const AlumniNetwork = React.lazy(() => import('./pages/AlumniNetwork'));
const CareerPaths = React.lazy(() => import('./pages/CareerPaths'));
const Challenges = React.lazy(() => import('./pages/Challenges'));
const Cohorts = React.lazy(() => import('./pages/Cohorts'));
const CohortDetail = React.lazy(() => import('./pages/CohortDetail'));
const LiveStreams = React.lazy(() => import('./pages/LiveStreams'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const Mentorship = React.lazy(() => import('./pages/Mentorship'));
const Microlearning = React.lazy(() => import('./pages/Microlearning'));
const RewardsShop = React.lazy(() => import('./pages/RewardsShop'));
const Scholarships = React.lazy(() => import('./pages/Scholarships'));
const Skills = React.lazy(() => import('./pages/Skills'));
const StudySets = React.lazy(() => import('./pages/StudySets'));
const StudySet = React.lazy(() => import('./pages/StudySet'));
const StudySetNew = React.lazy(() => import('./pages/StudySetNew'));
const StudySetPractice = React.lazy(() => import('./pages/StudySetPractice'));
const Offline = React.lazy(() => import('./pages/Offline'));
const HabitTracker = React.lazy(() => import('./pages/HabitTracker'));
const Events = React.lazy(() => import('./pages/Events'));
const Forums = React.lazy(() => import('./pages/Forums'));
const Community = React.lazy(() => import('./pages/Community'));
const Analytics = React.lazy(() => import('./pages/Analytics'));

// Lazy-Loaded: Marketing & Public (Often separate entry points)
const SchoolLanding = React.lazy(() => import('./pages/SchoolLanding'));
const SchoolCourses = React.lazy(() => import('./pages/SchoolCourses'));
const CourseSales = React.lazy(() => import('./pages/CourseSales'));
const SchoolPricing = React.lazy(() => import('./pages/SchoolPricing'));
const SchoolCheckout = React.lazy(() => import('./pages/SchoolCheckout'));
const SchoolThankYou = React.lazy(() => import('./pages/SchoolThankYou'));
const Affiliate = React.lazy(() => import('./pages/Affiliate'));
const AffiliateProgram = React.lazy(() => import('./pages/AffiliateProgram'));
const CertificateVerify = React.lazy(() => import('./pages/CertificateVerify'));

// System & Utilities
const SchoolNew = React.lazy(() => import('./pages/SchoolNew'));
const SchoolJoin = React.lazy(() => import('./pages/SchoolJoin'));
const SchoolSelect = React.lazy(() => import('./pages/SchoolSelect'));
const Integrations = React.lazy(() => import('./pages/Integrations'));
const Portfolio = React.lazy(() => import('./pages/Portfolio'));
const Vault = React.lazy(() => import('./pages/Vault'));
const Downloads = React.lazy(() => import('./pages/Downloads'));
const Subscription = React.lazy(() => import('./pages/Subscription'));
const oauth2callback = React.lazy(() => import('./pages/oauth2callback'));
const InviteAccept = React.lazy(() => import('./pages/InviteAccept'));

export const PAGES = {
    "Achievements": Achievements,
    "AdaptiveLearning": AdaptiveLearning,
    "AdminHardening": AdminHardening,
    "Affiliate": Affiliate,
    "AffiliateProgram": AffiliateProgram,
    "AlumniNetwork": AlumniNetwork,
    "Analytics": Analytics,
    "CareerPaths": CareerPaths,
    "Challenges": Challenges,
    "CohortDetail": CohortDetail,
    "Cohorts": Cohorts,
    "Community": Community,
    "CourseDetail": CourseDetail,
    "CourseSales": CourseSales,
    "Courses": Courses,
    "Dashboard": Dashboard,
    "Downloads": Downloads,
    "Events": Events,
    "Feed": Feed,
    "Forums": Forums,
    "HabitTracker": HabitTracker,
    "Integrations": Integrations,
    "Integrity": Integrity,
    "LanguageLearning": LanguageLearning,
    "Languages": Languages,
    "Leaderboard": Leaderboard,
    "LearningPaths": LearningPaths,
    "LegacyMigration": LegacyMigration,
    "LessonViewer": LessonViewer,
    "LessonViewerPremium": LessonViewerPremium,
    "LiveStreams": LiveStreams,
    "Marketplace": Marketplace,
    "Mentorship": Mentorship,
    "Messages": Messages,
    "Microlearning": Microlearning,
    "MyProgress": MyProgress,
    "Offline": Offline,
    "Portfolio": Portfolio,
    "Reader": Reader,
    "RewardsShop": RewardsShop,
    "Scholarships": Scholarships,
    "SchoolAdmin": SchoolAdmin,
    "SchoolAnalytics": SchoolAnalytics,
    "SchoolCheckout": SchoolCheckout,
    "SchoolCourses": SchoolCourses,
    "SchoolJoin": SchoolJoin,
    "SchoolLanding": SchoolLanding,
    "SchoolMonetization": SchoolMonetization,
    "SchoolNew": SchoolNew,
    "SchoolPricing": SchoolPricing,
    "SchoolSearch": SchoolSearch,
    "SchoolSelect": SchoolSelect,
    "SchoolThankYou": SchoolThankYou,
    "Skills": Skills,
    "StudyBuddies": StudyBuddies,
    "StudySet": StudySet,
    "StudySetNew": StudySetNew,
    "StudySetPractice": StudySetPractice,
    "StudySets": StudySets,
    "Subscription": Subscription,
    "Teach": Teach,
    "TeachAnalytics": TeachAnalytics,
    "TeachCourse": TeachCourse,
    "TeachCourseNew": TeachCourseNew,
    "TeachLesson": TeachLesson,
    "TeachQuizzes": TeachQuizzes,
    "TeachQuizEditor": TeachQuizEditor,
    "TeachGrading": TeachGrading,
    "QuizTake": QuizTake,
    "MyQuizzes": MyQuizzes,
    "Tournaments": Tournaments,
    "Vault": Vault,
    "oauth2callback": oauth2callback,
    "Account": Account,
    "NetworkAdmin": NetworkAdmin,
    "CertificateVerify": CertificateVerify,
    "SchoolStaff": SchoolStaff,
    "InviteAccept": InviteAccept,
    "AuditLogViewer": AuditLogViewer,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: PortalLayout,
};