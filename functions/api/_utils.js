const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

function fallbackCorrelationId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getCorrelationId(request) {
  if (request?.headers) {
    const header = request.headers.get('X-Correlation-Id')
      || request.headers.get('X-Request-Id')
      || request.headers.get('CF-Ray');
    if (header) return header;
  }
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return fallbackCorrelationId();
}

export function getCorsHeaders(env) {
  const origin = env?.CORS_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function withHeaders(headers, env) {
  return {
    ...DEFAULT_HEADERS,
    ...getCorsHeaders(env),
    ...(headers || {}),
  };
}

export function json(data, options = {}) {
  const { status = 200, env, headers } = options;
  return new Response(JSON.stringify(data ?? null), {
    status,
    headers: withHeaders(headers, env),
  });
}

export function errorResponse(reason, status = 400, message, env, request) {
  const correlationId = getCorrelationId(request);
  if (status >= 500) {
    console.error(`[${correlationId}] ${message || reason || 'Request failed'}`);
  }
  return json({
    reason,
    message: message || reason || 'Request failed',
    correlation_id: correlationId,
  }, {
    status,
    env,
    headers: { 'X-Correlation-Id': correlationId },
  });
}

export async function readJson(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function getBearerToken(request) {
  const header = request.headers.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function parseQueryJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function normalizeLimit(value, fallback = 50, max = 200) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

export function handleOptions(request, env) {
  if (request.method !== 'OPTIONS') return null;
  return new Response(null, {
    status: 204,
    headers: withHeaders(null, env),
  });
}
