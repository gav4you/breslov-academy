import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
import { deleteEntity, listEntities } from '../_store.js';
import { getUserFromToken } from '../_auth.js';
import { isGlobalAdmin } from '../_tenancy.js';

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  const parsed = new Date(expiresAt);
  if (Number.isNaN(parsed.valueOf())) return false;
  return parsed <= new Date();
}

function parseLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

function shouldPurgeState(state) {
  if (!state) return false;
  if (state.used_at || state.revoked_at) return true;
  return isExpired(state.expires_at);
}

function shouldPurgeSession(session) {
  if (!session) return false;
  if (session.revoked_at) return true;
  return isExpired(session.expires_at);
}

async function cleanupEntity(env, entity, shouldPurge, limit, dryRun) {
  const rows = await listEntities(env, entity, { limit, sort: 'created_date' });
  const expired = (rows || []).filter((row) => shouldPurge(row));
  let deleted = 0;
  if (!dryRun) {
    for (const row of expired) {
      const ok = await deleteEntity(env, entity, row.id);
      if (ok) deleted += 1;
    }
  }
  return {
    scanned: rows?.length || 0,
    eligible: expired.length,
    deleted: dryRun ? 0 : deleted,
  };
}

export async function onRequest({ request, env }) {
  const options = handleOptions(request, env);
  if (options) return options;

  if (request.method !== 'POST') {
    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
  }

  const token = getBearerToken(request);
  const user = await getUserFromToken(token, env);
  const admin = isGlobalAdmin(user, env);
  const expectedToken = String(env?.AUTH_CLEANUP_TOKEN || '');
  const tokenMatches = expectedToken && token && token === expectedToken;

  if (!admin && !tokenMatches) {
    return errorResponse('forbidden', 403, 'Not authorized', env);
  }

  const payload = await readJson(request);
  const url = new URL(request.url);
  const limit = parseLimit(payload?.limit || url.searchParams.get('limit'));
  const dryRun = payload?.dry_run === true || url.searchParams.get('dry_run') === 'true';

  const authState = await cleanupEntity(env, 'AuthState', shouldPurgeState, limit, dryRun);
  const authSession = await cleanupEntity(env, 'AuthSession', shouldPurgeSession, limit, dryRun);

  return json({
    dry_run: dryRun,
    limit,
    auth_state: authState,
    auth_session: authSession,
  }, { env });
}
