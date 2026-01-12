// Feature Flags Registry
// Defines all toggleable features in the platform.
// Used by useFeatureFlag hook and Admin Feature Manager.

export const FEATURE_FLAGS = {
  // Core Platform
  ENABLE_REGISTRATION: {
    key: 'ENABLE_REGISTRATION',
    label: 'Public Registration',
    description: 'Allow new users to sign up.',
    defaultValue: true,
    scope: 'global' // only system admins can toggle
  },
  
  // Learning Experience
  ENABLE_AI_TUTOR: {
    key: 'ENABLE_AI_TUTOR',
    label: 'AI Tutor',
    description: 'Enable the AI-powered teaching assistant for students.',
    defaultValue: false,
    scope: 'school'
  },
  ENABLE_GAMIFICATION: {
    key: 'ENABLE_GAMIFICATION',
    label: 'Gamification',
    description: 'Leaderboards, badges, and points system.',
    defaultValue: true,
    scope: 'school'
  },
  
  // Teaching Tools
  ENABLE_BETA_EDITOR: {
    key: 'ENABLE_BETA_EDITOR',
    label: 'Beta Course Editor',
    description: 'New drag-and-drop course builder experience.',
    defaultValue: false,
    scope: 'user' // per-user opt-in
  },
  
  // Integrations
  ENABLE_ZOOM: {
    key: 'ENABLE_ZOOM',
    label: 'Zoom Integration',
    description: 'Allow instructors to schedule Zoom meetings.',
    defaultValue: false,
    scope: 'school'
  },
  ENABLE_DISCORD: {
    key: 'ENABLE_DISCORD',
    label: 'Discord Community',
    description: 'Link courses to Discord channels.',
    defaultValue: false,
    scope: 'school'
  },
  ENABLE_INTEGRATIONS: {
    key: 'ENABLE_INTEGRATIONS',
    label: 'Integrations Marketplace',
    description: 'Show the integrations marketplace and connection flows.',
    defaultValue: true,
    scope: 'school'
  }
};

export const getFlagDefaults = () => {
  return Object.values(FEATURE_FLAGS).reduce((acc, flag) => {
    acc[flag.key] = flag.defaultValue;
    return acc;
  }, {});
};
