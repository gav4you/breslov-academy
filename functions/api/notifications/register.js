import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
import { createEntity, listEntities, updateEntity } from '../_store.js';
import { getUserFromToken } from '../_auth.js';
import { hasMembership, isGlobalAdmin } from '../_tenancy.js';

function nowIso() {
  return new Date().toISOString();
}

function normalizeToken(token) {
  return String(token || '').trim();
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
  const pushToken = normalizeToken(payload.token);
  const platform = payload.platform || payload.device_platform || null;
  const deviceId = payload.device_id || payload.deviceId || null;

  if (!schoolId || !pushToken) {
    return errorResponse('missing_params', 400, 'school_id and token are required', env);
  }

  const globalAdmin = isGlobalAdmin(user, env);
  if (!globalAdmin) {
    const isMember = await hasMembership(env, schoolId, user.email);
    if (!isMember) {
      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    }
  }

  const existing = await listEntities(env, 'NotificationToken', {
    filters: { school_id: String(schoolId), token: pushToken },
    limit: 1,
  });
  const record = existing?.[0];

  if (record?.id) {
    const updated = await updateEntity(env, 'NotificationToken', record.id, {
      user_email: user.email,
      platform: platform || record.platform || null,
      device_id: deviceId || record.device_id || null,
      last_seen_at: nowIso(),
      revoked_at: null,
    });
    return json({ id: updated?.id || record.id, status: 'updated' }, { env });
  }

  const created = await createEntity(env, 'NotificationToken', {
    school_id: String(schoolId),
    user_email: user.email,
    token: pushToken,
    platform: platform || null,
    device_id: deviceId || null,
    last_seen_at: nowIso(),
    created_date: nowIso(),
  });

  return json({ id: created?.id, status: 'created' }, { env });
}
