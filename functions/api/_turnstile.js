const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function isTurnstileEnabled(env) {
  if (String(env?.TURNSTILE_DISABLED || '').toLowerCase() === 'true') return false;
  return Boolean(env?.TURNSTILE_SECRET_KEY);
}

function getRemoteIp(request) {
  if (!request?.headers) return '';
  const header = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
  if (!header) return '';
  return header.split(',')[0].trim();
}

export function getTurnstileTokenFromUrl(url) {
  if (!url) return '';
  return url.searchParams.get('turnstileToken')
    || url.searchParams.get('turnstile_token')
    || '';
}

export async function verifyTurnstileToken({ env, request, token }) {
  if (!isTurnstileEnabled(env)) {
    return { allowed: true, skipped: true };
  }
  if (!token) {
    return { allowed: false, reason: 'missing_turnstile_token' };
  }

  const body = new URLSearchParams();
  body.set('secret', env.TURNSTILE_SECRET_KEY);
  body.set('response', token);
  const remoteIp = getRemoteIp(request);
  if (remoteIp) body.set('remoteip', remoteIp);

  let response = null;
  try {
    response = await fetch(VERIFY_URL, { method: 'POST', body });
  } catch (error) {
    return { allowed: false, reason: 'turnstile_unavailable', error };
  }

  if (!response.ok) {
    return { allowed: false, reason: 'turnstile_unavailable' };
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    return { allowed: false, reason: 'turnstile_unavailable' };
  }

  if (data?.success) {
    return { allowed: true };
  }

  const errorCodes = Array.isArray(data?.['error-codes']) ? data['error-codes'] : [];
  return { allowed: false, reason: errorCodes[0] || 'turnstile_failed', errorCodes };
}
