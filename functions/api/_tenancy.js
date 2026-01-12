import { listEntities } from './_store.js';

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

const PUBLIC_READ_RULES = {
  School: {
    enforce: { is_public: true },
    fields: ['id', 'name', 'slug', 'logo_url', 'hero_image_url', 'tagline', 'description', 'brand_primary', 'status', 'is_public'],
    requiresSchoolId: false,
  },
  Course: {
    enforce: { is_published: true },
    fields: ['id', 'title', 'title_hebrew', 'subtitle', 'description', 'category', 'level', 'access_level', 'access_tier', 'cover_image_url', 'thumbnail_url', 'instructor', 'duration_hours', 'outcomes', 'is_published'],
    requiresSchoolId: true,
  },
  Lesson: {
    enforce: {},
    fields: ['id', 'course_id', 'title', 'title_hebrew', 'order', 'is_preview', 'status'],
    requiresSchoolId: true,
    previewChars: 500,
  },
  Offer: {
    enforce: { is_active: true },
    fields: ['id', 'name', 'description', 'offer_type', 'price_cents', 'billing_interval', 'access_scope', 'is_active', 'courses'],
    requiresSchoolId: true,
  },
  Coupon: {
    enforce: { is_active: true },
    fields: ['id', 'code', 'discount_type', 'discount_value', 'usage_limit', 'usage_count', 'expires_at', 'is_active'],
    requiresSchoolId: true,
  },
  Testimonial: {
    enforce: {},
    fields: ['id', 'name', 'role', 'quote', 'rating', 'avatar_url'],
    requiresSchoolId: true,
  },
  CourseReview: {
    enforce: {},
    fields: ['id', 'user_name', 'user_email', 'rating', 'body', 'created_date'],
    requiresSchoolId: true,
  },
};

const PUBLIC_TOKEN_LOOKUP_ENTITIES = new Set(['SchoolInvite', 'StaffInvite']);
const SELF_SCOPED_ENTITIES = new Set(['SchoolMembership', 'UserSchoolPreference']);
const USER_SCOPED_GLOBAL_ENTITIES = new Set(['UserSchoolPreference', 'Notification', 'User']);
const PUBLIC_WRITE_ENTITIES = new Set(['TenantApplication']);

export function requiresSchoolScope(entityName) {
  if (SCHOOL_SCOPED_ENTITIES.includes(entityName)) return true;
  if (GLOBAL_ENTITIES.includes(entityName)) return false;
  return true;
}

export function isGlobalEntity(entityName) {
  return GLOBAL_ENTITIES.includes(entityName);
}

export function getPublicRule(entityName) {
  return PUBLIC_READ_RULES[entityName] || null;
}

export function isPublicTokenLookup(entityName, filters) {
  if (!PUBLIC_TOKEN_LOOKUP_ENTITIES.has(entityName)) return false;
  const token = typeof filters?.token === 'string' ? filters.token.trim() : '';
  return token.length >= 16;
}

export function normalizeFilters(filters) {
  if (!filters || typeof filters !== 'object') return {};
  return { ...filters };
}

export function applyPublicRule(entityName, filters) {
  const rule = getPublicRule(entityName);
  if (!rule) return null;
  const next = normalizeFilters(filters);
  const enforce = rule.enforce || {};
  Object.entries(enforce).forEach(([key, value]) => {
    next[key] = value;
  });
  return next;
}

export function sanitizePublicFields(entityName, requestedFields) {
  const rule = getPublicRule(entityName);
  if (!rule?.fields) return requestedFields || null;
  if (!requestedFields || requestedFields.length === 0) return rule.fields;
  const allow = new Set(rule.fields);
  return requestedFields.filter((field) => allow.has(field));
}

export function sanitizePublicPreviewChars(entityName, requestedPreviewChars) {
  const rule = getPublicRule(entityName);
  if (!rule?.previewChars) return requestedPreviewChars;
  const requested = Number(requestedPreviewChars);
  if (!Number.isFinite(requested) || requested <= 0) return rule.previewChars;
  return Math.min(requested, rule.previewChars);
}

export function isSelfScoped(entityName, filters, userEmail) {
  if (!SELF_SCOPED_ENTITIES.has(entityName)) return false;
  if (!filters?.user_email) return false;
  if (!userEmail) return false;
  return String(filters.user_email).toLowerCase() === String(userEmail).toLowerCase();
}

export function isUserScopedGlobal(entityName, filters, userEmail) {
  if (!USER_SCOPED_GLOBAL_ENTITIES.has(entityName)) return false;
  if (!filters?.user_email) return false;
  if (!userEmail) return false;
  return String(filters.user_email).toLowerCase() === String(userEmail).toLowerCase();
}

export function canWriteUnauth(entityName, method) {
  return method === 'POST' && PUBLIC_WRITE_ENTITIES.has(entityName);
}

export function isGlobalAdmin(user, env) {
  if (!user) return false;
  if (user.id === 'dev-user') return true;
  const role = String(user.role || '').toLowerCase();
  if (['superadmin', 'platform_admin', 'global_admin'].includes(role)) return true;
  if (env?.GLOBAL_ADMIN_ROLE && role === String(env.GLOBAL_ADMIN_ROLE).toLowerCase()) return true;
  const list = String(env?.GLOBAL_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (list.length && user.email) {
    return list.includes(String(user.email).toLowerCase());
  }
  return false;
}

export async function isSchoolPublic(env, schoolId) {
  if (!schoolId) return false;
  const rows = await listEntities(env, 'School', { filters: { id: String(schoolId) }, limit: 1 });
  const school = rows?.[0];
  return Boolean(school?.is_public);
}

export async function hasMembership(env, schoolId, userEmail) {
  if (!schoolId || !userEmail) return false;
  const rows = await listEntities(env, 'SchoolMembership', {
    filters: { school_id: String(schoolId), user_email: String(userEmail) },
    limit: 1,
  });
  return Boolean(rows?.[0]);
}

export async function findSchoolByFilter(env, filters) {
  if (!filters) return null;
  if (filters.id) {
    const rows = await listEntities(env, 'School', { filters: { id: String(filters.id) }, limit: 1 });
    return rows?.[0] || null;
  }
  if (filters.slug) {
    const rows = await listEntities(env, 'School', { filters: { slug: String(filters.slug) }, limit: 1 });
    return rows?.[0] || null;
  }
  return null;
}

export async function hasInviteForUser(env, schoolId, userEmail) {
  if (!schoolId || !userEmail) return null;
  const [schoolInvites, staffInvites] = await Promise.all([
    listEntities(env, 'SchoolInvite', {
      filters: { school_id: String(schoolId), email: String(userEmail) },
      limit: 25,
    }),
    listEntities(env, 'StaffInvite', {
      filters: { school_id: String(schoolId), email: String(userEmail) },
      limit: 25,
    }),
  ]);
  const now = new Date();
  const invites = [...(schoolInvites || []), ...(staffInvites || [])];
  return invites.find((invite) => {
    const status = String(invite.status || '').toUpperCase();
    if (invite.accepted_at) return false;
    if (status && status !== 'PENDING') return false;
    if (invite.expires_at && new Date(invite.expires_at) <= now) return false;
    return true;
  }) || null;
}
