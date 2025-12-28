// FEATURE REGISTRY - Single Source of Truth
// DO NOT delete features from this registry. Only add.

export const FEATURE_AREAS = {
  core: { label: 'Core Learning', color: 'bg-blue-100 text-blue-800', order: 1 },
  teach: { label: 'Teaching Tools', color: 'bg-green-100 text-green-800', order: 2 },
  admin: { label: 'Administration', color: 'bg-purple-100 text-purple-800', order: 3 },
  marketing: { label: 'Marketing & Sales', color: 'bg-amber-100 text-amber-800', order: 4 },
  labs: { label: 'Labs & Experiments', color: 'bg-pink-100 text-pink-800', order: 5 },
  system: { label: 'System & Utilities', color: 'bg-slate-100 text-slate-800', order: 6 }
};

export const FEATURES = {
  // CORE LEARNING
  dashboard: { key: 'dashboard', label: 'Dashboard', route: '/dashboard', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Home', order: 1 },
  courses: { key: 'courses', label: 'Courses', route: '/courses', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'BookOpen', order: 2 },
  courseDetail: { key: 'coursedetail', label: 'Course Detail', route: '/coursedetail', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Book', hidden: true },
  lessonViewer: { key: 'lessonviewerpremium', label: 'Lesson Viewer', route: '/lessonviewerpremium', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Play', hidden: true },
  reader: { key: 'reader', label: 'Smart Reader', route: '/reader', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'BookMarked', order: 3 },
  feed: { key: 'feed', label: 'Community', route: '/feed', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Users', order: 4 },
  schoolSearch: { key: 'schoolsearch', label: 'Search', route: '/schoolsearch', area: 'core', audiences: ['student', 'teacher', 'admin'], icon: 'Search', order: 5 },
  
  // TEACHING
  teach: { key: 'teach', label: 'Teach', route: '/teach', area: 'teach', audiences: ['teacher', 'admin'], icon: 'GraduationCap', order: 1 },
  teachCourse: { key: 'teachcourse', label: 'Course Builder', route: '/teachcourse', area: 'teach', audiences: ['teacher', 'admin'], icon: 'Edit', hidden: true },
  teachCourseNew: { key: 'teachcoursenew', label: 'New Course', route: '/teachcoursenew', area: 'teach', audiences: ['teacher', 'admin'], icon: 'Plus', hidden: true },
  teachLesson: { key: 'teachlesson', label: 'Lesson Editor', route: '/teachlesson', area: 'teach', audiences: ['teacher', 'admin'], icon: 'FileEdit', hidden: true },
  teachAnalytics: { key: 'teachanalytics', label: 'Analytics', route: '/teachanalytics', area: 'teach', audiences: ['teacher', 'admin'], icon: 'BarChart', order: 2 },
  
  // ADMIN
  schoolAdmin: { key: 'schooladmin', label: 'School Admin', route: '/schooladmin', area: 'admin', audiences: ['admin'], icon: 'Settings', order: 1 },
  schoolAnalytics: { key: 'schoolanalytics', label: 'Analytics', route: '/schoolanalytics', area: 'admin', audiences: ['admin'], icon: 'TrendingUp', order: 2 },
  schoolNew: { key: 'schoolnew', label: 'Create School', route: '/schoolnew', area: 'admin', audiences: ['admin'], icon: 'Plus', hidden: true },
  schoolJoin: { key: 'schooljoin', label: 'Join School', route: '/schooljoin', area: 'system', audiences: ['student', 'teacher', 'admin'], hidden: true },
  adminHardening: { key: 'adminhardening', label: 'Security', route: '/adminhardening', area: 'admin', audiences: ['admin'], icon: 'Shield', vaultOnly: true },
  
  // MARKETING & STOREFRONT
  schoolLanding: { key: 'schoollanding', label: 'Landing Page', route: '/schoollanding', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'Globe' },
  schoolCourses: { key: 'schoolcourses', label: 'Course Catalog', route: '/schoolcourses', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'Library' },
  courseSales: { key: 'coursesales', label: 'Sales Page', route: '/coursesales', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'ShoppingBag', hidden: true },
  schoolCheckout: { key: 'schoolcheckout', label: 'Checkout', route: '/schoolcheckout', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], icon: 'CreditCard', hidden: true },
  schoolThankYou: { key: 'schoolthankyou', label: 'Thank You', route: '/schoolthankyou', area: 'marketing', audiences: ['public', 'student', 'teacher', 'admin'], hidden: true },
  
  // LABS
  languageLearning: { key: 'languagelearning', label: 'Languages', route: '/languagelearning', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Globe' },
  studySets: { key: 'studysets', label: 'Study Sets', route: '/studysets', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Layers' },
  studySetPractice: { key: 'studysetpractice', label: 'Practice', route: '/studysetpractice', area: 'labs', audiences: ['student', 'teacher', 'admin'], hidden: true },
  cohorts: { key: 'cohorts', label: 'Cohorts', route: '/cohorts', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Users' },
  offline: { key: 'offline', label: 'Offline', route: '/offline', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Download' },
  achievements: { key: 'achievements', label: 'Achievements', route: '/achievements', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Award' },
  challenges: { key: 'challenges', label: 'Challenges', route: '/challenges', area: 'labs', audiences: ['student', 'teacher', 'admin'], icon: 'Trophy' },
  
  // SYSTEM
  schoolSelect: { key: 'schoolselect', label: 'School Select', route: '/schoolselect', area: 'system', audiences: ['student', 'teacher', 'admin'], icon: 'Building', hidden: true },
  integrations: { key: 'integrations', label: 'Integrations', route: '/integrations', area: 'system', audiences: ['student', 'teacher', 'admin'], icon: 'Plug' },
  portfolio: { key: 'portfolio', label: 'Profile', route: '/portfolio', area: 'system', audiences: ['student', 'teacher', 'admin'], icon: 'User' },
  vault: { key: 'vault', label: 'Vault', route: '/vault', area: 'system', audiences: ['student', 'teacher', 'admin'], icon: 'Archive' },
  oauth2callback: { key: 'oauth2callback', label: 'OAuth Callback', route: '/oauth2callback', area: 'system', audiences: ['public'], hidden: true },
  integrity: { key: 'integrity', label: 'Integrity Check', route: '/integrity', area: 'system', audiences: ['admin'], icon: 'CheckCircle', vaultOnly: true }
};

// Helper functions
export const normalizeAudienceFromRole = (role) => {
  if (!role) return 'student';
  const r = role.toUpperCase();
  if (r === 'OWNER' || r === 'ADMIN') return 'admin';
  if (r === 'INSTRUCTOR' || r === 'TA') return 'teacher';
  return 'student';
};

export const getFeatureByKey = (key) => FEATURES[key];

export const getFeaturesForAudience = (audience) => {
  return Object.values(FEATURES).filter(f => f.audiences.includes(audience));
};

export const getFeaturesByArea = (area) => {
  return Object.values(FEATURES).filter(f => f.area === area);
};

export const getAllRoutes = () => {
  return Object.values(FEATURES).map(f => f.route);
};

export const getNavGroupsForAudience = (audience) => {
  const groups = {};
  Object.values(FEATURES)
    .filter(f => !f.hidden && !f.vaultOnly && f.audiences.includes(audience))
    .forEach(feature => {
      if (!groups[feature.area]) {
        groups[feature.area] = {
          ...FEATURE_AREAS[feature.area],
          features: []
        };
      }
      groups[feature.area].features.push(feature);
    });
  
  // Sort features within each group by order
  Object.values(groups).forEach(group => {
    group.features.sort((a, b) => (a.order || 999) - (b.order || 999));
  });
  
  return Object.values(groups).sort((a, b) => a.order - b.order);
};