import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../../_utils.js';
import { createEntity, deleteEntity, listEntities, updateEntity } from '../../_store.js';
import { getUserFromToken } from '../../_auth.js';
import { applyLessonAccess, applyQuizQuestionAccess } from '../../_access.js';
import { buildAuditEntries } from '../../_audit.js';
import {
  getPublicRule,
  hasInviteForUser,
  hasMembership,
  isGlobalAdmin,
  isGlobalEntity,
  isSchoolPublic,
  isUserScopedGlobal,
  requiresSchoolScope,
  sanitizePublicFields,
} from '../../_tenancy.js';

const ADMIN_ROLES = new Set(['OWNER', 'ADMIN', 'SUPERADMIN']);
const STAFF_ROLES = new Set(['OWNER', 'ADMIN', 'INSTRUCTOR', 'TEACHER', 'TA', 'RAV', 'RABBI', 'SUPERADMIN']);

const ADMIN_READ_ENTITIES = new Set([
  'AuditLog',
  'InstructorPayout',
  'PayoutBatch',
  'StripeAccount',
  'StripeWebhookEvent',
  'PricingChangeRequest',
  'IntegrationConnection',
  'DomainVerification',
  'SchoolAuthPolicy',
  'ContentProtectionPolicy',
  'SchoolSetting',
  'SchoolInvite',
  'StaffInvite',
  'SchoolMembership',
  'SubscriptionPlan',
  'SubscriptionInvoice',
  'FeatureFlag',
  'NotificationToken',
  'AiRagIndex',
]);

const ADMIN_WRITE_ENTITIES = new Set([
  'AuditLog',
  'InstructorPayout',
  'PayoutBatch',
  'StripeAccount',
  'StripeWebhookEvent',
  'PricingChangeRequest',
  'IntegrationConnection',
  'DomainVerification',
  'SchoolAuthPolicy',
  'ContentProtectionPolicy',
  'SchoolSetting',
  'SchoolInvite',
  'StaffInvite',
  'SchoolMembership',
  'SubscriptionPlan',
  'SubscriptionInvoice',
  'FeatureFlag',
  'NotificationToken',
  'AiRagIndex',
  'Offer',
  'Coupon',
  'Subscription',
  'Bundle',
  'Affiliate',
  'Referral',
  'CourseStaff',
  'StreamUpload',
]);

const STAFF_WRITE_ENTITIES = new Set([
  'Course',
  'Lesson',
  'Quiz',
  'QuizQuestion',
  'Assignment',
  'Announcement',
  'LiveClass',
  'LiveStream',
  'Cohort',
  'CohortScheduleItem',
  'CohortMember',
]);

const INVITE_UPDATE_FIELDS = new Set(['accepted_at', 'status']);

function normalizeRole(role) {
  return String(role || '').toUpperCase();
}

function isAdminRole(role) {
  return ADMIN_ROLES.has(normalizeRole(role));
}

function isStaffRole(role) {
  return STAFF_ROLES.has(normalizeRole(role));
}

async function getMembership(env, schoolId, email) {
  if (!schoolId || !email) return null;
  const rows = await listEntities(env, 'SchoolMembership', {
    filters: { school_id: String(schoolId), user_email: String(email) },
    limit: 1,
  });
  return rows?.[0] || null;
}

