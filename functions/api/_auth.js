import { createEntity, listEntities, updateEntity } from './_store.js';

const DEFAULT_DEV_EMAIL = 'dev@breslov.academy';
const DEFAULT_DEV_ROLE = 'admin';
const DEFAULT_SESSION_TTL_HOURS = 12;

function nowIso() {
  return new Date().toISOString();
}

function parseExpiry(expiresAt) {
  if (!expiresAt) return null;
  const parsed = new Date(expiresAt);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function isExpired(expiresAt) {
  const parsed = parseExpiry(expiresAt);
  return parsed ? parsed <= new Date() : false;
}

function normalizeDevUser(token, env) {
  const devToken = env?.DEV_TOKEN;
  if (!devToken) return null;
  const devEmail = env?.DEV_EMAIL || DEFAULT_DEV_EMAIL;
  const devRole = env?.DEV_ROLE || DEFAULT_DEV_ROLE;

  if (token === devToken) {
    return { id: 'dev-user', email: devEmail, role: devRole };
  }

  return null;
}

export async function getUserFromToken(token, env) {
  if (!token) return null;

  const devUser = normalizeDevUser(token, env);
  if (devUser) return devUser;

  const sessions = await listEntities(env, 'AuthSession', {
    filters: { id: String(token) },
    limit: 1,
  });
  const session = sessions?.[0];
  if (!session) return null;
  if (session.revoked_at || isExpired(session.expires_at)) return null;

  return {
    id: session.user_id || session.user_email || session.id,
    email: session.user_email,
    role: session.role || DEFAULT_DEV_ROLE,
    name: session.user_name || session.name || null,
    provider: session.provider || null,
    session_id: session.id,
    school_id: session.school_id || null,
  };
}

export async function createSession(env, payload = {}) {
  const ttlHoursRaw = Number(env?.AUTH_SESSION_TTL_HOURS);
  const ttlHours = Number.isFinite(ttlHoursRaw) && ttlHoursRaw > 0 ? ttlHoursRaw : DEFAULT_SESSION_TTL_HOURS;
  const issuedAt = nowIso();
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  const token = crypto.randomUUID();

  const record = {
    id: token,
    token,
    issued_at: issuedAt,
    expires_at: expiresAt,
    user_email: payload.user_email || payload.user?.email || null,
    user_id: payload.user_id || payload.user?.id || null,
    user_name: payload.user_name || payload.user?.name || null,
    role: payload.role || payload.user?.role || null,
    provider: payload.provider || null,
    school_id: payload.school_id || null,
    metadata: payload.metadata || null,
  };

  await createEntity(env, 'AuthSession', record);
  return record;
}

export async function revokeSession(env, token, metadata = null) {
  if (!token) return false;
  const sessions = await listEntities(env, 'AuthSession', {
    filters: { id: String(token) },
    limit: 1,
  });
  const session = sessions?.[0];
  if (!session) return false;
  const revoked = await updateEntity(env, 'AuthSession', session.id, {
    revoked_at: nowIso(),
    metadata: metadata || session.metadata || null,
  });
  return Boolean(revoked);
}
