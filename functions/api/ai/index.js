import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
import { createEntity, listEntities, updateEntity } from '../_store.js';
import { getUserFromToken } from '../_auth.js';
import { hasMembership, isGlobalAdmin } from '../_tenancy.js';

const STAFF_ROLES = new Set(['OWNER', 'ADMIN', 'INSTRUCTOR', 'TEACHER', 'TA', 'RAV', 'RABBI', 'SUPERADMIN']);

function nowIso() {
  return new Date().toISOString();
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 200);
}

function buildLessonText(lesson) {
  const parts = [
    lesson?.title,
    lesson?.title_hebrew,
    lesson?.content,
    lesson?.content_text,
    lesson?.text,
    lesson?.body,
  ];
  if (lesson?.content_json) {
    try {
      parts.push(typeof lesson.content_json === 'string' ? lesson.content_json : JSON.stringify(lesson.content_json));
    } catch {
      // ignore content_json errors
    }
  }
  return parts.filter(Boolean).join(' ');
}

async function getMembershipRole(env, schoolId, email) {
  if (!schoolId || !email) return null;
  const rows = await listEntities(env, 'SchoolMembership', {
    filters: { school_id: String(schoolId), user_email: String(email) },
    limit: 1,
  });
  return rows?.[0]?.role || null;
}

export async function onRequest({ request, env }) {
  const options = handleOptions(request, env);
  if (options) return options;

  if (request.method !== 'POST') {
    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
  }

  const token = getBearerToken(request);
  const user = await getUserFromToken(token, env);
  if (!user?.email) {
    return errorResponse('auth_required', 401, 'Authentication required', env);
  }

  const payload = await readJson(request);
  if (!payload) {
    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
  }

  const schoolId = payload.school_id || payload.schoolId;
  const courseId = payload.course_id || payload.courseId || null;
  const lessonId = payload.lesson_id || payload.lessonId || null;

  if (!schoolId) {
    return errorResponse('missing_school', 400, 'school_id is required', env);
  }

  const globalAdmin = isGlobalAdmin(user, env);
  if (!globalAdmin) {
    const isMember = await hasMembership(env, schoolId, user.email);
    if (!isMember) {
      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    }
    const role = await getMembershipRole(env, schoolId, user.email);
    if (!STAFF_ROLES.has(String(role || '').toUpperCase())) {
      return errorResponse('forbidden', 403, 'Staff role required', env);
    }
  }

  const filters = { school_id: String(schoolId) };
  if (lessonId) {
    filters.id = String(lessonId);
  } else if (courseId) {
    filters.course_id = String(courseId);
  }

  const lessons = await listEntities(env, 'Lesson', {
    filters,
    limit: lessonId ? 1 : 500,
  });

  const indexed = [];
  for (const lesson of lessons) {
    const text = buildLessonText(lesson);
    const tokens = tokenize(text);
    const recordId = `rag:${schoolId}:${lesson.id}`;
    const sourceUpdatedAt = lesson.updated_date || lesson.updated_at || lesson.created_date || null;

    const existing = await listEntities(env, 'AiRagIndex', {
      filters: { id: recordId, school_id: String(schoolId) },
      limit: 1,
    });

    if (existing?.[0]?.source_updated_at && existing[0].source_updated_at === sourceUpdatedAt) {
      indexed.push({ lesson_id: lesson.id, status: 'skipped' });
      continue;
    }

    const payloadRecord = {
      id: recordId,
      school_id: String(schoolId),
      lesson_id: lesson.id,
      course_id: lesson.course_id || null,
      token_count: tokens.length,
      tokens,
      source_updated_at: sourceUpdatedAt,
      updated_date: nowIso(),
    };

    if (existing?.[0]?.id) {
      await updateEntity(env, 'AiRagIndex', existing[0].id, payloadRecord);
      indexed.push({ lesson_id: lesson.id, status: 'updated' });
    } else {
      await createEntity(env, 'AiRagIndex', payloadRecord);
      indexed.push({ lesson_id: lesson.id, status: 'created' });
    }
  }

  return json({ indexed }, { env });
}
