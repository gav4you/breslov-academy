import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
import { createEntity, listEntities, updateEntity } from '../_store.js';
import { getUserFromToken } from '../_auth.js';
import { hasMembership, isGlobalAdmin } from '../_tenancy.js';

function nowIso() {
  return new Date().toISOString();
}

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
  const apiKey = payload.api_key || payload.apiKey || null;
  const connectMode = payload.connect_mode || payload.connectMode || (apiKey ? 'api_key' : 'manual');

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
  const connectionPayload = {
    id,
    school_id: String(schoolId),
    provider: String(provider),
    status: 'connected',
    connected_at: nowIso(),
    updated_at: nowIso(),
    connect_mode: connectMode,
  };

  const connections = await listEntities(env, 'IntegrationConnection', {
    filters: { id },
    limit: 1,
  });
  if (connections?.[0]) {
    await updateEntity(env, 'IntegrationConnection', connections[0].id, connectionPayload);
  } else {
    await createEntity(env, 'IntegrationConnection', connectionPayload);
  }

  if (apiKey) {
    const secrets = await listEntities(env, 'IntegrationSecret', {
      filters: { id },
      limit: 1,
    });
    const secretPayload = {
      id,
      school_id: String(schoolId),
      provider: String(provider),
      token_type: 'api_key',
      access_token: String(apiKey),
      updated_at: nowIso(),
    };
    if (secrets?.[0]) {
      await updateEntity(env, 'IntegrationSecret', secrets[0].id, secretPayload);
    } else {
      await createEntity(env, 'IntegrationSecret', secretPayload);
    }
  }

  await createEntity(env, 'AuditLog', {
    school_id: String(schoolId),
    user_email: user.email,
    action: 'INTEGRATION_CONNECTED',
    entity_type: 'IntegrationConnection',
    entity_id: id,
    metadata: { provider: String(provider), connect_mode: connectMode },
  });

  return json({ connected: true, provider, school_id: String(schoolId) }, { env });
}
