// Shared entity scoping lists
//
// IMPORTANT:
// - Keep this list as the single source of truth for which entities MUST be scoped by school_id.
// - This is used by both scoped query helpers (scoped.jsx) and the tenancy enforcer (tenancyEnforcer.js).
// - If you add a new school-owned entity, add it here.

export const SCHOOL_SCOPED_ENTITIES = [
  'Course', 'Lesson', 'Post', 'Comment', 'UserProgress',
  'Offer', 'Coupon', 'Transaction', 'Entitlement', 'Purchase', 'OfferCourse', 'CouponRedemption',
  'StudySet', 'StudyCard', 'LanguageVariant', 'SpacedRepetitionItem',
  'Cohort', 'CohortMember', 'CohortScheduleItem',
  'SchoolMembership', 'CourseStaff', 'SchoolInvite', 'StaffInvite', 'ContentProtectionPolicy',
  'Testimonial', 'InstructorPayout', 'AuditLog', 'EventLog',
  'Announcement', 'UserAnnouncementRead', 'Affiliate', 'Referral',
  'AiTutorSession', 'AiTutorPolicyLog', 'RateLimitLog',
  'AiRagIndex',
  'NotificationToken',
  'Bookmark', 'LessonNote', 'Highlight', 'Transcript',
  'Text', 'CourseReview', 'Discussion', 'ContentReport',
  'ModerationAction', 'SchoolMetricDaily', 'CourseMetricDaily',
  'Assignment', 'Submission', 'Quiz', 'QuizAttempt',
  'QuizQuestion',
  'Download', 'Bundle', 'SubscriptionPlan', 'Subscription', 'PayoutBatch',
  'AnalyticsEvent', 'SubscriptionInvoice', 'Certificate', 'StudySession',
  'Achievement', 'AdaptiveLearning', 'Alumni', 'Analytics', 'CareerPath', 'Challenge',
  'ContentModeration', 'Event', 'FeatureFlag', 'Forum', 'Habit', 'Leaderboard',
  'LearningInsight', 'LearningPath', 'LiveClass', 'LiveStream', 'Mentorship', 'Message',
  'Microlesson', 'Portfolio', 'PowerUp', 'Recommendation', 'Reward', 'Scholarship',
  'SchoolSetting', 'SkillAssessment', 'SkillGap', 'StudyBuddy', 'StudyGroup',
  'StudySchedule', 'Tournament', 'UserPowerUp', 'VideoAnnotation', 'WellnessCheck',
  'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy',
  'StripeAccount', 'StripeWebhookEvent',
  'DomainVerification', 'IntegrationConnection', 'StreamUpload'
];

export const GLOBAL_ENTITIES = [
  'User', 'School', 'GoogleOAuthToken', 'GoogleDriveToken',
  'Notification', 'Integration', 'UserSchoolPreference',
  'TenantApplication', 'AuthSession', 'AuthState', 'IdentityLink',
  'IntegrationState', 'IntegrationSecret'
];

export function requiresSchoolScope(entityName) {
  return SCHOOL_SCOPED_ENTITIES.includes(entityName);
}
