import { errorResponse, getBearerToken, handleOptions, json, normalizeLimit, parseQueryJson, readJson } from '../_utils.js';
import { createEntity, listEntities } from '../_store.js';
import { getUserFromToken } from '../_auth.js';
import { applyFieldProjection, applyLessonAccess, applyQuizQuestionAccess } from '../_access.js';
import { verifyTurnstileToken } from '../_turnstile.js';
import {
  applyPublicRule,
  canWriteUnauth,
  findSchoolByFilter,
  getPublicRule,
  hasInviteForUser,
  hasMembership,
  isGlobalAdmin,
  isGlobalEntity,
  isPublicTokenLookup,
  isSchoolPublic,
  isSelfScoped,
  isUserScopedGlobal,
  requiresSchoolScope,
  sanitizePublicFields,
  sanitizePublicPreviewChars,
} from '../_tenancy.js';

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

function normalizePreviewChars(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.min(Math.floor(parsed), 20000);
}

function normalizeFields(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v)).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw.split(',').map((v) => v.trim()).filter(Boolean);
  }
  return null;
}

export async function onRequest({ request, env, params }) {
  const options = handleOptions(request, env);
  if (options) return options;

  const entity = params?.entity ? String(params.entity) : null;
  if (!entity) {
    return errorResponse('missing_entity', 400, 'Missing entity name', env);
  }
  const token = getBearerToken(request);
  const user = await getUserFromToken(token, env);
  const isAuthenticated = Boolean(user?.email);
  const globalAdmin = isGlobalAdmin(user, env);

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const filters = parseQueryJson(url.searchParams.get('filter')) || {};
    const sort = url.searchParams.get('sort') || null;
    const limit = normalizeLimit(url.searchParams.get('limit'));
    const fieldsRaw = parseQueryJson(url.searchParams.get('fields')) || url.searchParams.get('fields');
    const fields = normalizeFields(fieldsRaw);
    const previewChars = normalizePreviewChars(url.searchParams.get('previewChars'));
    const publicRule = getPublicRule(entity);
    const publicFilters = publicRule ? applyPublicRule(entity, filters) : null;
    const requiresAccessGate = entity === 'Lesson' || entity === 'QuizQuestion';
    const tokenLookup = isPublicTokenLookup(entity, filters);

    if (tokenLookup) {
      try {
        const rows = await listEntities(env, entity, { filters, sort, limit, fields, previewChars });
        return json(rows, { env });
      } catch (err) {
        return errorResponse('storage_unavailable', 503, err.message, env);
      }
    }

    if (!isAuthenticated) {
      if (!publicRule || !publicFilters) {
        return errorResponse('auth_required', 401, 'Authentication required', env);
      }
      if (publicRule.requiresSchoolId && !publicFilters.school_id) {
        return errorResponse('missing_school', 400, 'school_id is required', env);
      }
      if (requiresSchoolScope(entity) && publicRule.requiresSchoolId) {
        const schoolOk = await isSchoolPublic(env, publicFilters.school_id);
        if (!schoolOk) {
          return errorResponse('forbidden', 403, 'School is not public', env);
        }
      }
      const safeFields = sanitizePublicFields(entity, fields);
      const safePreview = sanitizePublicPreviewChars(entity, previewChars);
      try {
        const rows = await listEntities(env, entity, { filters: publicFilters, sort, limit, fields: safeFields, previewChars: safePreview });
        return json(rows, { env });
      } catch (err) {
        return errorResponse('storage_unavailable', 503, err.message, env);
      }
    }

    if (entity === 'School') {
      if (globalAdmin) {
        try {
          const rows = await listEntities(env, entity, { filters, sort, limit, fields, previewChars });
          return json(rows, { env });
        } catch (err) {
          return errorResponse('storage_unavailable', 503, err.message, env);
        }
      }

      if (filters?.is_public === true) {
        const safeFields = sanitizePublicFields(entity, fields);
        try {
          const rows = await listEntities(env, entity, { filters: publicFilters || filters, sort, limit, fields: safeFields, previewChars });
          return json(rows, { env });
        } catch (err) {
          return errorResponse('storage_unavailable', 503, err.message, env);
        }
      }

      const school = await findSchoolByFilter(env, filters);
      if (!school) {
        return json([], { env });
      }

      const isMember = await hasMembership(env, school.id, user.email);
      if (isMember) {
        return json([school], { env });
      }

      const invited = await hasInviteForUser(env, school.id, user.email);
      if (invited) {
        return json([school], { env });
      }

      if (school.is_public) {
        const safeFields = sanitizePublicFields(entity, fields);
        return json([school].map((row) => {
          if (!safeFields || safeFields.length === 0) return row;
          const allow = new Set(safeFields.concat(['id']));
          const out = {};
          Object.entries(row).forEach(([key, value]) => {
            if (allow.has(key)) out[key] = value;
          });
          return out;
        }), { env });
      }

      return errorResponse('forbidden', 403, 'Not authorized to access this school', env);
    }

    if (requiresSchoolScope(entity)) {
      const schoolId = filters?.school_id ? String(filters.school_id) : null;
      const selfScoped = isSelfScoped(entity, filters, user.email);

      if (!schoolId && !selfScoped) {
        return errorResponse('missing_school', 400, 'school_id is required', env);
      }

      if (schoolId && !globalAdmin) {
        const membership = await getMembership(env, schoolId, user.email);
        const role = membership?.role || null;
        const isMember = Boolean(membership);

        if (!(entity === 'SchoolMembership' && selfScoped)) {
          if (ADMIN_READ_ENTITIES.has(entity) && !isAdminRole(role)) {
            return errorResponse('forbidden', 403, 'Admin role required', env);
          }
        }

        if (!isMember && publicRule && publicFilters) {
          const schoolOk = await isSchoolPublic(env, schoolId);
          if (!schoolOk) {
            return errorResponse('forbidden', 403, 'Not authorized for this school', env);
          }
          const safeFields = sanitizePublicFields(entity, fields);
          const safePreview = sanitizePublicPreviewChars(entity, previewChars);
        try {
          const rows = await listEntities(env, entity, { filters: publicFilters, sort, limit, fields: safeFields, previewChars: safePreview });
          return json(rows, { env });
        } catch (err) {
          return errorResponse('storage_unavailable', 503, err.message, env);
        }
      }
        if (!isMember && !(entity === 'SchoolMembership' && selfScoped)) {
          return errorResponse('forbidden', 403, 'Not authorized for this school', env);
        }
      }
    } else if (isGlobalEntity(entity)) {
      if (!globalAdmin && !isUserScopedGlobal(entity, filters, user.email)) {
        return errorResponse('forbidden', 403, 'Not authorized', env);
      }
    }

    const rawFields = fields;
    const rawPreview = previewChars;
    const shouldGate = requiresAccessGate && !globalAdmin;
    const listFields = shouldGate ? null : rawFields;
    const listPreviewChars = shouldGate ? null : rawPreview;

    try {
      let rows = await listEntities(env, entity, { filters, sort, limit, fields: listFields, previewChars: listPreviewChars });
      if (shouldGate) {
        if (entity === 'Lesson') {
          rows = await applyLessonAccess({
            env,
            schoolId: filters?.school_id,
            userEmail: user.email,
            lessons: rows,
            previewChars: rawPreview,
          });
        }
        if (entity === 'QuizQuestion') {
          rows = await applyQuizQuestionAccess({
            env,
            schoolId: filters?.school_id,
            userEmail: user.email,
            questions: rows,
          });
        }
        rows = applyFieldProjection(rows, rawFields);
      }
      return json(rows, { env });
    } catch (err) {
      return errorResponse('storage_unavailable', 503, err.message, env);
    }
  }

  if (request.method === 'POST') {
    const rawPayload = await readJson(request);
    if (!rawPayload) {
      return errorResponse('invalid_payload', 400, 'Expected JSON body', env, request);
    }
    const unauthWriteAllowed = !isAuthenticated && canWriteUnauth(entity, request.method);
    if (!isAuthenticated && !unauthWriteAllowed) {
      return errorResponse('auth_required', 401, 'Authentication required', env, request);
    }
    let payload = rawPayload;
    if (!isAuthenticated && entity === 'TenantApplication') {
      const token = rawPayload.turnstile_token || rawPayload.turnstileToken;
      const turnstileCheck = await verifyTurnstileToken({ env, request, token });
      if (!turnstileCheck.allowed) {
        return errorResponse('turnstile_failed', 403, 'Security check failed', env, request);
      }
      payload = { ...rawPayload };
      delete payload.turnstile_token;
      delete payload.turnstileToken;
    }
    if (requiresSchoolScope(entity)) {
      const schoolId = payload.school_id ? String(payload.school_id) : null;
      if (!schoolId) {
        return errorResponse('missing_school', 400, 'school_id is required', env, request);
      }
      if (!globalAdmin) {
        if (entity === 'SchoolMembership') {
          const payloadEmail = payload.user_email || payload.userEmail || '';
          if (payloadEmail && String(payloadEmail).toLowerCase() !== String(user.email).toLowerCase()) {
            return errorResponse('forbidden', 403, 'Cannot create membership for another user', env, request);
          }
        }
        const membership = await getMembership(env, schoolId, user.email);
        const role = membership?.role || null;
        const isMember = Boolean(membership);

        const invite = entity === 'SchoolMembership'
          ? await hasInviteForUser(env, schoolId, user.email)
          : null;
        const invited = Boolean(invite);
        if (entity === 'SchoolMembership' && invited && invite?.role && payload.role) {
          if (normalizeRole(payload.role) !== normalizeRole(invite.role)) {
            return errorResponse('forbidden', 403, 'Invite role mismatch', env, request);
          }
        }

        if (ADMIN_WRITE_ENTITIES.has(entity) && !isAdminRole(role) && !(entity === 'SchoolMembership' && invited)) {
          return errorResponse('forbidden', 403, 'Admin role required', env, request);
        }
        if (STAFF_WRITE_ENTITIES.has(entity) && !isStaffRole(role)) {
          return errorResponse('forbidden', 403, 'Staff role required', env, request);
        }

        if (!isMember && !(entity === 'SchoolMembership' && invited)) {
          return errorResponse('forbidden', 403, 'Not authorized for this school', env, request);
        }
      }
    } else if (isGlobalEntity(entity) && !canWriteUnauth(entity, request.method)) {
      if (!globalAdmin && !isUserScopedGlobal(entity, payload, user.email)) {
        return errorResponse('forbidden', 403, 'Not authorized', env, request);
      }
    }
    try {
      const created = await createEntity(env, entity, payload);
      return json(created, { status: 201, env });
    } catch (err) {
      return errorResponse('storage_unavailable', 503, err.message, env, request);
    }
  }

  return errorResponse('method_not_allowed', 405, 'Method not allowed', env, request);
}
