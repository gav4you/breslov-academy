import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Subscription from './pages/Subscription';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonViewer';
import MyProgress from './pages/MyProgress';
import LearningPaths from './pages/LearningPaths';
import Community from './pages/Community';
import Achievements from './pages/Achievements';
import LanguageLearning from './pages/LanguageLearning';
import Languages from './pages/Languages';
import Analytics from './pages/Analytics';
import AffiliateProgram from './pages/AffiliateProgram';
import StudySets from './pages/StudySets';
import StudySet from './pages/StudySet';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Courses": Courses,
    "Subscription": Subscription,
    "CourseDetail": CourseDetail,
    "LessonViewer": LessonViewer,
    "MyProgress": MyProgress,
    "LearningPaths": LearningPaths,
    "Community": Community,
    "Achievements": Achievements,
    "LanguageLearning": LanguageLearning,
    "Languages": Languages,
    "Analytics": Analytics,
    "AffiliateProgram": AffiliateProgram,
    "StudySets": StudySets,
    "StudySet": StudySet,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};