export async function onRequest({ request, env, params }) {
  const options = handleOptions(request, env);
  if (options) return options;

  const entity = params?.entity ? String(params.entity) : null;
  const id = params?.id ? String(params.id) : null;

  if (!entity || !id) {
    return errorResponse('missing_entity', 400, 'Missing entity id', env);
  }

  const token = getBearerToken(request);
  const user = await getUserFromToken(token, env);
  const isAuthenticated = Boolean(user?.email);
  const globalAdmin = isGlobalAdmin(user, env);

  let record = null;
  try {
    const rows = await listEntities(env, entity, { filters: { id }, limit: 1 });
    record = rows?.[0] || null;
  } catch (err) {
    return errorResponse('storage_unavailable', 503, err.message, env);
  }

  if (request.method === 'GET') {
    if (!record) {
      return errorResponse('not_found', 404, 'Entity not found', env);
    }
    const publicRule = getPublicRule(entity);

    if (!isAuthenticated) {
      if (entity === 'School' && record.is_public) {
        const safeFields = sanitizePublicFields(entity, null);
        if (!safeFields || safeFields.length === 0) return json(record, { env });
        const allow = new Set(safeFields.concat(['id']));
        const out = {};
        Object.entries(record).forEach(([key, value]) => {
          if (allow.has(key)) out[key] = value;
        });
        return json(out, { env });
      }
      if (requiresSchoolScope(entity) && publicRule && record.school_id) {
        const schoolOk = await isSchoolPublic(env, record.school_id);
        if (schoolOk) {
          const safeFields = sanitizePublicFields(entity, null);
          if (!safeFields || safeFields.length === 0) return json(record, { env });
          const allow = new Set(safeFields.concat(['id']));
          const out = {};
          Object.entries(record).forEach(([key, value]) => {
            if (allow.has(key)) out[key] = value;
          });
          return json(out, { env });
        }
      }
      return errorResponse('auth_required', 401, 'Authentication required', env);
    }

    if (entity === 'School') {
      if (globalAdmin) return json(record, { env });
      const isMember = await hasMembership(env, record.id, user.email);
      if (isMember) return json(record, { env });
      const invited = await hasInviteForUser(env, record.id, user.email);
      if (invited) return json(record, { env });
      if (record.is_public) {
        const safeFields = sanitizePublicFields(entity, null);
        if (!safeFields || safeFields.length === 0) return json(record, { env });
        const allow = new Set(safeFields.concat(['id']));
        const out = {};
        Object.entries(record).forEach(([key, value]) => {
          if (allow.has(key)) out[key] = value;
        });
        return json(out, { env });
      }
      return errorResponse('forbidden', 403, 'Not authorized to access this school', env);
    }

    if (requiresSchoolScope(entity)) {
      if (!record.school_id) {
        return errorResponse('forbidden', 403, 'Missing school scope', env);
      }
      if (!globalAdmin) {
        const membership = await getMembership(env, record.school_id, user.email);
        const role = membership?.role || null;
        const isMember = Boolean(membership);
        const isSelfMembership = entity === 'SchoolMembership'
          && String(record.user_email || '').toLowerCase() === String(user.email || '').toLowerCase();

        if (!(entity === 'SchoolMembership' && isSelfMembership)) {
          if (ADMIN_READ_ENTITIES.has(entity) && !isAdminRole(role)) {
            return errorResponse('forbidden', 403, 'Admin role required', env);
          }
        }

        if (!isMember && publicRule) {
          const schoolOk = await isSchoolPublic(env, record.school_id);
          if (schoolOk) {
            const safeFields = sanitizePublicFields(entity, null);
            if (!safeFields || safeFields.length === 0) return json(record, { env });
            const allow = new Set(safeFields.concat(['id']));
            const out = {};
            Object.entries(record).forEach(([key, value]) => {
              if (allow.has(key)) out[key] = value;
            });
            return json(out, { env });
          }
        }
        if (!isMember && !(entity === 'SchoolMembership' && isSelfMembership)) {
          return errorResponse('forbidden', 403, 'Not authorized for this school', env);
        }
      }
    } else if (isGlobalEntity(entity)) {
      if (!globalAdmin && !isUserScopedGlobal(entity, record, user.email)) {
        return errorResponse('forbidden', 403, 'Not authorized', env);
      }
    }

    if (!globalAdmin && entity === 'Lesson') {
      const sanitized = await applyLessonAccess({
        env,
        schoolId: record.school_id,
        userEmail: user.email,
        lessons: [record],
      });
      return json(sanitized?.[0] || record, { env });
    }

    if (!globalAdmin && entity === 'QuizQuestion') {
      const allowed = await applyQuizQuestionAccess({
        env,
        schoolId: record.school_id,
        userEmail: user.email,
        questions: [record],
      });
      if (!allowed?.length) {
        return errorResponse('forbidden', 403, 'Not authorized to access this quiz question', env);
      }
      return json(allowed[0], { env });
    }

    return json(record, { env });
  }

  if (request.method === 'PATCH') {
    const payload = await readJson(request);
    if (!payload) {
      return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
    }
    if (!isAuthenticated) {
      return errorResponse('auth_required', 401, 'Authentication required', env);
    }
    if (!record) {
      return errorResponse('not_found', 404, 'Entity not found', env);
    }

    if (requiresSchoolScope(entity)) {
      const schoolId = record.school_id;
      if (!schoolId) {
        return errorResponse('forbidden', 403, 'Missing school scope', env);
      }
      if (!globalAdmin) {
        const membership = await getMembership(env, schoolId, user.email);
        const role = membership?.role || null;
        const isMember = Boolean(membership);
        const invitee = (entity === 'SchoolInvite' || entity === 'StaffInvite')
          && String(record.email || '').toLowerCase() === String(user.email || '').toLowerCase();
        const isSelfMembership = entity === 'SchoolMembership'
          && String(record.user_email || '').toLowerCase() === String(user.email || '').toLowerCase();

        if (invitee) {
          const invalid = Object.keys(payload || {}).some((key) => !INVITE_UPDATE_FIELDS.has(key));
          if (invalid) {
            return errorResponse('forbidden', 403, 'Invitee cannot modify invite fields', env);
          }
        } else if (entity === 'SchoolMembership' && isSelfMembership && !isAdminRole(role)) {
          const invite = await hasInviteForUser(env, schoolId, user.email);
          if (!invite) {
            return errorResponse('forbidden', 403, 'Invite required to update membership', env);
          }
          const allowedKeys = new Set(['role', 'joined_at']);
          const invalid = Object.keys(payload || {}).some((key) => !allowedKeys.has(key));
          if (invalid) {
            return errorResponse('forbidden', 403, 'Membership update not allowed', env);
          }
          if (payload?.role && invite?.role && normalizeRole(payload.role) !== normalizeRole(invite.role)) {
            return errorResponse('forbidden', 403, 'Invite role mismatch', env);
          }
        } else {
          if (!isMember) {
            return errorResponse('forbidden', 403, 'Not authorized for this school', env);
          }
          if (ADMIN_WRITE_ENTITIES.has(entity) && !isAdminRole(role)) {
            return errorResponse('forbidden', 403, 'Admin role required', env);
          }
          if (STAFF_WRITE_ENTITIES.has(entity) && !isStaffRole(role)) {
            return errorResponse('forbidden', 403, 'Staff role required', env);
          }
        }
      }
      if (!globalAdmin && Object.prototype.hasOwnProperty.call(payload || {}, 'school_id') && String(payload.school_id) !== String(schoolId)) {
        return errorResponse('forbidden', 403, 'Cannot change school scope', env);
      }
    } else if (isGlobalEntity(entity)) {
      if (!globalAdmin && !isUserScopedGlobal(entity, record, user.email)) {
        return errorResponse('forbidden', 403, 'Not authorized', env);
      }
    }

    try {
      const updated = await updateEntity(env, entity, id, payload);
      if (!updated) {
        return errorResponse('not_found', 404, 'Entity not found', env);
      }
      if (user?.email) {
        try {
          const entries = buildAuditEntries(entity, record, updated, user.email);
          for (const entry of entries || []) {
            await createEntity(env, 'AuditLog', entry);
          }
        } catch {
          // Best-effort audit logging
        }
      }
      return json(updated, { env });
    } catch (err) {
      return errorResponse('storage_unavailable', 503, err.message, env);
    }
  }

  if (request.method === 'DELETE') {
    if (!isAuthenticated) {
      return errorResponse('auth_required', 401, 'Authentication required', env);
    }
    if (!record) {
      return errorResponse('not_found', 404, 'Entity not found', env);
    }
    if (requiresSchoolScope(entity)) {
      const schoolId = record.school_id;
      if (!schoolId) {
        return errorResponse('forbidden', 403, 'Missing school scope', env);
      }
      if (!globalAdmin) {
        const membership = await getMembership(env, schoolId, user.email);
        const role = membership?.role || null;
        const isMember = Boolean(membership);
        if (!isMember) {
          return errorResponse('forbidden', 403, 'Not authorized for this school', env);
        }
        if (ADMIN_WRITE_ENTITIES.has(entity) && !isAdminRole(role)) {
          return errorResponse('forbidden', 403, 'Admin role required', env);
        }
        if (STAFF_WRITE_ENTITIES.has(entity) && !isStaffRole(role)) {
          return errorResponse('forbidden', 403, 'Staff role required', env);
        }
      }
    } else if (isGlobalEntity(entity)) {
      if (!globalAdmin && !isUserScopedGlobal(entity, record, user.email)) {
        return errorResponse('forbidden', 403, 'Not authorized', env);
      }
    }

    try {
      const deleted = await deleteEntity(env, entity, id);
      if (!deleted) {
        return errorResponse('not_found', 404, 'Entity not found', env);
      }
      return json({ deleted: true }, { env });
    } catch (err) {
      return errorResponse('storage_unavailable', 503, err.message, env);
    }
  }

  return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
}
