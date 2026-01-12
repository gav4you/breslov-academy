import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
import { createEntity, deleteEntity, listEntities, updateEntity } from '../_store.js';
import { getUserFromToken } from '../_auth.js';
import { hasMembership, isGlobalAdmin } from '../_tenancy.js';

async function getMembershipRole(env, schoolId, email) {
  if (!schoolId || !email) return null;
  const rows = await listEntities(env, 'SchoolMembership', {
    filters: { school_id: String(schoolId), user_email: String(email) },
    limit: 1,
  });
  return rows?.[0]?.role || null;
}

function isAdminRole(role) {
  const normalized = String(role || '').toUpperCase();
  return ['OWNER', 'ADMIN', 'SUPERADMIN'].includes(normalized);
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
  const provider = payload.provider || payload.integration;
  if (!schoolId || !provider) {
    return errorResponse('missing_params', 400, 'school_id and provider are required', env);
  }

  const globalAdmin = isGlobalAdmin(user, env);
  if (!globalAdmin) {
    const member = await hasMembership(env, schoolId, user.email);
    if (!member) {
      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    }
    const role = await getMembershipRole(env, schoolId, user.email);
    if (!isAdminRole(role)) {
      return errorResponse('forbidden', 403, 'Admin role required', env);
    }
  }

  const id = `${schoolId}:${provider}`;
  const connections = await listEntities(env, 'IntegrationConnection', {
    filters: { id },
    limit: 1,
  });
  if (connections?.[0]) {
    await updateEntity(env, 'IntegrationConnection', connections[0].id, {
      status: 'disconnected',
      disconnected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const secrets = await listEntities(env, 'IntegrationSecret', {
    filters: { id },
    limit: 1,
  });
  if (secrets?.[0]) {
    await deleteEntity(env, 'IntegrationSecret', secrets[0].id);
  }

  await createEntity(env, 'AuditLog', {
    school_id: String(schoolId),
    user_email: user.email,
    action: 'INTEGRATION_DISCONNECTED',
    entity_type: 'IntegrationConnection',
    entity_id: id,
    metadata: { provider: String(provider) },
  });

  return json({ disconnected: true }, { env });
}
