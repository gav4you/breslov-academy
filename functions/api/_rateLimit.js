import { createEntity, listEntities, updateEntity } from './_store.js';

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_LIMIT = 30;

function nowIso() {
  return new Date().toISOString();
}

function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')
    || request.headers.get('X-Real-IP')
    || 'unknown';
}

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, '');
}

export function buildRateLimitKey({ prefix, request, userEmail, schoolId }) {
  const ip = getClientIp(request);
  const parts = [
    normalizeKey(prefix),
    normalizeKey(schoolId),
    normalizeKey(userEmail),
    normalizeKey(ip),
  ].filter(Boolean);
  return parts.join(':') || 'global';
}

export async function checkRateLimit(env, { key, limit, windowSeconds }) {
  const disabled = String(env?.RATE_LIMIT_DISABLED || '').toLowerCase() === 'true';
  if (disabled) {
    return { allowed: true, remaining: Number(limit) || DEFAULT_LIMIT, reset_at: null };
  }

  const windowSec = Number(windowSeconds) || DEFAULT_WINDOW_SECONDS;
  const max = Number(limit) || DEFAULT_LIMIT;
  const windowId = Math.floor(Date.now() / (windowSec * 1000));
  const id = `${key}:${windowId}`;
  const windowStart = new Date(windowId * windowSec * 1000);
  const windowEnd = new Date((windowId + 1) * windowSec * 1000);

  const existing = await listEntities(env, 'RateLimitLog', {
    filters: { id },
    limit: 1,
  });
  const record = existing?.[0] || null;
  const nextCount = (record?.count || 0) + 1;
  const allowed = nextCount <= max;

  const payload = {
    id,
    key,
    count: nextCount,
    limit: max,
    window_start: windowStart.toISOString(),
    window_end: windowEnd.toISOString(),
    last_seen_at: nowIso(),
    blocked_at: allowed ? record?.blocked_at || null : nowIso(),
  };

  if (record?.id) {
    await updateEntity(env, 'RateLimitLog', record.id, payload);
  } else {
    await createEntity(env, 'RateLimitLog', payload);
  }

  return {
    allowed,
    remaining: Math.max(0, max - nextCount),
    reset_at: windowEnd.toISOString(),
  };
}
