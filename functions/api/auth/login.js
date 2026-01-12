import { errorResponse, handleOptions, withHeaders } from '../_utils.js';
import { buildRateLimitKey, checkRateLimit } from '../_rateLimit.js';

export async function onRequest({ request, env }) {
  const options = handleOptions(request, env);
  if (options) return options;

  const authLimit = Number(env?.RATE_LIMIT_AUTH || 30);
  const authWindow = Number(env?.RATE_LIMIT_AUTH_WINDOW_SECONDS || 60);
  const authKey = buildRateLimitKey({ prefix: 'auth_login', request });
  const authCheck = await checkRateLimit(env, { key: authKey, limit: authLimit, windowSeconds: authWindow });
  if (!authCheck.allowed) {
    return errorResponse('rate_limited', 429, 'Too many login attempts', env);
  }

  const url = new URL(request.url);
  const next = url.searchParams.get('next') || '/';
  const provider = (url.searchParams.get('provider') || '').toLowerCase();
  const audience = url.searchParams.get('audience') || '';
  const schoolSlug = url.searchParams.get('schoolSlug') || url.searchParams.get('school_slug') || '';
  const schoolId = url.searchParams.get('schoolId') || url.searchParams.get('school_id') || '';

  if (provider) {
    const target = new URL('/api/auth/oidc/start', url.origin);
    target.searchParams.set('provider', provider);
    if (next) target.searchParams.set('next', next);
    if (audience) target.searchParams.set('audience', audience);
    if (schoolSlug) target.searchParams.set('schoolSlug', schoolSlug);
    if (schoolId) target.searchParams.set('schoolId', schoolId);
    return Response.redirect(target.toString(), 302);
  }

  if (env?.AUTH_LOGIN_URL) {
    const target = new URL(env.AUTH_LOGIN_URL, url.origin);
    target.searchParams.set('next', next);
    return Response.redirect(target.toString(), 302);
  }

  const token = env?.DEV_TOKEN || 'dev';
  const nextUrl = new URL(next, url.origin);
  nextUrl.searchParams.set('token', token);

  return new Response(null, {
    status: 302,
    headers: {
      ...withHeaders(null, env),
      Location: nextUrl.toString(),
    },
  });
}
