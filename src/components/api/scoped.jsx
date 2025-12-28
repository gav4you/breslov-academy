// Multi-Tenant Scoped Query Helpers
// Ensures all data queries respect school boundaries

import { base44 } from '@/api/base44Client';

/**
 * Entities that have school_id and must be scoped
 */
const SCHOOL_SCOPED_ENTITIES = [
  'Course', 'Lesson', 'Post', 'Comment', 'UserProgress',
  'Offer', 'Coupon', 'Transaction', 'Entitlement', 'Purchase',
  'StudySet', 'StudyCard', 'LanguageVariant', 'SpacedRepetitionItem',
  'Cohort', 'CohortMember', 'CohortScheduleItem',
  'SchoolMembership', 'SchoolInvite', 'StaffInvite', 'ContentProtectionPolicy',
  'Testimonial', 'InstructorPayout', 'AuditLog', 'EventLog',
  'Announcement', 'UserAnnouncementRead', 'Affiliate', 'Referral',
  'AiTutorSession', 'AiTutorPolicyLog', 'RateLimitLog',
  'Bookmark', 'LessonNote', 'Highlight', 'Transcript',
  'Text', 'CourseReview', 'Discussion', 'ContentReport',
  'ModerationAction', 'SchoolMetricDaily', 'CourseMetricDaily',
  'Assignment', 'Submission', 'Quiz', 'QuizAttempt',
  'Download', 'Bundle', 'SubscriptionPlan', 'PayoutBatch',
  'AnalyticsEvent', 'SubscriptionInvoice', 'Certificate', 'StudySession'
];

/**
 * Global entities (no school_id) - accessible to all or admin-only
 */
const GLOBAL_ENTITIES = [
  'User', 'School', 'GoogleOAuthToken', 'GoogleDriveToken',
  'Notification', 'Integration', 'UserSchoolPreference'
];

/**
 * Check if entity requires school scoping
 */
export const requiresSchoolScope = (entityName) => {
  return SCHOOL_SCOPED_ENTITIES.includes(entityName);
};

/**
 * Scoped list - get all records for entity within school
 */
export const scopedList = async (entityName, schoolId, sort, limit) => {
  if (!schoolId && requiresSchoolScope(entityName)) {
    console.warn(`⚠️  Attempted to query ${entityName} without schoolId`);
    return [];
  }

  const filters = requiresSchoolScope(entityName) ? { school_id: schoolId } : {};
  return base44.entities[entityName].filter(filters, sort, limit);
};

/**
 * Scoped filter - query with additional filters within school
 */
export const scopedFilter = async (entityName, schoolId, additionalFilters = {}, sort, limit) => {
  if (!schoolId && requiresSchoolScope(entityName)) {
    console.warn(`⚠️  Attempted to query ${entityName} without schoolId`);
    return [];
  }

  const filters = requiresSchoolScope(entityName)
    ? { school_id: schoolId, ...additionalFilters }
    : additionalFilters;

  return base44.entities[entityName].filter(filters, sort, limit);
};

/**
 * Scoped create - ensure school_id is included
 */
export const scopedCreate = async (entityName, schoolId, payload) => {
  if (requiresSchoolScope(entityName) && !schoolId) {
    throw new Error(`Cannot create ${entityName} without schoolId`);
  }

  const data = requiresSchoolScope(entityName)
    ? { school_id: schoolId, ...payload }
    : payload;

  return base44.entities[entityName].create(data);
};

/**
 * Scoped update - validate school ownership (optional strict mode)
 */
export const scopedUpdate = async (entityName, id, payload, schoolId = null, strict = false) => {
  // In strict mode, verify record belongs to school before updating
  if (strict && schoolId && requiresSchoolScope(entityName)) {
    const records = await base44.entities[entityName].filter({ id, school_id: schoolId });
    if (records.length === 0) {
      throw new Error(`${entityName} ${id} not found in school ${schoolId}`);
    }
  }

  return base44.entities[entityName].update(id, payload);
};

/**
 * Scoped delete - validate school ownership (optional strict mode)
 */
export const scopedDelete = async (entityName, id, schoolId = null, strict = false) => {
  if (strict && schoolId && requiresSchoolScope(entityName)) {
    const records = await base44.entities[entityName].filter({ id, school_id: schoolId });
    if (records.length === 0) {
      throw new Error(`${entityName} ${id} not found in school ${schoolId}`);
    }
  }

  return base44.entities[entityName].delete(id);
};

/**
 * Build React Query cache key with school scope
 */
export const buildCacheKey = (baseKey, schoolId, ...additionalKeys) => {
  return [baseKey, schoolId, ...additionalKeys].filter(Boolean);
};