import { errorResponse, handleOptions, withHeaders } from '../../_utils.js';
import { buildRateLimitKey, checkRateLimit } from '../../_rateLimit.js';
import { createEntity, listEntities } from '../../_store.js';
import { getProviderConfig } from './_providers.js';
import { getSchoolAuthPolicy, policyAllowsProvider, resolveSchool } from './_policy.js';

const STATE_TTL_MINUTES = 10;

function nowIso() {
  return new Date().toISOString();
}

function toBase64Url(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getSubtleCrypto() {
  if (crypto?.subtle) return crypto.subtle;
  if (crypto?.webcrypto?.subtle) return crypto.webcrypto.subtle;
  return null;
}

async function createPkcePair() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const verifier = toBase64Url(bytes);
  const subtle = getSubtleCrypto();
  if (!subtle) {
    return { codeVerifier: verifier, codeChallenge: verifier };
  }
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = toBase64Url(new Uint8Array(digest));
  return { codeVerifier: verifier, codeChallenge: challenge };
}

function createNonce() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

function normalizeNext(next, origin) {
  if (!next) return new URL('/', origin).toString();
  try {
    const url = new URL(next, origin);
    if (url.origin !== origin) return new URL('/', origin).toString();
    return url.toString();
  } catch {
    return new URL('/', origin).toString();
  }
}

function redirectWithError(code, message, nextUrl, origin, env) {
  const target = new URL(nextUrl || '/', origin);
  target.searchParams.set('authError', code);
  if (message) {
    target.searchParams.set('authErrorMessage', message);
  }
  return new Response(null, {
    status: 302,
    headers: {
      ...withHeaders(null, env),
      Location: target.toString(),
    },
  });
}

async function getVerifiedDomains(env, schoolId) {
  if (!schoolId) return [];
  const rows = await listEntities(env, 'DomainVerification', {
    filters: { school_id: String(schoolId), status: 'verified' },
    limit: 200,
  });
  return (rows || []).map((row) => row.domain).filter(Boolean);
}

export async function onRequest({ request, env }) {
  const options = handleOptions(request, env);
  if (options) return options;

  const authLimit = Number(env?.RATE_LIMIT_AUTH || 30);
  const authWindow = Number(env?.RATE_LIMIT_AUTH_WINDOW_SECONDS || 60);
  const authKey = buildRateLimitKey({ prefix: 'oidc_start', request });
  const authCheck = await checkRateLimit(env, { key: authKey, limit: authLimit, windowSeconds: authWindow });
  if (!authCheck.allowed) {
    return errorResponse('rate_limited', 429, 'Too many login attempts', env);
  }

  if (request.method !== 'GET') {
    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
  }

  const url = new URL(request.url);
  const provider = (url.searchParams.get('provider') || '').toLowerCase();
  const audience = url.searchParams.get('audience') || '';
  const next = url.searchParams.get('next') || '/';
  const schoolSlug = url.searchParams.get('schoolSlug') || url.searchParams.get('school_slug') || '';
  const schoolId = url.searchParams.get('schoolId') || url.searchParams.get('school_id') || '';

  const nextUrl = normalizeNext(next, url.origin);

  if (!provider) {
    return redirectWithError('missing_provider', 'Missing identity provider', nextUrl, url.origin, env);
  }

  const config = getProviderConfig(provider, env, url.origin);
  if (!config) {
    return redirectWithError('provider_not_configured', 'Provider not configured', nextUrl, url.origin, env);
  }

  const school = await resolveSchool(env, schoolId, schoolSlug);
  const policy = await getSchoolAuthPolicy(env, school?.id);
  const allowAll = String(env?.OIDC_ALLOW_ALL || '').toLowerCase() === 'true';

  if (!policyAllowsProvider(policy, provider, allowAll)) {
    return redirectWithError('sso_disabled', 'SSO not enabled for this school', nextUrl, url.origin, env);
  }
  if (policy?.require_domain_verification) {
    const verified = await getVerifiedDomains(env, school?.id);
    if (!verified.length) {
      return redirectWithError('domain_unverified', 'School domain has not been verified', nextUrl, url.origin, env);
    }
  }

  const { codeVerifier, codeChallenge } = await createPkcePair();
  const nonce = createNonce();
  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + STATE_TTL_MINUTES * 60 * 1000).toISOString();

  await createEntity(env, 'AuthState', {
    id: state,
    provider,
    school_id: school?.id || null,
    school_slug: school?.slug || null,
    intended_audience: audience || null,
    next_url: nextUrl,
    code_verifier: codeVerifier,
    nonce,
    issued_at: nowIso(),
    expires_at: expiresAt,
  });

  const authorize = new URL(config.authorizeUrl);
  authorize.searchParams.set('client_id', config.clientId);
  authorize.searchParams.set('redirect_uri', config.redirectUri);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('scope', config.scopes);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('code_challenge', codeChallenge);
  authorize.searchParams.set('code_challenge_method', 'S256');
  authorize.searchParams.set('nonce', nonce);
  if (config.prompt) {
    authorize.searchParams.set('prompt', config.prompt);
  }

  return new Response(null, {
    status: 302,
    headers: {
      ...withHeaders(null, env),
      Location: authorize.toString(),
    },
  });
}
