import Achievements from './pages/Achievements';
import AdaptiveLearning from './pages/AdaptiveLearning';
import AffiliateProgram from './pages/AffiliateProgram';
import AlumniNetwork from './pages/AlumniNetwork';
import Analytics from './pages/Analytics';
import CareerPaths from './pages/CareerPaths';
import Challenges from './pages/Challenges';
import Community from './pages/Community';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import Downloads from './pages/Downloads';
import Events from './pages/Events';
import Feed from './pages/Feed';
import Forums from './pages/Forums';
import HabitTracker from './pages/HabitTracker';
import LanguageLearning from './pages/LanguageLearning';
import Languages from './pages/Languages';
import Leaderboard from './pages/Leaderboard';
import LearningPaths from './pages/LearningPaths';
import LessonViewer from './pages/LessonViewer';
import LiveStreams from './pages/LiveStreams';
import Marketplace from './pages/Marketplace';
import Mentorship from './pages/Mentorship';
import Messages from './pages/Messages';
import Microlearning from './pages/Microlearning';
import MyProgress from './pages/MyProgress';
import Portfolio from './pages/Portfolio';
import RewardsShop from './pages/RewardsShop';
import Scholarships from './pages/Scholarships';
import Skills from './pages/Skills';
import StudyBuddies from './pages/StudyBuddies';
import StudySet from './pages/StudySet';
import StudySets from './pages/StudySets';
import Subscription from './pages/Subscription';
import Tournaments from './pages/Tournaments';
import TalmudStudy from './pages/TalmudStudy';
import KabbalahStudy from './pages/KabbalahStudy';
import HalachaGuide from './pages/HalachaGuide';
import TorahStudy from './pages/TorahStudy';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "AdaptiveLearning": AdaptiveLearning,
    "AffiliateProgram": AffiliateProgram,
    "AlumniNetwork": AlumniNetwork,
    "Analytics": Analytics,
    "CareerPaths": CareerPaths,
    "Challenges": Challenges,
    "Community": Community,
    "CourseDetail": CourseDetail,
    "Courses": Courses,
    "Dashboard": Dashboard,
    "Downloads": Downloads,
    "Events": Events,
    "Feed": Feed,
    "Forums": Forums,
    "HabitTracker": HabitTracker,
    "LanguageLearning": LanguageLearning,
    "Languages": Languages,
    "Leaderboard": Leaderboard,
    "LearningPaths": LearningPaths,
    "LessonViewer": LessonViewer,
    "LiveStreams": LiveStreams,
    "Marketplace": Marketplace,
    "Mentorship": Mentorship,
    "Messages": Messages,
    "Microlearning": Microlearning,
    "MyProgress": MyProgress,
    "Portfolio": Portfolio,
    "RewardsShop": RewardsShop,
    "Scholarships": Scholarships,
    "Skills": Skills,
    "StudyBuddies": StudyBuddies,
    "StudySet": StudySet,
    "StudySets": StudySets,
    "Subscription": Subscription,
    "Tournaments": Tournaments,
    "TalmudStudy": TalmudStudy,
    "KabbalahStudy": KabbalahStudy,
    "HalachaGuide": HalachaGuide,
    "TorahStudy": TorahStudy,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};