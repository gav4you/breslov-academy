
• Ran Get-Content -Raw src\portals\LegacyToAppRedirect.jsx
  └ import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    … +29 lines
    }


• Ran Get-Content -Raw src\portals\app\AppPortal.jsx
    … +144 lines
    }


• Ran Get-Content -Raw src\portals\app\OnboardingHub.jsx
  └ import React, { useMemo, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    … +96 lines
    }


• I’m working through how the OnboardingHub handles membership and login, leaning toward allowing login without
  membership while restricting school-specific data access. I’m planning out implementation for session management in
  _auth.js including token creation, expiration checks, and revocation. Then I’m sketching the OIDC start and callback
  handlers to manage auth state, provider configs, token exchange, user info retrieval, membership provisioning, and
  session creation with proper security checks like domain policies. I’m also thinking carefully about protecting
  sensitive entities like AuthSession and IdentityLink from open public API access by adding auth gating to the Entities
  API without breaking public read access to safe entities. This is a critical step since the existing Entities API is
  open and could expose session tokens. I’m aiming to implement minimal gating that allows public reads for certain
  entities while requiring auth for sensitive or write operations. This whole plan balances enabling SSO with
  maintaining strong security across the system.

• Ran Get-Content -Raw src\pages\SchoolNew.jsx
  └ import React, { useState } from 'react';
    import { base44 } from '@/api/base44Client';
    … +193 lines
    }


• I'm outlining how to gate sensitive entities like AuthSession and AuthState in the Entities API by requiring
  authentication on those specific entities while allowing public GET access to others; this means updating functions/
  api/entities/[entity].js to check for sensitive entities and authenticate via tokens before proceeding. The approach
  includes implementing async authentication calls carefully to avoid import cycles and updating various files
  sequentially with patches, starting with _auth.js.

• Edited functions/api/_auth.js (+85 -12)
      1 +import { createEntity, listEntities, updateEntity } from './_store.js';
      2 +
      3  const DEFAULT_DEV_EMAIL = 'dev@breslov.academy';
      4  const DEFAULT_DEV_ROLE = 'admin';
      5 +const DEFAULT_SESSION_TTL_HOURS = 12;
      6
      4 -export function getUserFromToken(token, env) {
      5 -  if (!token) return null;
      7 +function nowIso() {
      8 +  return new Date().toISOString();
      9 +}
     10
     11 +function parseExpiry(expiresAt) {
     12 +  if (!expiresAt) return null;
     13 +  const parsed = new Date(expiresAt);
     14 +  return Number.isNaN(parsed.valueOf()) ? null : parsed;
     15 +}
     16 +
     17 +function isExpired(expiresAt) {
     18 +  const parsed = parseExpiry(expiresAt);
     19 +  return parsed ? parsed <= new Date() : false;
     20 +}
     21 +
     22 +function normalizeDevUser(token, env) {
     23    const devToken = env?.DEV_TOKEN || 'dev';
        ⋮
     27    if (token === devToken) {
     12 -    return {
     13 -      id: 'dev-user',
     14 -      email: devEmail,
     15 -      role: devRole,
     16 -    };
     28 +    return { id: 'dev-user', email: devEmail, role: devRole };
     29    }
        ⋮
     34      const role = parts[2] || devRole;
     23 -    return {
     24 -      id: 'dev-user',
     25 -      email,
     26 -      role,
     27 -    };
     35 +    return { id: 'dev-user', email, role };
     36    }
        ⋮
     39  }
     40 +
     41 +export async function getUserFromToken(token, env) {
     42 +  if (!token) return null;
     43 +
     44 +  const devUser = normalizeDevUser(token, env);
     45 +  if (devUser) return devUser;
     46 +
     47 +  const sessions = await listEntities(env, 'AuthSession', {
     48 +    filters: { id: String(token) },
     49 +    limit: 1,
     50 +  });
     51 +  const session = sessions?.[0];
     52 +  if (!session) return null;
     53 +  if (session.revoked_at || isExpired(session.expires_at)) return null;
     54 +
     55 +  return {
     56 +    id: session.user_id || session.user_email || session.id,
     57 +    email: session.user_email,
     58 +    role: session.role || DEFAULT_DEV_ROLE,
     59 +    name: session.user_name || session.name || null,
     60 +    provider: session.provider || null,
     61 +    session_id: session.id,
     62 +    school_id: session.school_id || null,
     63 +  };
     64 +}
     65 +
     66 +export async function createSession(env, payload = {}) {
     67 +  const ttlHoursRaw = Number(env?.AUTH_SESSION_TTL_HOURS);
     68 +  const ttlHours = Number.isFinite(ttlHoursRaw) && ttlHoursRaw > 0 ? ttlHoursRaw : DEFAULT_SESSION_TTL_HOURS;
     69 +  const issuedAt = nowIso();
     70 +  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
     71 +  const token = crypto.randomUUID();
     72 +
     73 +  const record = {
     74 +    id: token,
     75 +    token,
     76 +    issued_at: issuedAt,
     77 +    expires_at: expiresAt,
     78 +    user_email: payload.user_email || payload.user?.email || null,
     79 +    user_id: payload.user_id || payload.user?.id || null,
     80 +    user_name: payload.user_name || payload.user?.name || null,
     81 +    role: payload.role || payload.user?.role || null,
     82 +    provider: payload.provider || null,
     83 +    school_id: payload.school_id || null,
     84 +    metadata: payload.metadata || null,
     85 +  };
     86 +
     87 +  await createEntity(env, 'AuthSession', record);
     88 +  return record;
     89 +}
     90 +
     91 +export async function revokeSession(env, token, metadata = null) {
     92 +  if (!token) return false;
     93 +  const sessions = await listEntities(env, 'AuthSession', {
     94 +    filters: { id: String(token) },
     95 +    limit: 1,
     96 +  });
     97 +  const session = sessions?.[0];
     98 +  if (!session) return false;
     99 +  const revoked = await updateEntity(env, 'AuthSession', session.id, {
    100 +    revoked_at: nowIso(),
    101 +    metadata: metadata || session.metadata || null,
    102 +  });
    103 +  return Boolean(revoked);
    104 +}

• Edited functions/api/auth/me.js (+1 -1)
    12
    13 -  const user = getUserFromToken(token, env);
    13 +  const user = await getUserFromToken(token, env);
    14    if (!user) {

• Edited functions/api/downloads/secure.js (+1 -1)
    38    const token = getBearerToken(request);
    39 -  const user = getUserFromToken(token, env);
    39 +  const user = await getUserFromToken(token, env);
    40    if (!user?.email) {

• Edited functions/api/auth/login.js (+14 -0)
     8    const next = url.searchParams.get('next') || '/';
     9 +  const provider = (url.searchParams.get('provider') || '').toLowerCase();
    10 +  const audience = url.searchParams.get('audience') || '';
    11 +  const schoolSlug = url.searchParams.get('schoolSlug') || url.searchParams.get('school_slug') || '';
    12 +  const schoolId = url.searchParams.get('schoolId') || url.searchParams.get('school_id') || '';
    13 +
    14 +  if (provider) {
    15 +    const target = new URL('/api/auth/oidc/start', url.origin);
    16 +    target.searchParams.set('provider', provider);
    17 +    if (next) target.searchParams.set('next', next);
    18 +    if (audience) target.searchParams.set('audience', audience);
    19 +    if (schoolSlug) target.searchParams.set('schoolSlug', schoolSlug);
    20 +    if (schoolId) target.searchParams.set('schoolId', schoolId);
    21 +    return Response.redirect(target.toString(), 302);
    22 +  }
    23

• Edited functions/api/auth/logout.js (+7 -1)
     1 -import { handleOptions, withHeaders } from '../_utils.js';
     1 +import { getBearerToken, handleOptions, withHeaders } from '../_utils.js';
     2 +import { revokeSession } from '../_auth.js';
     3
       ⋮
    10
    11 +  const token = getBearerToken(request);
    12 +  if (token) {
    13 +    await revokeSession(env, token);
    14 +  }
    15 +
    16    if (env?.AUTH_LOGOUT_URL) {

• I'm laying out new _providers.js and _policy.js files to centralize provider configs, environment-based setup, and
  school auth policies. I’m also planning start.js and callback.js to handle OIDC flows, PKCE helpers, and user/session
  management for a clean, secure SSO integration.

• Added functions/api/auth/oidc/_providers.js (+69 -0)
     1 +const DEFAULT_GOOGLE_SCOPES = 'openid email profile';
     2 +const DEFAULT_MICROSOFT_SCOPES = 'openid email profile';
     3 +
     4 +function normalizeBaseUrl(url) {
     5 +  if (!url) return '';
     6 +  return String(url).trim();
     7 +}
     8 +
     9 +function buildRedirectUri(provider, env, origin) {
    10 +  const key = provider === 'google' ? env?.GOOGLE_OIDC_REDIRECT_URI : env?.MICROSOFT_OIDC_REDIRECT_URI;
    11 +  if (key) return normalizeBaseUrl(key);
    12 +  return new URL('/api/auth/oidc/callback', origin).toString();
    13 +}
    14 +
    15 +function getMicrosoftTenant(env) {
    16 +  const raw = env?.MICROSOFT_OIDC_TENANT || 'common';
    17 +  return String(raw || 'common');
    18 +}
    19 +
    20 +export function getProviderConfig(provider, env, origin) {
    21 +  const normalized = String(provider || '').toLowerCase();
    22 +  if (normalized === 'google') {
    23 +    const clientId = env?.GOOGLE_OIDC_CLIENT_ID || '';
    24 +    const clientSecret = env?.GOOGLE_OIDC_CLIENT_SECRET || '';
    25 +    if (!clientId || !clientSecret) return null;
    26 +    return {
    27 +      id: 'google',
    28 +      clientId,
    29 +      clientSecret,
    30 +      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    31 +      tokenUrl: 'https://oauth2.googleapis.com/token',
    32 +      userinfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    33 +      scopes: env?.GOOGLE_OIDC_SCOPES || DEFAULT_GOOGLE_SCOPES,
    34 +      redirectUri: buildRedirectUri('google', env, origin),
    35 +      prompt: env?.GOOGLE_OIDC_PROMPT || 'select_account',
    36 +    };
    37 +  }
    38 +
    39 +  if (normalized === 'microsoft') {
    40 +    const clientId = env?.MICROSOFT_OIDC_CLIENT_ID || '';
    41 +    const clientSecret = env?.MICROSOFT_OIDC_CLIENT_SECRET || '';
    42 +    if (!clientId || !clientSecret) return null;
    43 +    const tenant = getMicrosoftTenant(env);
    44 +    const base = `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0`;
    45 +    return {
    46 +      id: 'microsoft',
    47 +      clientId,
    48 +      clientSecret,
    49 +      authorizeUrl: `${base}/authorize`,
    50 +      tokenUrl: `${base}/token`,
    51 +      userinfoUrl: 'https://graph.microsoft.com/oidc/userinfo',
    52 +      scopes: env?.MICROSOFT_OIDC_SCOPES || DEFAULT_MICROSOFT_SCOPES,
    53 +      redirectUri: buildRedirectUri('microsoft', env, origin),
    54 +      prompt: env?.MICROSOFT_OIDC_PROMPT || 'select_account',
    55 +    };
    56 +  }
    57 +
    58 +  return null;
    59 +}
    60 +
    61 +export function listProviderStates(env, origin) {
    62 +  return ['google', 'microsoft'].map((provider) => {
    63 +    const config = getProviderConfig(provider, env, origin);
    64 +    return {
    65 +      id: provider,
    66 +      configured: Boolean(config),
    67 +    };
    68 +  });
    69 +}

• Added functions/api/auth/oidc/_policy.js (+86 -0)
     1 +import { listEntities } from '../../_store.js';
     2 +
     3 +function normalizeList(value) {
     4 +  if (!value) return [];
     5 +  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
     6 +  if (typeof value === 'string') {
     7 +    return value.split(',').map((item) => item.trim()).filter(Boolean);
     8 +  }
     9 +  return [];
    10 +}
    11 +
    12 +function normalizeDomain(domain) {
    13 +  return String(domain || '')
    14 +    .trim()
    15 +    .toLowerCase()
    16 +    .replace(/^@/, '');
    17 +}
    18 +
    19 +export async function resolveSchool(env, schoolId, schoolSlug) {
    20 +  if (schoolId) {
    21 +    return { id: String(schoolId), slug: schoolSlug ? String(schoolSlug) : null };
    22 +  }
    23 +  if (!schoolSlug) return null;
    24 +  const schools = await listEntities(env, 'School', {
    25 +    filters: { slug: String(schoolSlug) },
    26 +    limit: 200,
    27 +  });
    28 +  const match = schools?.[0];
    29 +  if (!match?.id) return null;
    30 +  return { id: String(match.id), slug: match.slug || String(schoolSlug) };
    31 +}
    32 +
    33 +export async function getSchoolAuthPolicy(env, schoolId) {
    34 +  if (!schoolId) return null;
    35 +  const policies = await listEntities(env, 'SchoolAuthPolicy', {
    36 +    filters: { school_id: String(schoolId) },
    37 +    limit: 1,
    38 +  });
    39 +  return policies?.[0] || null;
    40 +}
    41 +
    42 +export function policyAllowsProvider(policy, provider, allowAll = false) {
    43 +  if (allowAll) return true;
    44 +  if (!policy) return false;
    45 +  if (policy.sso_enabled === false) return false;
    46 +  if (policy.allow_all_providers === true) return true;
    47 +  const allowed = normalizeList(policy.allowed_providers);
    48 +  if (allowed.length === 0) return false;
    49 +  return allowed.includes(String(provider || '').toLowerCase());
    50 +}
    51 +
    52 +export function isDomainAllowed(policy, email) {
    53 +  if (!policy) return false;
    54 +  if (!email) return false;
    55 +  const domain = normalizeDomain(email.split('@')[1] || '');
    56 +  if (!domain) return false;
    57 +
    58 +  const allowedDomains = normalizeList(policy.allowed_domains).map(normalizeDomain);
    59 +  if (allowedDomains.length > 0) {
    60 +    return allowedDomains.includes(domain);
    61 +  }
    62 +
    63 +  if (policy.require_domain_match === true) {
    64 +    return false;
    65 +  }
    66 +
    67 +  if (policy.allow_personal_emails === false) {
    68 +    return false;
    69 +  }
    70 +
    71 +  return true;
    72 +}
    73 +
    74 +export function sanitizePolicyForPublic(policy) {
    75 +  if (!policy) return null;
    76 +  return {
    77 +    id: policy.id,
    78 +    school_id: policy.school_id,
    79 +    sso_enabled: policy.sso_enabled !== false,
    80 +    allowed_providers: normalizeList(policy.allowed_providers),
    81 +    require_domain_match: policy.require_domain_match === true,
    82 +    allow_personal_emails: policy.allow_personal_emails !== false,
    83 +    auto_provision: policy.auto_provision === true,
    84 +    auto_provision_role: policy.auto_provision_role || policy.default_role || 'STUDENT',
    85 +  };
    86 +}

• Added functions/api/auth/oidc/start.js (+137 -0)
      1 +import { errorResponse, handleOptions, withHeaders } from '../../_utils.js';
      2 +import { createEntity } from '../../_store.js';
      3 +import { getProviderConfig } from './_providers.js';
      4 +import { getSchoolAuthPolicy, policyAllowsProvider, resolveSchool } from './_policy.js';
      5 +
      6 +const STATE_TTL_MINUTES = 10;
      7 +
      8 +function nowIso() {
      9 +  return new Date().toISOString();
     10 +}
     11 +
     12 +function toBase64Url(bytes) {
     13 +  if (typeof Buffer !== 'undefined') {
     14 +    return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
     15 +  }
     16 +  let binary = '';
     17 +  bytes.forEach((b) => {
     18 +    binary += String.fromCharCode(b);
     19 +  });
     20 +  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
     21 +}
     22 +
     23 +function getSubtleCrypto() {
     24 +  if (crypto?.subtle) return crypto.subtle;
     25 +  if (crypto?.webcrypto?.subtle) return crypto.webcrypto.subtle;
     26 +  return null;
     27 +}
     28 +
     29 +async function createPkcePair() {
     30 +  const bytes = new Uint8Array(32);
     31 +  crypto.getRandomValues(bytes);
     32 +  const verifier = toBase64Url(bytes);
     33 +  const subtle = getSubtleCrypto();
     34 +  if (!subtle) {
     35 +    return { codeVerifier: verifier, codeChallenge: verifier };
     36 +  }
     37 +  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(verifier));
     38 +  const challenge = toBase64Url(new Uint8Array(digest));
     39 +  return { codeVerifier: verifier, codeChallenge: challenge };
     40 +}
     41 +
     42 +function normalizeNext(next, origin) {
     43 +  if (!next) return new URL('/', origin).toString();
     44 +  try {
     45 +    const url = new URL(next, origin);
     46 +    if (url.origin !== origin) return new URL('/', origin).toString();
     47 +    return url.toString();
     48 +  } catch {
     49 +    return new URL('/', origin).toString();
     50 +  }
     51 +}
     52 +
     53 +function redirectWithError(code, message, nextUrl, origin, env) {
     54 +  const target = new URL(nextUrl || '/', origin);
     55 +  target.searchParams.set('authError', code);
     56 +  if (message) {
     57 +    target.searchParams.set('authErrorMessage', message);
     58 +  }
     59 +  return new Response(null, {
     60 +    status: 302,
     61 +    headers: {
     62 +      ...withHeaders(null, env),
     63 +      Location: target.toString(),
     64 +    },
     65 +  });
     66 +}
     67 +
     68 +export async function onRequest({ request, env }) {
     69 +  const options = handleOptions(request, env);
     70 +  if (options) return options;
     71 +
     72 +  if (request.method !== 'GET') {
     73 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
     74 +  }
     75 +
     76 +  const url = new URL(request.url);
     77 +  const provider = (url.searchParams.get('provider') || '').toLowerCase();
     78 +  const audience = url.searchParams.get('audience') || '';
     79 +  const next = url.searchParams.get('next') || '/';
     80 +  const schoolSlug = url.searchParams.get('schoolSlug') || url.searchParams.get('school_slug') || '';
     81 +  const schoolId = url.searchParams.get('schoolId') || url.searchParams.get('school_id') || '';
     82 +
     83 +  const nextUrl = normalizeNext(next, url.origin);
     84 +
     85 +  if (!provider) {
     86 +    return redirectWithError('missing_provider', 'Missing identity provider', nextUrl, url.origin, env);
     87 +  }
     88 +
     89 +  const config = getProviderConfig(provider, env, url.origin);
     90 +  if (!config) {
     91 +    return redirectWithError('provider_not_configured', 'Provider not configured', nextUrl, url.origin, env);
     92 +  }
     93 +
     94 +  const school = await resolveSchool(env, schoolId, schoolSlug);
     95 +  const policy = await getSchoolAuthPolicy(env, school?.id);
     96 +  const allowAll = String(env?.OIDC_ALLOW_ALL || '').toLowerCase() === 'true';
     97 +
     98 +  if (!policyAllowsProvider(policy, provider, allowAll)) {
     99 +    return redirectWithError('sso_disabled', 'SSO not enabled for this school', nextUrl, url.origin, env);
    100 +  }
    101 +
    102 +  const { codeVerifier, codeChallenge } = await createPkcePair();
    103 +  const state = crypto.randomUUID();
    104 +  const expiresAt = new Date(Date.now() + STATE_TTL_MINUTES * 60 * 1000).toISOString();
    105 +
    106 +  await createEntity(env, 'AuthState', {
    107 +    id: state,
    108 +    provider,
    109 +    school_id: school?.id || null,
    110 +    school_slug: school?.slug || null,
    111 +    intended_audience: audience || null,
    112 +    next_url: nextUrl,
    113 +    code_verifier: codeVerifier,
    114 +    issued_at: nowIso(),
    115 +    expires_at: expiresAt,
    116 +  });
    117 +
    118 +  const authorize = new URL(config.authorizeUrl);
    119 +  authorize.searchParams.set('client_id', config.clientId);
    120 +  authorize.searchParams.set('redirect_uri', config.redirectUri);
    121 +  authorize.searchParams.set('response_type', 'code');
    122 +  authorize.searchParams.set('scope', config.scopes);
    123 +  authorize.searchParams.set('state', state);
    124 +  authorize.searchParams.set('code_challenge', codeChallenge);
    125 +  authorize.searchParams.set('code_challenge_method', 'S256');
    126 +  if (config.prompt) {
    127 +    authorize.searchParams.set('prompt', config.prompt);
    128 +  }
    129 +
    130 +  return new Response(null, {
    131 +    status: 302,
    132 +    headers: {
    133 +      ...withHeaders(null, env),
    134 +      Location: authorize.toString(),
    135 +    },
    136 +  });
    137 +}

• I'm planning the callback.js carefully, outlining key functions like exchanging tokens, fetching user profiles,
  extracting emails, handling membership invites, auto-provisioning roles, and managing auth state validation. I'll
  include error handling with redirects and ensure smooth session creation and redirection after login. This sets a
  clear roadmap before coding.

• Added functions/api/auth/oidc/callback.js (+343 -0)
      1 +import { errorResponse, handleOptions, withHeaders } from '../../_utils.js';
      2 +import { createEntity, listEntities, updateEntity } from '../../_store.js';
      3 +import { createSession } from '../../_auth.js';
      4 +import { getProviderConfig } from './_providers.js';
      5 +import { getSchoolAuthPolicy, isDomainAllowed, policyAllowsProvider, resolveSchool } from './_policy.js';
      6 +
      7 +function nowIso() {
      8 +  return new Date().toISOString();
      9 +}
     10 +
     11 +function isExpired(expiresAt) {
     12 +  if (!expiresAt) return false;
     13 +  const parsed = new Date(expiresAt);
     14 +  if (Number.isNaN(parsed.valueOf())) return false;
     15 +  return parsed <= new Date();
     16 +}
     17 +
     18 +function normalizeNext(nextUrl, origin) {
     19 +  if (!nextUrl) return new URL('/', origin).toString();
     20 +  try {
     21 +    const url = new URL(nextUrl, origin);
     22 +    if (url.origin !== origin) return new URL('/', origin).toString();
     23 +    return url.toString();
     24 +  } catch {
     25 +    return new URL('/', origin).toString();
     26 +  }
     27 +}
     28 +
     29 +function redirectWithError(code, message, nextUrl, origin, env) {
     30 +  const target = new URL(normalizeNext(nextUrl, origin), origin);
     31 +  target.searchParams.set('authError', code);
     32 +  if (message) {
     33 +    target.searchParams.set('authErrorMessage', message);
     34 +  }
     35 +  return new Response(null, {
     36 +    status: 302,
     37 +    headers: {
     38 +      ...withHeaders(null, env),
     39 +      Location: target.toString(),
     40 +    },
     41 +  });
     42 +}
     43 +
     44 +function normalizeRole(role) {
     45 +  const value = String(role || '').toUpperCase();
     46 +  const allowed = new Set(['STUDENT', 'INSTRUCTOR', 'TEACHER', 'TA', 'ADMIN', 'OWNER']);
     47 +  return allowed.has(value) ? value : 'STUDENT';
     48 +}
     49 +
     50 +function extractEmail(profile) {
     51 +  return (
     52 +    profile?.email
     53 +    || profile?.preferred_username
     54 +    || profile?.upn
     55 +    || profile?.userPrincipalName
     56 +    || profile?.mail
     57 +    || null
     58 +  );
     59 +}
     60 +
     61 +function extractName(profile, fallbackEmail) {
     62 +  return profile?.name || profile?.given_name || fallbackEmail || null;
     63 +}
     64 +
     65 +function extractProviderUserId(profile) {
     66 +  return profile?.sub || profile?.id || profile?.oid || null;
     67 +}
     68 +
     69 +async function exchangeCode(config, code, codeVerifier) {
     70 +  const body = new URLSearchParams();
     71 +  body.set('client_id', config.clientId);
     72 +  body.set('client_secret', config.clientSecret);
     73 +  body.set('grant_type', 'authorization_code');
     74 +  body.set('code', code);
     75 +  body.set('redirect_uri', config.redirectUri);
     76 +  if (codeVerifier) {
     77 +    body.set('code_verifier', codeVerifier);
     78 +  }
     79 +
     80 +  const response = await fetch(config.tokenUrl, {
     81 +    method: 'POST',
     82 +    headers: {
     83 +      'Content-Type': 'application/x-www-form-urlencoded',
     84 +    },
     85 +    body: body.toString(),
     86 +  });
     87 +
     88 +  const data = await response.json().catch(() => null);
     89 +  if (!response.ok) {
     90 +    const message = data?.error_description || data?.error || 'Token exchange failed';
     91 +    const error = new Error(message);
     92 +    error.status = response.status;
     93 +    throw error;
     94 +  }
     95 +  return data;
     96 +}
     97 +
     98 +async function fetchUserInfo(config, accessToken) {
     99 +  const response = await fetch(config.userinfoUrl, {
    100 +    headers: {
    101 +      Authorization: `Bearer ${accessToken}`,
    102 +    },
    103 +  });
    104 +  const data = await response.json().catch(() => null);
    105 +  if (!response.ok) {
    106 +    const error = new Error(data?.error || 'Userinfo request failed');
    107 +    error.status = response.status;
    108 +    throw error;
    109 +  }
    110 +  return data;
    111 +}
    112 +
    113 +async function ensureUserRecord(env, profile) {
    114 +  if (!profile?.email) return null;
    115 +  const existing = await listEntities(env, 'User', {
    116 +    filters: { user_email: profile.email },
    117 +    limit: 1,
    118 +  });
    119 +  if (existing?.[0]) {
    120 +    const current = existing[0];
    121 +    const updates = {
    122 +      full_name: profile.name || current.full_name,
    123 +      avatar_url: profile.picture || current.avatar_url,
    124 +      last_login_at: nowIso(),
    125 +    };
    126 +    await updateEntity(env, 'User', current.id, updates);
    127 +    return { ...current, ...updates };
    128 +  }
    129 +  return await createEntity(env, 'User', {
    130 +    user_email: profile.email,
    131 +    email: profile.email,
    132 +    full_name: profile.name || null,
    133 +    avatar_url: profile.picture || null,
    134 +    last_login_at: nowIso(),
    135 +  });
    136 +}
    137 +
    138 +async function upsertIdentityLink(env, provider, providerUserId, profile) {
    139 +  if (!provider || !providerUserId) return null;
    140 +  const id = `${provider}:${providerUserId}`;
    141 +  const existing = await listEntities(env, 'IdentityLink', {
    142 +    filters: { id },
    143 +    limit: 1,
    144 +  });
    145 +  if (existing?.[0]) {
    146 +    const current = existing[0];
    147 +    const updates = {
    148 +      user_email: profile.email,
    149 +      last_seen_at: nowIso(),
    150 +      provider_email: profile.email,
    151 +      provider_name: profile.name,
    152 +    };
    153 +    await updateEntity(env, 'IdentityLink', current.id, updates);
    154 +    return { ...current, ...updates };
    155 +  }
    156 +  return await createEntity(env, 'IdentityLink', {
    157 +    id,
    158 +    provider,
    159 +    provider_user_id: providerUserId,
    160 +    user_email: profile.email,
    161 +    provider_email: profile.email,
    162 +    provider_name: profile.name,
    163 +    linked_at: nowIso(),
    164 +    last_seen_at: nowIso(),
    165 +  });
    166 +}
    167 +
    168 +async function findMembership(env, schoolId, email) {
    169 +  if (!schoolId || !email) return null;
    170 +  const rows = await listEntities(env, 'SchoolMembership', {
    171 +    filters: { school_id: String(schoolId), user_email: email },
    172 +    limit: 1,
    173 +  });
    174 +  return rows?.[0] || null;
    175 +}
    176 +
    177 +async function acceptInviteIfExists(env, schoolId, email) {
    178 +  if (!schoolId || !email) return null;
    179 +  const invites = await listEntities(env, 'SchoolInvite', {
    180 +    filters: { school_id: String(schoolId), email },
    181 +    limit: 25,
    182 +  });
    183 +  const now = new Date();
    184 +  const invite = (invites || []).find((row) => {
    185 +    if (row.accepted_at) return false;
    186 +    if (row.expires_at && new Date(row.expires_at) <= now) return false;
    187 +    return true;
    188 +  });
    189 +  if (!invite) return null;
    190 +
    191 +  const membership = await createEntity(env, 'SchoolMembership', {
    192 +    school_id: String(schoolId),
    193 +    user_email: email,
    194 +    role: normalizeRole(invite.role),
    195 +    joined_at: nowIso(),
    196 +  });
    197 +
    198 +  await updateEntity(env, 'SchoolInvite', invite.id, {
    199 +    accepted_at: nowIso(),
    200 +  });
    201 +
    202 +  await createEntity(env, 'AuditLog', {
    203 +    school_id: String(schoolId),
    204 +    user_email: email,
    205 +    action: 'SCHOOL_INVITE_ACCEPTED',
    206 +    entity_type: 'SchoolInvite',
    207 +    entity_id: invite.id,
    208 +    metadata: { invited_email: invite.email, role: invite.role },
    209 +  });
    210 +
    211 +  return membership;
    212 +}
    213 +
    214 +async function autoProvisionMembership(env, policy, schoolId, email) {
    215 +  if (!policy || !policy.auto_provision) return null;
    216 +  const role = normalizeRole(policy.auto_provision_role || policy.default_role || 'STUDENT');
    217 +  const membership = await createEntity(env, 'SchoolMembership', {
    218 +    school_id: String(schoolId),
    219 +    user_email: email,
    220 +    role,
    221 +    joined_at: nowIso(),
    222 +  });
    223 +  await createEntity(env, 'AuditLog', {
    224 +    school_id: String(schoolId),
    225 +    user_email: email,
    226 +    action: 'SSO_AUTO_PROVISIONED',
    227 +    entity_type: 'SchoolMembership',
    228 +    entity_id: membership.id,
    229 +    metadata: { role },
    230 +  });
    231 +  return membership;
    232 +}
    233 +
    234 +export async function onRequest({ request, env }) {
    235 +  const options = handleOptions(request, env);
    236 +  if (options) return options;
    237 +
    238 +  if (request.method !== 'GET') {
    239 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
    240 +  }
    241 +
    242 +  const url = new URL(request.url);
    243 +  const code = url.searchParams.get('code');
    244 +  const stateId = url.searchParams.get('state');
    245 +  const providerParam = (url.searchParams.get('provider') || '').toLowerCase();
    246 +
    247 +  if (!code || !stateId) {
    248 +    return redirectWithError('missing_code', 'Missing authorization code', '/', url.origin, env);
    249 +  }
    250 +
    251 +  const stateRows = await listEntities(env, 'AuthState', {
    252 +    filters: { id: String(stateId) },
    253 +    limit: 1,
    254 +  });
    255 +  const state = stateRows?.[0];
    256 +  if (!state || state.used_at || state.revoked_at || isExpired(state.expires_at)) {
    257 +    return redirectWithError('invalid_state', 'Login state expired', '/', url.origin, env);
    258 +  }
    259 +
    260 +  const provider = providerParam || state.provider;
    261 +  const config = getProviderConfig(provider, env, url.origin);
    262 +  if (!config) {
    263 +    return redirectWithError('provider_not_configured', 'Provider not configured', state.next_url, url.origin,
         env);
    264 +  }
    265 +
    266 +  let tokenResponse;
    267 +  try {
    268 +    tokenResponse = await exchangeCode(config, code, state.code_verifier);
    269 +  } catch (error) {
    270 +    return redirectWithError('token_exchange_failed', error.message, state.next_url, url.origin, env);
    271 +  }
    272 +
    273 +  let profile;
    274 +  try {
    275 +    profile = await fetchUserInfo(config, tokenResponse.access_token);
    276 +  } catch (error) {
    277 +    return redirectWithError('userinfo_failed', error.message, state.next_url, url.origin, env);
    278 +  }
    279 +
    280 +  const email = extractEmail(profile);
    281 +  if (!email) {
    282 +    return redirectWithError('email_missing', 'No email returned by provider', state.next_url, url.origin, env)
         ;
    283 +  }
    284 +
    285 +  const name = extractName(profile, email);
    286 +  const providerUserId = extractProviderUserId(profile);
    287 +
    288 +  const school = await resolveSchool(env, state.school_id, state.school_slug);
    289 +  const policy = await getSchoolAuthPolicy(env, school?.id);
    290 +  const allowAll = String(env?.OIDC_ALLOW_ALL || '').toLowerCase() === 'true';
    291 +
    292 +  if (school?.id) {
    293 +    if (!policyAllowsProvider(policy, provider, allowAll)) {
    294 +      return redirectWithError('sso_disabled', 'SSO not enabled for this school', state.next_url, url.origin, e
         nv);
    295 +    }
    296 +    if (!isDomainAllowed(policy, email)) {
    297 +      return redirectWithError('domain_blocked', 'Email domain not allowed', state.next_url, url.origin, env);
    298 +    }
    299 +  }
    300 +
    301 +  await ensureUserRecord(env, { email, name, picture: profile?.picture });
    302 +  await upsertIdentityLink(env, provider, providerUserId, { email, name });
    303 +
    304 +  let membership = null;
    305 +  if (school?.id) {
    306 +    membership = await findMembership(env, school.id, email);
    307 +    if (!membership) {
    308 +      membership = await acceptInviteIfExists(env, school.id, email);
    309 +    }
    310 +    if (!membership && policy?.auto_provision) {
    311 +      membership = await autoProvisionMembership(env, policy, school.id, email);
    312 +    }
    313 +  }
    314 +
    315 +  const session = await createSession(env, {
    316 +    user_email: email,
    317 +    user_name: name,
    318 +    provider,
    319 +    school_id: school?.id || null,
    320 +    role: membership?.role || null,
    321 +    metadata: {
    322 +      provider,
    323 +      school_id: school?.id || null,
    324 +      audience: state.intended_audience || null,
    325 +    },
    326 +  });
    327 +
    328 +  await updateEntity(env, 'AuthState', state.id, {
    329 +    used_at: nowIso(),
    330 +  });
    331 +
    332 +  const nextUrl = normalizeNext(state.next_url, url.origin);
    333 +  const redirect = new URL(nextUrl, url.origin);
    334 +  redirect.searchParams.set('token', session.id);
    335 +
    336 +  return new Response(null, {
    337 +    status: 302,
    338 +    headers: {
    339 +      ...withHeaders(null, env),
    340 +      Location: redirect.toString(),
    341 +    },
    342 +  });
    343 +}

• Added functions/api/auth/providers.js (+28 -0)
     1 +import { handleOptions, json } from '../_utils.js';
     2 +import { listProviderStates } from './oidc/_providers.js';
     3 +import { getSchoolAuthPolicy, policyAllowsProvider, resolveSchool, sanitizePolicyForPublic } from './oidc/_polic
        y.js';
     4 +
     5 +export async function onRequest({ request, env }) {
     6 +  const options = handleOptions(request, env);
     7 +  if (options) return options;
     8 +
     9 +  const url = new URL(request.url);
    10 +  const schoolSlug = url.searchParams.get('schoolSlug') || url.searchParams.get('school_slug') || '';
    11 +  const schoolId = url.searchParams.get('schoolId') || url.searchParams.get('school_id') || '';
    12 +
    13 +  const school = await resolveSchool(env, schoolId, schoolSlug);
    14 +  const policy = await getSchoolAuthPolicy(env, school?.id);
    15 +  const allowAll = String(env?.OIDC_ALLOW_ALL || '').toLowerCase() === 'true';
    16 +
    17 +  const providers = listProviderStates(env, url.origin).map((provider) => ({
    18 +    ...provider,
    19 +    allowed: provider.configured && policyAllowsProvider(policy, provider.id, allowAll),
    20 +  }));
    21 +
    22 +  return json({
    23 +    school_id: school?.id || null,
    24 +    school_slug: school?.slug || null,
    25 +    providers,
    26 +    policy: sanitizePolicyForPublic(policy),
    27 +  }, { env });
    28 +}

• Edited functions/api/entities/[entity].js (+16 -1)
     1 -import { errorResponse, handleOptions, json, normalizeLimit, parseQueryJson, readJson } from '../_utils.js';
     2  import { createEntity, listEntities } from '../_store.js';
     3 +import { getUserFromToken } from '../_auth.js';
     4 +
     5 +const SENSITIVE_ENTITIES = new Set(['AuthSession', 'AuthState', 'IdentityLink']);
     6
     7 +async function enforceSensitiveAccess(entity, request, env) {
     8 +  if (!SENSITIVE_ENTITIES.has(entity)) return null;
     9 +  const token = getBearerToken(request);
    10 +  const user = await getUserFromToken(token, env);
    11 +  if (!user) {
    12 +    return errorResponse('auth_required', 401, 'Authentication required', env);
    13 +  }
    14 +  return null;
    15 +}
    16 +
    17  function normalizePreviewChars(value) {
       ⋮
    41    }
    42 +  const guard = await enforceSensitiveAccess(entity, request, env);
    43 +  if (guard) return guard;
    44

• Ran rg -n "getUserFromToken" functions
  └ functions\api\_auth.js:41:export async function getUserFromToken(token, env) {
    functions\api\downloads\secure.js:3:import { getUserFromToken } from '../_auth.js';
    … +3 lines
    functions\api\auth\me.js:2:import { getUserFromToken } from '../_auth.js';
    functions\api\auth\me.js:13:  const user = await getUserFromToken(token, env);

    30 -  'PricingChangeRequest', 'DownloadToken'
    30 +  'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy'
    31 +];
    32 +
    33 +export const GLOBAL_ENTITIES = [
    36 +  'TenantApplication', 'AuthSession', 'AuthState', 'IdentityLink'
    37  ];
    32 -
    33 -export const GLOBAL_ENTITIES = [
    34 -  'User', 'School', 'GoogleOAuthToken', 'GoogleDriveToken',
    35 -  'Notification', 'Integration', 'UserSchoolPreference',
    36 -  'TenantApplication'
    37 -];
    38
  token handling and providers; now I’m preparing to move on to step 2, which focuses on adding a new admin UI component
  for configuring school-level auth policies with various toggles and inputs following the design system. I'll ensure
  proper data loading, saving, and audit logging while aligning with existing UI components like switches.

• Ran Get-ChildItem -Path src\components\ui -Filter "switch*"
  └
        Directory: C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\src\components\ui
    … +3 lines
    -a---            1/9/2026  9:44 AM           1025 switch.jsx


• Ran Get-Content -Raw src\components\ui\switch.jsx
    … +19 lines
    export { Switch }


• I'm mapping out how to integrate provider status display using Switch and Textarea components, fetch configured

• Ran Get-Content -Raw src\components\storefront\SchoolHero.jsx
  └ import React from 'react';
    import { Button } from '@/components/ui/button';
    … +73 lines
    }


• This is a detailed plan to enhance login flows across student, teacher, and admin portals by passing schoolSlug and
  supporting SSO provider selection. I’m thinking of creating a shared AuthProviderButtons component to fetch and
  display available auth providers per school, handle URL params like schoolSlug and authError, and update login pages
  accordingly. Also planning admin UI changes to configure auth providers per school with display of configured status,
  plus tweaks to tabs and state handling. It's a lot, but breaking it into reusable components and careful URL param
  management should keep things clean. Let’s explore this carefully!

• Ran Get-Content -Raw src\portals\public\pages\LoginTeacher.jsx
  └ import React, { useEffect } from 'react';
    import { useAuth } from '@/lib/AuthContext';
    … +48 lines
    }


• Ran Get-Content -Raw src\portals\public\pages\LoginAdmin.jsx
  └ import React, { useEffect } from 'react';
    import { useAuth } from '@/lib/AuthContext';
    … +48 lines
    }


• I’m outlining updates to pass schoolSlug to login links, replace sign-in buttons with React Router Links including
  query parameters, and add a new SchoolAuthSettings admin component with policy querying, form state, and save logic.
  I’ll also update admin tabs to include this new component and create AuthProviderButtons for login pages to handle SSO
  provider availability and errors. Finally, I’ll patch related components like PublicHome and SchoolHero accordingly.
  This will improve SSO and multi-school support across the app.

• Added src/portals/public/components/AuthProviderButtons.jsx (+81 -0)
     1 +import React, { useMemo } from 'react';
     2 +import { useQuery } from '@tanstack/react-query';
     3 +import { base44 } from '@/api/base44Client';
     4 +import { Button } from '@/components/ui/button';
     5 +import { Badge } from '@/components/ui/badge';
     6 +import { Lock } from 'lucide-react';
     7 +
     8 +const PROVIDER_LABELS = {
     9 +  google: 'Continue with Google',
    10 +  microsoft: 'Continue with Microsoft',
    11 +};
    12 +
    13 +function normalizeNextPath(path) {
    14 +  if (!path) return '/';
    15 +  if (path.startsWith('/')) return path;
    16 +  return `/${path}`;
    17 +}
    18 +
    19 +function buildStartUrl(provider, audience, nextPath, schoolSlug) {
    20 +  const origin = window.location.origin;
    21 +  const target = new URL('/api/auth/oidc/start', origin);
    22 +  target.searchParams.set('provider', provider);
    23 +  target.searchParams.set('next', `${origin}${normalizeNextPath(nextPath)}`);
    24 +  if (audience) target.searchParams.set('audience', audience);
    25 +  if (schoolSlug) target.searchParams.set('schoolSlug', schoolSlug);
    26 +  return target.toString();
    27 +}
    28 +
    29 +export default function AuthProviderButtons({ audience, schoolSlug, nextPath, onFallback, fallbackLabel }) {
    30 +  const { data, isLoading } = useQuery({
    31 +    queryKey: ['auth-providers', schoolSlug],
    32 +    queryFn: () => base44.request('/auth/providers', {
    33 +      params: schoolSlug ? { schoolSlug } : undefined,
    34 +    }),
    35 +  });
    36 +
    37 +  const providers = useMemo(() => {
    38 +    const list = data?.providers || [];
    39 +    return list.filter((provider) => provider.allowed);
    40 +  }, [data]);
    41 +
    42 +  if (isLoading) {
    43 +    return (
    44 +      <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
    45 +        Checking available sign-in options...
    46 +      </div>
    47 +    );
    48 +  }
    49 +
    50 +  return (
    51 +    <div className="space-y-4">
    52 +      {providers.length > 0 ? (
    53 +        <div className="grid gap-3">
    54 +          {providers.map((provider) => (
    55 +            <Button
    56 +              key={provider.id}
    57 +              className="h-12 justify-between"
    58 +              onClick={() => window.location.assign(buildStartUrl(provider.id, audience, nextPath, schoolSlug))}
    59 +            >
    60 +              <span>{PROVIDER_LABELS[provider.id] || `Continue with ${provider.id}`}</span>
    61 +              <Badge variant="secondary" className="ml-2">SSO</Badge>
    62 +            </Button>
    63 +          ))}
    64 +        </div>
    65 +      ) : (
    66 +        <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm text-mute
        d-foreground">
    67 +          <div className="flex items-center gap-2">
    68 +            <Lock className="h-4 w-4" />
    69 +            <span>No SSO providers are enabled for this school yet.</span>
    70 +          </div>
    71 +        </div>
    72 +      )}
    73 +
    74 +      {onFallback && (
    75 +        <Button variant="outline" className="h-11 w-full" onClick={onFallback}>
    76 +          {fallbackLabel || 'Continue with secure login'}
    77 +        </Button>
    78 +      )}
    79 +    </div>
    80 +  );
    81 +}

• Edited src/portals/public/pages/LoginStudent.jsx (+62 -40)
     1 -import React, { useEffect } from 'react';
     2 -import { useAuth } from '@/lib/AuthContext';
     3 -import { Button } from '@/components/ui/button';
     1 +import React, { useEffect, useMemo } from 'react';
     2 +import { useSearchParams } from 'react-router-dom';
     3 +import { useAuth } from '@/lib/AuthContext';
     4 +import { Button } from '@/components/ui/button';
     5 +import AuthProviderButtons from '@/portals/public/components/AuthProviderButtons';
     6
     5 -export default function LoginStudent() {
     6 -  const { navigateToLogin } = useAuth();
     7 -
     8 -  useEffect(() => {
     7 +export default function LoginStudent() {
     8 +  const { navigateToLogin } = useAuth();
     9 +  const [params] = useSearchParams();
    10 +
    11 +  const schoolSlug = params.get('schoolSlug') || params.get('school_slug') || '';
    12 +  const authError = params.get('authError');
    13 +  const authErrorMessage = params.get('authErrorMessage');
    14 +
    15 +  useEffect(() => {
    16      try {
       ⋮
    25      } catch {}
    19 -  }, []);
    20 -
    21 -  const handle = () => {
    22 -    const origin = window.location.origin;
    23 -    const params = new URLSearchParams(window.location.search);
    24 -    const returnTo = params.get('returnTo');
    25 -    const safeReturnTo = (() => {
    26 -      if (!returnTo) return null;
    27 -      const p = String(returnTo);
    28 -      if (p.includes('://')) return null;
    29 -      if (!(p.startsWith('/student'))) return null;
    30 -      return p;
    31 -    })();
    32 -
    33 -    navigateToLogin(safeReturnTo ? `${origin}${safeReturnTo}` : `${origin}/student?loginRole=student`);
    34 -  };
    35 -
    36 -  return (
    37 -    <div className="mx-auto max-w-2xl px-4 py-16">
    38 -      <h1 className="text-3xl font-semibold tracking-tight">Student login</h1>
    39 -      <p className="mt-4 text-base text-muted-foreground">
    40 -        Sign in to access your lessons, quizzes, progress tracking, and community features.
    41 -      </p>
    42 -      <div className="mt-8 flex gap-3">
    43 -        <Button onClick={handle}>Continue to sign in</Button>
    44 -        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    45 -      </div>
    46 -      <p className="mt-8 text-xs text-muted-foreground">
    47 -        After sign in, you’ll be returned to the student dashboard.
    48 -      </p>
    49 -    </div>
    50 -  );
    51 -}
    26 +  }, []);
    27 +
    28 +  const nextPath = useMemo(() => {
    29 +    const returnTo = params.get('returnTo');
    30 +    if (returnTo) {
    31 +      const value = String(returnTo);
    32 +      if (!value.includes('://') && value.startsWith('/student')) {
    33 +        return value;
    34 +      }
    35 +    }
    36 +    return '/student?loginRole=student';
    37 +  }, [params]);
    38 +
    39 +  const handle = () => {
    40 +    const origin = window.location.origin;
    41 +    navigateToLogin(`${origin}${nextPath}`);
    42 +  };
    43 +
    44 +  return (
    45 +    <div className="mx-auto max-w-2xl px-4 py-16">
    46 +      <h1 className="text-3xl font-semibold tracking-tight">Student login</h1>
    47 +      <p className="mt-4 text-base text-muted-foreground">
    48 +        Sign in to access your lessons, quizzes, progress tracking, and community features.
    49 +      </p>
    50 +      {authError && (
    51 +        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-des
        tructive">
    52 +          {authErrorMessage || 'Sign-in failed. Please try again or contact your school admin.'}
    53 +        </div>
    54 +      )}
    55 +      <div className="mt-8 flex gap-3">
    56 +        <Button onClick={handle}>Continue to sign in</Button>
    57 +        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    58 +      </div>
    59 +      <div className="mt-8">
    60 +        <AuthProviderButtons
    61 +          audience="student"
    62 +          schoolSlug={schoolSlug}
    63 +          nextPath={nextPath}
    64 +          onFallback={handle}
    65 +          fallbackLabel="Use secure login"
    66 +        />
    67 +      </div>
    68 +      <p className="mt-8 text-xs text-muted-foreground">
    69 +        After sign in, you'll be returned to the student dashboard.
    70 +      </p>
    71 +    </div>
    72 +  );
    73 +}

• Edited src/portals/public/pages/LoginTeacher.jsx (+60 -38)
     1 -import React, { useEffect } from 'react';
     2 -import { useAuth } from '@/lib/AuthContext';
     3 -import { Button } from '@/components/ui/button';
     1 +import React, { useEffect, useMemo } from 'react';
     2 +import { useSearchParams } from 'react-router-dom';
     3 +import { useAuth } from '@/lib/AuthContext';
     4 +import { Button } from '@/components/ui/button';
     5 +import AuthProviderButtons from '@/portals/public/components/AuthProviderButtons';
     6
     5 -export default function LoginTeacher() {
     6 -  const { navigateToLogin } = useAuth();
     7 +export default function LoginTeacher() {
     8 +  const { navigateToLogin } = useAuth();
     9 +  const [params] = useSearchParams();
    10 +
    11 +  const schoolSlug = params.get('schoolSlug') || params.get('school_slug') || '';
    12 +  const authError = params.get('authError');
    13 +  const authErrorMessage = params.get('authErrorMessage');
    14
       ⋮
    25      } catch {}
    19 -  }, []);
    20 -
    21 -  const handle = () => {
    22 -    const origin = window.location.origin;
    23 -    const params = new URLSearchParams(window.location.search);
    24 -    const returnTo = params.get('returnTo');
    25 -    const safeReturnTo = (() => {
    26 -      if (!returnTo) return null;
    27 -      const p = String(returnTo);
    28 -      if (p.includes('://')) return null;
    29 -      if (!(p.startsWith('/teacher') || p.startsWith('/admin'))) return null;
    30 -      return p;
    31 -    })();
    32 -
    33 -    navigateToLogin(safeReturnTo ? `${origin}${safeReturnTo}` : `${origin}/teacher?loginRole=teacher`);
    34 -  };
    35 -
    36 -  return (
    37 -    <div className="mx-auto max-w-2xl px-4 py-16">
    38 -      <h1 className="text-3xl font-semibold tracking-tight">Teacher login</h1>
    39 -      <p className="mt-4 text-base text-muted-foreground">
    40 -        Sign in to manage courses, lessons, quizzes, and analytics for your school.
    41 -      </p>
    42 -      <div className="mt-8 flex gap-3">
    43 -        <Button onClick={handle}>Continue to sign in</Button>
    44 -        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    45 -      </div>
    46 -      <p className="mt-8 text-xs text-muted-foreground">
    47 -        After sign in, you’ll be returned to the teaching portal.
    48 -      </p>
    49 -    </div>
    50 -  );
    51 -}
    26 +  }, []);
    27 +
    28 +  const nextPath = useMemo(() => {
    29 +    const returnTo = params.get('returnTo');
    30 +    if (returnTo) {
    31 +      const value = String(returnTo);
    32 +      if (!value.includes('://') && (value.startsWith('/teacher') || value.startsWith('/admin'))) {
    33 +        return value;
    34 +      }
    35 +    }
    36 +    return '/teacher?loginRole=teacher';
    37 +  }, [params]);
    38 +
    39 +  const handle = () => {
    40 +    const origin = window.location.origin;
    41 +    navigateToLogin(`${origin}${nextPath}`);
    42 +  };
    43 +
    44 +  return (
    45 +    <div className="mx-auto max-w-2xl px-4 py-16">
    46 +      <h1 className="text-3xl font-semibold tracking-tight">Teacher login</h1>
    47 +      <p className="mt-4 text-base text-muted-foreground">
    48 +        Sign in to manage courses, lessons, quizzes, and analytics for your school.
    49 +      </p>
    50 +      {authError && (
    51 +        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-des
        tructive">
    52 +          {authErrorMessage || 'Sign-in failed. Please try again or contact your school admin.'}
    53 +        </div>
    54 +      )}
    55 +      <div className="mt-8 flex gap-3">
    56 +        <Button onClick={handle}>Continue to sign in</Button>
    57 +        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    58 +      </div>
    59 +      <div className="mt-8">
    60 +        <AuthProviderButtons
    61 +          audience="teacher"
    62 +          schoolSlug={schoolSlug}
    63 +          nextPath={nextPath}
    64 +          onFallback={handle}
    65 +          fallbackLabel="Use secure login"
    66 +        />
    67 +      </div>
    68 +      <p className="mt-8 text-xs text-muted-foreground">
    69 +        After sign in, you'll be returned to the teaching portal.
    70 +      </p>
    71 +    </div>
    72 +  );
    73 +}

• Edited src/portals/public/pages/LoginAdmin.jsx (+35 -13)
     1 -import React, { useEffect } from 'react';
     1 +import React, { useEffect, useMemo } from 'react';
     2 +import { useSearchParams } from 'react-router-dom';
     3  import { useAuth } from '@/lib/AuthContext';
     4  import { Button } from '@/components/ui/button';
     5 +import AuthProviderButtons from '@/portals/public/components/AuthProviderButtons';
     6
       ⋮
     8    const { navigateToLogin } = useAuth();
     9 +  const [params] = useSearchParams();
    10 +
    11 +  const schoolSlug = params.get('schoolSlug') || params.get('school_slug') || '';
    12 +  const authError = params.get('authError');
    13 +  const authErrorMessage = params.get('authErrorMessage');
    14
       ⋮
    27
    28 +  const nextPath = useMemo(() => {
    29 +    const returnTo = params.get('returnTo');
    30 +    if (returnTo) {
    31 +      const value = String(returnTo);
    32 +      if (!value.includes('://') && value.startsWith('/admin')) {
    33 +        return value;
    34 +      }
    35 +    }
    36 +    return '/admin?loginRole=admin';
    37 +  }, [params]);
    38 +
    39    const handle = () => {
    40      const origin = window.location.origin;
    23 -    const params = new URLSearchParams(window.location.search);
    24 -    const returnTo = params.get('returnTo');
    25 -    const safeReturnTo = (() => {
    26 -      if (!returnTo) return null;
    27 -      const p = String(returnTo);
    28 -      if (p.includes('://')) return null;
    29 -      if (!p.startsWith('/admin')) return null;
    30 -      return p;
    31 -    })();
    32 -
    33 -    navigateToLogin(safeReturnTo ? `${origin}${safeReturnTo}` : `${origin}/admin?loginRole=admin`);
    41 +    navigateToLogin(`${origin}${nextPath}`);
    42    };
       ⋮
    49        </p>
    50 +      {authError && (
    51 +        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-des
        tructive">
    52 +          {authErrorMessage || 'Sign-in failed. Please try again or contact your school admin.'}
    53 +        </div>
    54 +      )}
    55        <div className="mt-8 flex gap-3">
       ⋮
    58        </div>
    59 +      <div className="mt-8">
    60 +        <AuthProviderButtons
    61 +          audience="admin"
    62 +          schoolSlug={schoolSlug}
    63 +          nextPath={nextPath}
    64 +          onFallback={handle}
    65 +          fallbackLabel="Use secure login"
    66 +        />
    67 +      </div>
    68        <p className="mt-8 text-xs text-muted-foreground">
    47 -        After sign in, you’ll be returned to the admin portal.
    69 +        After sign in, you'll be returned to the admin portal.
    70        </p>

• Edited src/portals/public/pages/PublicHome.jsx (+7 -1)
    128
    129 +  const portalHref = useMemo(() => {
    130 +    if (!selectedSchoolSlug) return portalRoute;
    131 +    const params = new URLSearchParams({ schoolSlug: selectedSchoolSlug });
    132 +    return `${portalRoute}?${params.toString()}`;
    133 +  }, [portalRoute, selectedSchoolSlug]);
    134 +
    135    const { data: offersRaw = [], isLoading: isLoadingOffers } = useQuery({
        ⋮
    344                      <Button className="h-11" asChild>
    339 -                      <Link to={portalRoute}>
    345 +                      <Link to={portalHref}>
    346                          Continue

• Edited src/components/storefront/SchoolHero.jsx (+12 -11)
     5  import { createPageUrl } from '@/utils';
     6 -import { base44 } from '@/api/base44Client';
     6
       ⋮
    60
    62 -          {!user && (
    63 -            <Button
    66 -              className="h-14 px-8 text-lg border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-wh
        ite backdrop-blur-sm"
    67 -              onClick={() => base44.auth.redirectToLogin()}
    68 -            >
    69 -              Sign In
    70 -            </Button>
    71 -          )}
    61 +          {!user && (
    62 +            <Button
    63 +              size="lg"
    64 +              variant="outline"
    65 +              className="h-14 px-8 text-lg border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-wh
        ite backdrop-blur-sm"
    66 +              asChild
    67 +            >
    68 +              <Link to={`/login/student?schoolSlug=${encodeURIComponent(slug || '')}`}>
    69 +                Sign In
    70 +              </Link>
    71 +            </Button>
    72 +          )}
    73          </div>

• Ran Get-Content -Raw src\components\storefront\SchoolHero.jsx
  └ import React from 'react';
    import { Button } from '@/components/ui/button';
    … +74 lines
    }


• Added src/components/school/SchoolAuthSettings.jsx (+254 -0)
      1 +import React, { useEffect, useMemo, useState } from 'react';
      2 +import { useQuery } from '@tanstack/react-query';
      3 +import { base44 } from '@/api/base44Client';
      4 +import { scopedCreate, scopedFilter, scopedUpdate } from '@/components/api/scoped';
      5 +import { Button } from '@/components/ui/button';
      6 +import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
      7 +import { Input } from '@/components/ui/input';
      8 +import { Label } from '@/components/ui/label';
      9 +import { Switch } from '@/components/ui/switch';
     10 +import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
     11 +import { Badge } from '@/components/ui/badge';
     12 +import { toast } from 'sonner';
     13 +import { useSession } from '@/components/hooks/useSession';
     14 +
     15 +const PROVIDERS = [
     16 +  { id: 'google', label: 'Google Workspace' },
     17 +  { id: 'microsoft', label: 'Microsoft 365' },
     18 +];
     19 +
     20 +const ROLE_OPTIONS = ['STUDENT', 'INSTRUCTOR', 'TEACHER', 'TA', 'ADMIN'];
     21 +
     22 +function normalizeDomains(raw) {
     23 +  if (!raw) return [];
     24 +  return raw
     25 +    .split(/[\n,]+/)
     26 +    .map((value) => value.trim().replace(/^@/, '').toLowerCase())
     27 +    .filter(Boolean);
     28 +}
     29 +
     30 +function formatDomains(domains) {
     31 +  if (!Array.isArray(domains)) return '';
     32 +  return domains.join(', ');
     33 +}
     34 +
     35 +export default function SchoolAuthSettings({ schoolId }) {
     36 +  const { user } = useSession();
     37 +  const [form, setForm] = useState({
     38 +    ssoEnabled: false,
     39 +    allowedProviders: ['google'],
     40 +    allowedDomains: '',
     41 +    requireDomainMatch: true,
     42 +    allowPersonalEmails: false,
     43 +    autoProvision: false,
     44 +    autoProvisionRole: 'STUDENT',
     45 +  });
     46 +
     47 +  const { data: policyRows = [], isLoading: isPolicyLoading } = useQuery({
     48 +    queryKey: ['school-auth-policy', schoolId],
     49 +    queryFn: () => scopedFilter('SchoolAuthPolicy', schoolId, {}, '-created_date', 1),
     50 +    enabled: !!schoolId,
     51 +  });
     52 +
     53 +  const policy = policyRows?.[0] || null;
     54 +
     55 +  const { data: providerStatus } = useQuery({
     56 +    queryKey: ['auth-provider-status', schoolId],
     57 +    queryFn: () => base44.request('/auth/providers', {
     58 +      params: schoolId ? { schoolId } : undefined,
     59 +    }),
     60 +    enabled: !!schoolId,
     61 +  });
     62 +
     63 +  useEffect(() => {
     64 +    if (!policy) return;
     65 +    setForm({
     66 +      ssoEnabled: policy.sso_enabled !== false,
     67 +      allowedProviders: Array.isArray(policy.allowed_providers) && policy.allowed_providers.length > 0
     68 +        ? policy.allowed_providers
     69 +        : ['google'],
     70 +      allowedDomains: formatDomains(policy.allowed_domains),
     71 +      requireDomainMatch: policy.require_domain_match === true,
     72 +      allowPersonalEmails: policy.allow_personal_emails !== false,
     73 +      autoProvision: policy.auto_provision === true,
     74 +      autoProvisionRole: policy.auto_provision_role || policy.default_role || 'STUDENT',
     75 +    });
     76 +  }, [policy]);
     77 +
     78 +  const configuredProviders = useMemo(() => {
     79 +    const list = providerStatus?.providers || [];
     80 +    return list.reduce((acc, provider) => {
     81 +      acc[provider.id] = provider.configured;
     82 +      return acc;
     83 +    }, {});
     84 +  }, [providerStatus]);
     85 +
     86 +  const updateProvider = (providerId) => {
     87 +    setForm((prev) => {
     88 +      const exists = prev.allowedProviders.includes(providerId);
     89 +      const nextProviders = exists
     90 +        ? prev.allowedProviders.filter((id) => id !== providerId)
     91 +        : [...prev.allowedProviders, providerId];
     92 +      return { ...prev, allowedProviders: nextProviders };
     93 +    });
     94 +  };
     95 +
     96 +  const handleSave = async () => {
     97 +    if (!schoolId) return;
     98 +    const payload = {
     99 +      sso_enabled: form.ssoEnabled,
    100 +      allowed_providers: form.allowedProviders,
    101 +      allowed_domains: normalizeDomains(form.allowedDomains),
    102 +      require_domain_match: form.requireDomainMatch,
    103 +      allow_personal_emails: form.allowPersonalEmails,
    104 +      auto_provision: form.autoProvision,
    105 +      auto_provision_role: form.autoProvisionRole,
    106 +    };
    107 +
    108 +    try {
    109 +      let saved = null;
    110 +      if (policy?.id) {
    111 +        saved = await scopedUpdate('SchoolAuthPolicy', policy.id, payload, schoolId, true);
    112 +      } else {
    113 +        saved = await scopedCreate('SchoolAuthPolicy', schoolId, payload);
    114 +      }
    115 +
    116 +      if (user?.email) {
    117 +        await scopedCreate('AuditLog', schoolId, {
    118 +          school_id: schoolId,
    119 +          user_email: user.email,
    120 +          action: 'AUTH_POLICY_UPDATED',
    121 +          entity_type: 'SchoolAuthPolicy',
    122 +          entity_id: saved?.id || policy?.id || null,
    123 +          metadata: {
    124 +            providers: payload.allowed_providers,
    125 +            domains: payload.allowed_domains,
    126 +          },
    127 +        });
    128 +      }
    129 +
    130 +      toast.success('SSO settings saved');
    131 +    } catch (error) {
    132 +      toast.error('Failed to save SSO settings');
    133 +    }
    134 +  };
    135 +
    136 +  if (isPolicyLoading) {
    137 +    return <div className="text-sm text-muted-foreground">Loading SSO policy...</div>;
    138 +  }
    139 +
    140 +  return (
    141 +    <Card>
    142 +      <CardHeader>
    143 +        <CardTitle>SSO & Identity Providers</CardTitle>
    144 +        <CardDescription>
    145 +          Control which identity providers can access this school and how new users are provisioned.
    146 +        </CardDescription>
    147 +      </CardHeader>
    148 +      <CardContent className="space-y-6">
    149 +        <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
    150 +          <div>
    151 +            <p className="text-sm font-medium">Enable SSO</p>
    152 +            <p className="text-xs text-muted-foreground">Allow managed sign-in via Google or Microsoft.</p>
    153 +          </div>
    154 +          <Switch checked={form.ssoEnabled} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, ssoEnab
         led: checked }))} />
    155 +        </div>
    156 +
    157 +        <div className="space-y-3">
    158 +          <Label>Allowed providers</Label>
    159 +          <div className="grid gap-2 sm:grid-cols-2">
    160 +            {PROVIDERS.map((provider) => {
    161 +              const checked = form.allowedProviders.includes(provider.id);
    162 +              const configured = configuredProviders[provider.id] !== false;
    163 +              return (
    164 +                <button
    165 +                  key={provider.id}
    166 +                  type="button"
    167 +                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm t
         ransition ${
    168 +                    checked ? 'border-primary/60 bg-primary/5' : 'border-border/60'
    169 +                  }`}
    170 +                  onClick={() => updateProvider(provider.id)}
    171 +                >
    172 +                  <span>{provider.label}</span>
    173 +                  <Badge variant={configured ? 'secondary' : 'outline'}>
    174 +                    {configured ? 'Configured' : 'Missing credentials'}
    175 +                  </Badge>
    176 +                </button>
    177 +              );
    178 +            })}
    179 +          </div>
    180 +          <p className="text-xs text-muted-foreground">
    181 +            Provider credentials are stored in environment settings. Only configured providers can be enabled.
    182 +          </p>
    183 +        </div>
    184 +
    185 +        <div className="space-y-3">
    186 +          <Label>Allowed domains</Label>
    187 +          <Input
    188 +            value={form.allowedDomains}
    189 +            onChange={(event) => setForm((prev) => ({ ...prev, allowedDomains: event.target.value }))}
    190 +            placeholder="school.edu, kollel.org"
    191 +          />
    192 +          <p className="text-xs text-muted-foreground">
    193 +            Separate multiple domains with commas. Use domain enforcement for strict access.
    194 +          </p>
    195 +        </div>
    196 +
    197 +        <div className="grid gap-4 sm:grid-cols-2">
    198 +          <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
    199 +            <div>
    200 +              <p className="text-sm font-medium">Require domain match</p>
    201 +              <p className="text-xs text-muted-foreground">Only allow emails from the domains above.</p>
    202 +            </div>
    203 +            <Switch
    204 +              checked={form.requireDomainMatch}
    205 +              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, requireDomainMatch: checked }))}
    206 +            />
    207 +          </div>
    208 +          <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
    209 +            <div>
    210 +              <p className="text-sm font-medium">Allow personal emails</p>
    211 +              <p className="text-xs text-muted-foreground">Permit sign-ins outside managed domains.</p>
    212 +            </div>
    213 +            <Switch
    214 +              checked={form.allowPersonalEmails}
    215 +              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, allowPersonalEmails: checked }))}
    216 +            />
    217 +          </div>
    218 +        </div>
    219 +
    220 +        <div className="grid gap-4 sm:grid-cols-2">
    221 +          <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
    222 +            <div>
    223 +              <p className="text-sm font-medium">Auto-provision members</p>
    224 +              <p className="text-xs text-muted-foreground">Create memberships automatically after SSO.</p>
    225 +            </div>
    226 +            <Switch
    227 +              checked={form.autoProvision}
    228 +              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, autoProvision: checked }))}
    229 +            />
    230 +          </div>
    231 +          <div className="space-y-2">
    232 +            <Label>Default role</Label>
    233 +            <Select value={form.autoProvisionRole} onValueChange={(value) => setForm((prev) => ({ ...prev, auto
         ProvisionRole: value }))}>
    234 +              <SelectTrigger>
    235 +                <SelectValue />
    236 +              </SelectTrigger>
    237 +              <SelectContent>
    238 +                {ROLE_OPTIONS.map((role) => (
    239 +                  <SelectItem key={role} value={role}>
    240 +                    {role}
    241 +                  </SelectItem>
    242 +                ))}
    243 +              </SelectContent>
    244 +            </Select>
    245 +          </div>
    246 +        </div>
    247 +
    248 +        <div className="flex justify-end">
    249 +          <Button onClick={handleSave}>Save SSO Settings</Button>
    250 +        </div>
    251 +      </CardContent>
    252 +    </Card>
    253 +  );
    254 +}

• Edited src/pages/SchoolAdmin.jsx (+16 -10)
     20  import SchoolAuditLog from '@/components/school/SchoolAuditLog';
     21 -import SchoolPayouts from '@/components/school/SchoolPayouts';
     22 -import ContentProtectionSettings from '@/components/admin/ContentProtectionSettings';
     23 -import TerminologySettings from '@/components/school/TerminologySettings';
     21 +import SchoolPayouts from '@/components/school/SchoolPayouts';
     22 +import ContentProtectionSettings from '@/components/admin/ContentProtectionSettings';
     23 +import TerminologySettings from '@/components/school/TerminologySettings';
     24 +import SchoolAuthSettings from '@/components/school/SchoolAuthSettings';
     25
        ⋮
    233            <TabsTrigger value="audit">Audit</TabsTrigger>
    233 -          <TabsTrigger value="protection">Protection</TabsTrigger>
    234 -          <TabsTrigger value="terminology">Terms</TabsTrigger>
    235 -          <TabsTrigger value="settings">Settings</TabsTrigger>
    236 -        </TabsList>
    234 +          <TabsTrigger value="protection">Protection</TabsTrigger>
    235 +          <TabsTrigger value="terminology">Terms</TabsTrigger>
    236 +          <TabsTrigger value="auth">SSO</TabsTrigger>
    237 +          <TabsTrigger value="settings">Settings</TabsTrigger>
    238 +        </TabsList>
    239
        ⋮
    469
    468 -        <TabsContent value="terminology">
    469 -          <TerminologySettings school={school} user={user} onSave={loadSchoolData} />
    470 -        </TabsContent>
    470 +        <TabsContent value="terminology">
    471 +          <TerminologySettings school={school} user={user} onSave={loadSchoolData} />
    472 +        </TabsContent>
    473 +
    474 +        <TabsContent value="auth">
    475 +          <SchoolAuthSettings schoolId={school.id} />
    476 +        </TabsContent>
    477

• Edited src/portals/public/pages/LoginChooser.jsx (+25 -21)
     1 -import React from 'react';
     2 -import { Link } from 'react-router-dom';
     3 -import { Button } from '@/components/ui/button';
     4 -
     5 -export default function LoginChooser() {
     6 -  return (
     7 -    <div className="mx-auto max-w-3xl px-4 py-16">
     8 -      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
     9 -      <p className="mt-2 text-slate-600">
    10 -        Choose the portal you want to enter.
     1 +import React from 'react';
     2 +import { Link, useSearchParams } from 'react-router-dom';
     3 +import { Button } from '@/components/ui/button';
     4 +
     5 +export default function LoginChooser() {
     6 +  const [params] = useSearchParams();
     7 +  const schoolSlug = params.get('schoolSlug') || params.get('school_slug') || '';
     8 +  const suffix = schoolSlug ? `?schoolSlug=${encodeURIComponent(schoolSlug)}` : '';
     9 +
    10 +  return (
    11 +    <div className="mx-auto max-w-3xl px-4 py-16">
    12 +      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
    13 +      <p className="mt-2 text-slate-600">
    14 +        Choose the portal you want to enter.
    15        </p>
       ⋮
    18          <div className="rounded-xl border border-slate-200 p-6">
    15 -          <h2 className="text-xl font-medium">Student</h2>
    16 -          <p className="mt-2 text-sm text-slate-600">
    17 -            Access your courses, lessons, and quizzes.
    18 -          </p>
    19 -          <Button asChild className="mt-4 w-full">
    20 -            <Link to="/login/student">Continue as student</Link>
    21 -          </Button>
    22 -        </div>
    23 -
    19 +          <h2 className="text-xl font-medium">Student</h2>
    20 +          <p className="mt-2 text-sm text-slate-600">
    21 +            Access your courses, lessons, and quizzes.
    22 +          </p>
    23 +          <Button asChild className="mt-4 w-full">
    24 +            <Link to={`/login/student${suffix}`}>Continue as student</Link>
    25 +          </Button>
    28          <div className="rounded-xl border border-slate-200 p-6">
       ⋮
    33            <Button asChild variant="outline" className="mt-4 w-full">
    30 -            <Link to="/login/teacher">Continue as teacher</Link>
    34 +            <Link to={`/login/teacher${suffix}`}>Continue as teacher</Link>
    43            <Button asChild variant="outline" className="mt-4 w-full">
    40 -            <Link to="/login/admin">Continue as admin</Link>
    44 +            <Link to={`/login/admin${suffix}`}>Continue as admin</Link>
    45            </Button>

• I'm reviewing various potential updates around signup, login, and SSO flows, confirming which changes are necessary or
  already done. I’m making sure schoolSlug handling, policy checks, and token usage are consistent while marking Step1
  and Step2 as completed and Step3 as in progress before updating the plan.

• Updated Plan
  └ ✔ Add auth entities and server-side session + OIDC scaffolding (AuthSession/AuthState/IdentityLink, _auth.js, auth
      endpoints).
    ✔ Expose school-level auth policy configuration and wire it into login UX (admin settings + public login buttons).
    □ Update client auth flows + guards to consume new session tokens and enforce school policy; document changes.

• Ran Get-Content -Raw docs\v11\V11_DOMAIN_MODEL.md
  └ # V11 Domain Model (Tenant First)

    … +67 lines
    - Public surfaces must filter to is_public schools and avoid fetching locked content.


• Ran Get-Content -Raw README.md
  └ # Breslov Academy LMS

    … +86 lines
    *   **Rules of Hooks:** No conditional hooks; use `SkeletonLoaders` for waiting states.


• There is a clear plan to enhance the README with new OIDC environment variables for authentication and update
  instructions about production auth flows. I’m also preparing to patch the domain model docs to include key new
  concepts like AuthSession, AuthState, and SchoolAuthPolicy in relevant sections to keep everything aligned and clear.

• Edited docs/v11/V11_DOMAIN_MODEL.md (+3 -0)
    13  - IdentityLink: id, user_id, provider (google_oidc, microsoft_oidc, magic_link), external_id
    14 +- AuthSession (global): id, user_email, provider, expires_at, revoked_at
    15 +- AuthState (global): id, provider, code_verifier, expires_at, used_at
    16  - SchoolMembership (school scoped): id, school_id, user_email, role, title_label
    17  - UserSchoolPreference (global): id, user_email, active_school_id
    18 +- SchoolAuthPolicy (school scoped): allowed_providers, allowed_domains, require_domain_match, auto_provision
    19

• Edited README.md (+15 -0)
    75  - `AUTH_LOGOUT_URL`: External auth logout URL.
    76 +- `AUTH_SESSION_TTL_HOURS`: Session lifetime in hours (default: 12).
    77  - `CORS_ORIGIN`: Allowed origin for API responses.
    78  - `REQUIRE_AUTH`: Set to `true` to enforce auth in public settings responses.
    79 +- `OIDC_ALLOW_ALL`: Allow SSO without a per-school policy (default: false).
    80 +
    81 +### Optional environment variables (OIDC)
    82 +- `GOOGLE_OIDC_CLIENT_ID`: Google Workspace OAuth client ID.
    83 +- `GOOGLE_OIDC_CLIENT_SECRET`: Google Workspace OAuth client secret.
    84 +- `GOOGLE_OIDC_REDIRECT_URI`: Override callback URL (defaults to `/api/auth/oidc/callback`).
    85 +- `GOOGLE_OIDC_SCOPES`: Override scopes (defaults to `openid email profile`).
    86 +- `GOOGLE_OIDC_PROMPT`: Override prompt parameter (defaults to `select_account`).
    87 +- `MICROSOFT_OIDC_CLIENT_ID`: Microsoft 365 OAuth client ID.
    88 +- `MICROSOFT_OIDC_CLIENT_SECRET`: Microsoft 365 OAuth client secret.
    89 +- `MICROSOFT_OIDC_TENANT`: Azure tenant (defaults to `common`).
    90 +- `MICROSOFT_OIDC_REDIRECT_URI`: Override callback URL (defaults to `/api/auth/oidc/callback`).
    91 +- `MICROSOFT_OIDC_SCOPES`: Override scopes (defaults to `openid email profile`).
    92 +- `MICROSOFT_OIDC_PROMPT`: Override prompt parameter (defaults to `select_account`).
    93

• Edited src/portals/public/pages/LoginStudent.jsx (+3 -4)
    54        )}
    55 -      <div className="mt-8 flex gap-3">
    56 -        <Button onClick={handle}>Continue to sign in</Button>
    57 -        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    58 -      </div>
    55        <div className="mt-8">
       ⋮
    63        </div>
    64 +      <div className="mt-6">
    65 +        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    66 +      </div>
    67        <p className="mt-8 text-xs text-muted-foreground">

• Edited src/portals/public/pages/LoginTeacher.jsx (+3 -4)
    54        )}
    55 -      <div className="mt-8 flex gap-3">
    56 -        <Button onClick={handle}>Continue to sign in</Button>
    57 -        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    58 -      </div>
    55        <div className="mt-8">
       ⋮
    63        </div>
    64 +      <div className="mt-6">
    65 +        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    66 +      </div>
    67        <p className="mt-8 text-xs text-muted-foreground">

• Edited src/portals/public/pages/LoginAdmin.jsx (+3 -4)
    54        )}
    55 -      <div className="mt-8 flex gap-3">
    56 -        <Button onClick={handle}>Continue to sign in</Button>
    57 -        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    58 -      </div>
    55        <div className="mt-8">
       ⋮
    63        </div>
    64 +      <div className="mt-6">
    65 +        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
    66 +      </div>
    67        <p className="mt-8 text-xs text-muted-foreground">

• Edited src/components/school/SchoolAuthSettings.jsx (+2 -2)
    38      ssoEnabled: false,
    39 -    allowedProviders: ['google'],
    39 +    allowedProviders: PROVIDERS.map((provider) => provider.id),
    40      allowedDomains: '',
       ⋮
    68          ? policy.allowed_providers
    69 -        : ['google'],
    69 +        : PROVIDERS.map((provider) => provider.id),
    70        allowedDomains: formatDomains(policy.allowed_domains),

• I’m working through a series of authentication-related improvements: ensuring AuthProviderButtons handles nextPath
  with queries properly, updating provider configuration and policy handling, refining school-scoped auth settings, and
  tightening security for sensitive entities like AuthSession and DownloadToken. I’m also enhancing login pages and
  AuthProviderButtons to accept a fallback schoolId from URL or localStorage, enabling SSO without explicit school slug
  when possible. This involves thoughtful balancing between security, usability, and the current limitations of role
  enforcement across APIs. This is quite a layered set of updates touching front-end components, API endpoints, and
  security configurations!

• Edited src/portals/public/components/AuthProviderButtons.jsx (+14 -4)
    28
    29 -export default function AuthProviderButtons({ audience, schoolSlug, nextPath, onFallback, fallbackLabel }) {
    29 +export default function AuthProviderButtons({ audience, schoolSlug, schoolId, nextPath, onFallback, fallbackLabe
        l }) {
    30 +  const storedSchoolId = useMemo(() => {
    31 +    try {
    32 +      return localStorage.getItem('active_school_id') || '';
    33 +    } catch {
    34 +      return '';
    35 +    }
    36 +  }, []);
    37 +
    38 +  const resolvedSchoolId = schoolId || storedSchoolId || '';
    39 +
    40    const { data, isLoading } = useQuery({
    31 -    queryKey: ['auth-providers', schoolSlug],
    41 +    queryKey: ['auth-providers', schoolSlug, resolvedSchoolId],
    42      queryFn: () => base44.request('/auth/providers', {
    33 -      params: schoolSlug ? { schoolSlug } : undefined,
    43 +      params: schoolSlug ? { schoolSlug } : resolvedSchoolId ? { schoolId: resolvedSchoolId } : undefined,
    44      }),
       ⋮
    67                className="h-12 justify-between"
    58 -              onClick={() => window.location.assign(buildStartUrl(provider.id, audience, nextPath, schoolSlug))}
    68 +              onClick={() => window.location.assign(buildStartUrl(provider.id, audience, nextPath, schoolSlug ||
         resolvedSchoolId))}
    69              >

• Edited src/portals/public/components/AuthProviderButtons.jsx (+3 -2)
    18
    19 -function buildStartUrl(provider, audience, nextPath, schoolSlug) {
    19 +function buildStartUrl(provider, audience, nextPath, schoolSlug, schoolId) {
    20    const origin = window.location.origin;
       ⋮
    25    if (schoolSlug) target.searchParams.set('schoolSlug', schoolSlug);
    26 +  if (schoolId) target.searchParams.set('schoolId', schoolId);
    27    return target.toString();
       ⋮
    68                className="h-12 justify-between"
    68 -              onClick={() => window.location.assign(buildStartUrl(provider.id, audience, nextPath, schoolSlug ||
         resolvedSchoolId))}
    69 +              onClick={() => window.location.assign(buildStartUrl(provider.id, audience, nextPath, schoolSlug, r
        esolvedSchoolId))}
    70              >

• Edited src/portals/public/pages/LoginStudent.jsx (+2 -0)
    11    const schoolSlug = params.get('schoolSlug') || params.get('school_slug') || '';
    12 +  const schoolId = params.get('schoolId') || params.get('school_id') || '';
    13    const authError = params.get('authError');
       ⋮
    59            schoolSlug={schoolSlug}
    60 +          schoolId={schoolId}
    61            nextPath={nextPath}

• Edited src/portals/public/pages/LoginTeacher.jsx (+2 -0)
    11    const schoolSlug = params.get('schoolSlug') || params.get('school_slug') || '';
    12 +  const schoolId = params.get('schoolId') || params.get('school_id') || '';
    13    const authError = params.get('authError');
       ⋮
    59            schoolSlug={schoolSlug}
    60 +          schoolId={schoolId}
    61            nextPath={nextPath}

• Edited src/portals/public/pages/LoginAdmin.jsx (+2 -0)
    11    const schoolSlug = params.get('schoolSlug') || params.get('school_slug') || '';
    12 +  const schoolId = params.get('schoolId') || params.get('school_id') || '';
    13    const authError = params.get('authError');
       ⋮
    59            schoolSlug={schoolSlug}

• Edited src/components/school/SchoolAuthSettings.jsx (+4 -3)
    161                const checked = form.allowedProviders.includes(provider.id);
    162 -              const configured = configuredProviders[provider.id] !== false;
    162 +              const hasConfig = Object.prototype.hasOwnProperty.call(configuredProviders, provider.id);
    163 +              const configured = hasConfig ? configuredProviders[provider.id] : null;
    164                return (
        ⋮
    173                    <span>{provider.label}</span>
    173 -                  <Badge variant={configured ? 'secondary' : 'outline'}>
    174 -                    {configured ? 'Configured' : 'Missing credentials'}
    174 +                  <Badge variant={configured === false ? 'outline' : 'secondary'}>
    175 +                    {configured === false ? 'Missing credentials' : configured === true ? 'Configured' : 'Unkno
         wn'}
    176                    </Badge>

• Updated Plan
  └ ✔ Add auth entities and server-side session + OIDC scaffolding (AuthSession/AuthState/IdentityLink, _auth.js, auth
      endpoints).
    ✔ Expose school-level auth policy configuration and wire it into login UX (admin settings + public login buttons).
    ✔ Update client auth flows + guards to consume new session tokens and enforce school policy; document changes.

• Ran git status -sb
  └ ## main
     M README.md
    … +152 lines
    ?? src/portals/public/components/AuthProviderButtons.jsx
    ?? src/portals/public/pages/PublicSchools.jsx

• I'm wrapping up the overview of the SSO implementation with OIDC flows, server-side sessions, and school-level UI,
  referencing all relevant file paths and documentation consulted, noting missing AGENTS.md, no tests run, and proposing
  a clear, concise list of prioritized next steps and residual risks as requested.

─ Worked for 33m 01s ───────────────────────────────────────────────────────────────────────────────────────────────────

• Implemented the SSO foundation and wired it into the public/admin UX while staying within the GEMINI and Zero‑Friction
  policy constraints; server now issues real sessions, login flows preserve portal intent + school context, and admins
  can configure provider policy per school.

  - Server-side auth now persists AuthSession tokens and handles OIDC state/PKCE flows in functions/api/_auth.js,
    functions/api/auth/oidc/start.js, functions/api/auth/oidc/callback.js, with provider/policy helpers in functions/
    api/auth/oidc/_providers.js and functions/api/auth/oidc/_policy.js.
  - Public auth discovery endpoint added in functions/api/auth/providers.js, and sensitive entities are blocked without
    auth in functions/api/entities/[entity].js.
  - Login UX now shows provider buttons and preserves school slug/ID in src/portals/public/components/
    AuthProviderButtons.jsx, src/portals/public/pages/LoginStudent.jsx, src/portals/public/pages/LoginTeacher.jsx, src/
    portals/public/pages/LoginAdmin.jsx, and src/portals/public/pages/LoginChooser.jsx.
  - School context is passed through login from public entry points in src/portals/public/pages/PublicHome.jsx and src/

  Notes:

  - AGENTS.md is not present in the repo; I followed GEMINI.md, MASTER_PLAN_V11_FULL_SPEC.md, SECURITY_INVARIANTS.md,
    and docs/implementation/policies/ZERO_FRICTION_POLICY.md.
  Tests not run (not requested).

  Next steps I recommend (pick any order):

  1. Enforce server-side RBAC + tenant scoping in functions/api/entities/[entity].js with a public-entity allowlist to
     close remaining data exposure gaps.
  2. Add JWKS signature verification for OIDC id_token + nonce checks, and a cleanup job for expired AuthState/
     AuthSession.
  3. Implement DNS TXT domain verification and an SSO onboarding wizard (admin flow) to lock domain claims.
  4. Start Stripe Connect + Cloudflare Stream/R2 integrations to cover billing and secure media delivery.


• Ran Get-ChildItem -Path functions\api\entities -Recurse -File | Select-Object FullName
  └
    FullName
    … +2 lines
    C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\functions\api\entities\[entity]\[id].js


• Ran Get-Content -Raw -LiteralPath "functions\api\entities\[entity]\[id].js"
  └ import { errorResponse, handleOptions, json, readJson } from '../../_utils.js';
    }


• I'm laying out a plan to enforce security on school-scoped entities by checking authorization tokens and user roles on
  the server. I'll handle public versus authenticated access carefully, allowing unauthenticated reads only for certain

• Ran rg -n "base44\.entities|scopedFilter" src\portals src\pages\SchoolLanding.jsx src\pages\SchoolCourses.jsx
  │ src\pages\SchoolPricing.jsx src\pages\CourseSales.jsx src\pages\SchoolThankYou.jsx
  └ src\pages\SchoolLanding.jsx:7:import { scopedFilter } from '@/components/api/scoped';
    src\pages\SchoolLanding.jsx:77:      const schools = await base44.entities.School.filter({ slug }, null, 1,
    base44.entities.School.filter({ is_public: true }, 'name', 200, { fields: SCHOOL_FIELDS });

• I'm analyzing how the server should allow unauthenticated access for public school data and related entities while
  enforcing filters like is_published or is_public to prevent data leaks. I'm especially concerned about the
  SchoolThankYou page exposing Transactions without auth, so restricting that seems necessary even if it breaks current
  flows. This means updating front-end pages like CourseSales to send proper filters so unauth access can be safely
  granted where appropriate. I'll explore the CourseSales page next to verify needed filter enforcement.

• Ran Get-Content -Raw src\pages\CourseSales.jsx
  └ import React, { useState, useEffect } from 'react';
    import { base44 } from '@/api/base44Client';


• Ran Get-Content -Raw src\pages\SchoolCourses.jsx
  └ import React, { useState, useEffect } from 'react';
    import { base44 } from '@/api/base44Client';


• Ran Get-Content -Raw src\pages\SchoolPricing.jsx
  └ import React, { useState, useEffect } from 'react';
    import { base44 } from '@/api/base44Client';
    … +311 lines

• I'm mapping out how to tighten server-side filtering for unauthenticated users, ensuring only active or public
  entities are accessible. This involves setting required filters like is_active or is_public server-side, restricting
  read fields, enforcing auth for mutations, and allowing safe public creation where needed, especially for entities
  like TenantApplication during signup. It's a balancing act between security and usability, making me curious about the
  safest yet flexible approach for public data access!

    import { Button } from '@/components/ui/button';
    … +152 lines
    }



• I'm mapping out a robust server enforcement plan for tenant isolation, carefully defining school-scoped and global
  entities, handling public read permissions, and enforcing membership and admin checks. This includes nuanced rules for
  entity creation and updates, special cases like invites and memberships, and fallback approaches for unknown scopes to
  maintain secure multi-tenant boundaries.
  └ src\pages\Mentorship.jsx:28:    queryFn: () => base44.entities.User.filter({ role: 'admin' })

• I'm outlining the design for a server guard to manage entity access based on user authentication and school scoping.
  I'll create new API utilities to handle entity scopes, public read filters, and write permissions, then adjust entity
  handlers to enforce auth and filter conditions accordingly, especially for GET requests without tokens and ensuring
  school_id matches for scoped entities. I'm also considering special cases like SchoolMembership queries and global
  admin overrides while noting potential complexities around membership checks and front-end tenancy enforcement.

• Ran Get-Content -Raw src\components\api\tenancyEnforcer.js
  └ /**
    }


• Ran rg -n "lesson\.content|content_text|lesson\.materials|lesson\.file_url|lesson\.video" src
  └ src\components\learning\PremiumVideoPlayer.jsx:165:        src={lesson.video_url}
    src\components\utils\SECURITY_CONTRACT.md:15:- **NEVER** search lesson.content or text bodies for unentitled users
    … +10 lines
    src\pages\TeachLesson.jsx:165:                <Input name="video_url" defaultValue={lesson.video_url}
    placeholder="https://youtube.com/..." />

• Ran Get-Content -Raw src\portals\public\pages\PublicSchools.jsx
  └ import React, { useMemo, useState } from 'react';
    import { useQuery } from '@tanstack/react-query';
    … +119 lines
    }


• There's a lot to configure here, so I'm mapping out how to define public read rules with filters and safe fields per
  entity, then enforce them both on unauthenticated and authenticated requests. I'll build reusable helpers for applying
  rules, checking school public status, and handling membership or admin privileges, aiming for secure, consistent
  access controls across the API.

• Ran Get-Content -Raw src\pages\SchoolSelect.jsx
  └ import React, { useEffect, useState } from 'react';
    import { base44 } from '@/api/base44Client';
    … +121 lines
    }


• I'm mapping out detailed access rules for the School entity and related cases like membership, invites, and public
  access. The plan involves fetching and authorizing school records based on filters, user role, and membership status,
  including special handling for invite tokens and unauthenticated requests where appropriate. I'll implement helpers
  and tenancy logic to enforce these nuanced rules while keeping complexity manageable.

• Added functions/api/_tenancy.js (+197 -0)
      1 +import { listEntities } from './_store.js';
      2 +
      3 +export const SCHOOL_SCOPED_ENTITIES = [
      4 +  'Course', 'Lesson', 'Post', 'Comment', 'UserProgress',
      5 +  'Offer', 'Coupon', 'Transaction', 'Entitlement', 'Purchase', 'OfferCourse', 'CouponRedemption',
      6 +  'StudySet', 'StudyCard', 'LanguageVariant', 'SpacedRepetitionItem',
      7 +  'Cohort', 'CohortMember', 'CohortScheduleItem',
      8 +  'SchoolMembership', 'CourseStaff', 'SchoolInvite', 'StaffInvite', 'ContentProtectionPolicy',
      9 +  'Testimonial', 'InstructorPayout', 'AuditLog', 'EventLog',
     10 +  'Announcement', 'UserAnnouncementRead', 'Affiliate', 'Referral',
     11 +  'AiTutorSession', 'AiTutorPolicyLog', 'RateLimitLog',
     12 +  'Bookmark', 'LessonNote', 'Highlight', 'Transcript',
     13 +  'Text', 'CourseReview', 'Discussion', 'ContentReport',
     14 +  'ModerationAction', 'SchoolMetricDaily', 'CourseMetricDaily',
     15 +  'Assignment', 'Submission', 'Quiz', 'QuizAttempt',
     16 +  'QuizQuestion',
     17 +  'Download', 'Bundle', 'SubscriptionPlan', 'Subscription', 'PayoutBatch',
     18 +  'AnalyticsEvent', 'SubscriptionInvoice', 'Certificate', 'StudySession',
     19 +  'Achievement', 'AdaptiveLearning', 'Alumni', 'Analytics', 'CareerPath', 'Challenge',
     20 +  'ContentModeration', 'Event', 'FeatureFlag', 'Forum', 'Habit', 'Leaderboard',
     21 +  'LearningInsight', 'LearningPath', 'LiveClass', 'LiveStream', 'Mentorship', 'Message',
     22 +  'Microlesson', 'Portfolio', 'PowerUp', 'Recommendation', 'Reward', 'Scholarship',
     23 +  'SchoolSetting', 'SkillAssessment', 'SkillGap', 'StudyBuddy', 'StudyGroup',
     24 +  'StudySchedule', 'Tournament', 'UserPowerUp', 'VideoAnnotation', 'WellnessCheck',
     25 +  'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy'
     26 +];
     27 +
     28 +export const GLOBAL_ENTITIES = [
     29 +  'User', 'School', 'GoogleOAuthToken', 'GoogleDriveToken',
     30 +  'Notification', 'Integration', 'UserSchoolPreference',
     31 +  'TenantApplication', 'AuthSession', 'AuthState', 'IdentityLink'
     32 +];
     33 +
     34 +const PUBLIC_READ_RULES = {
     35 +  School: {
     36 +    enforce: { is_public: true },
     37 +    fields: ['id', 'name', 'slug', 'logo_url', 'hero_image_url', 'tagline', 'description', 'brand_primary', 'st
         atus', 'is_public'],
     38 +    requiresSchoolId: false,
     39 +  },
     40 +  Course: {
     41 +    enforce: { is_published: true },
     42 +    fields: ['id', 'title', 'title_hebrew', 'subtitle', 'description', 'category', 'level', 'access_level', 'ac
         cess_tier', 'cover_image_url', 'thumbnail_url', 'instructor', 'duration_hours', 'outcomes', 'is_published'],
     43 +    requiresSchoolId: true,
     44 +  },
     45 +  Lesson: {
     46 +    enforce: {},
     47 +    fields: ['id', 'course_id', 'title', 'title_hebrew', 'order', 'is_preview', 'status'],
     48 +    requiresSchoolId: true,
     49 +    previewChars: 500,
     50 +  },
     51 +  Offer: {
     52 +    enforce: { is_active: true },
     53 +    fields: ['id', 'name', 'description', 'offer_type', 'price_cents', 'billing_interval', 'access_scope', 'is_
         active', 'courses'],
     54 +    requiresSchoolId: true,
     55 +  },
     56 +  Coupon: {
     57 +    enforce: { is_active: true },
     58 +    fields: ['id', 'code', 'discount_type', 'discount_value', 'usage_limit', 'usage_count', 'expires_at', 'is_a
         ctive'],
     59 +    requiresSchoolId: true,
     60 +  },
     61 +  Testimonial: {
     62 +    enforce: {},
     63 +    fields: ['id', 'name', 'role', 'quote', 'rating', 'avatar_url'],
     64 +    requiresSchoolId: true,
     65 +  },
     66 +  CourseReview: {
     67 +    enforce: {},
     68 +    fields: ['id', 'user_name', 'user_email', 'rating', 'body', 'created_date'],
     69 +    requiresSchoolId: true,
     70 +  },
     71 +};
     72 +
     73 +const PUBLIC_TOKEN_LOOKUP_ENTITIES = new Set(['SchoolInvite', 'StaffInvite']);
     74 +const SELF_SCOPED_ENTITIES = new Set(['SchoolMembership', 'UserSchoolPreference']);
     75 +const PUBLIC_WRITE_ENTITIES = new Set(['TenantApplication']);
     76 +
     77 +export function requiresSchoolScope(entityName) {
     78 +  if (SCHOOL_SCOPED_ENTITIES.includes(entityName)) return true;
     79 +  if (GLOBAL_ENTITIES.includes(entityName)) return false;
     80 +  return true;
     81 +}
     82 +
     83 +export function isGlobalEntity(entityName) {
     84 +  return GLOBAL_ENTITIES.includes(entityName);
     85 +}
     86 +
     87 +export function getPublicRule(entityName) {
     88 +  return PUBLIC_READ_RULES[entityName] || null;
     89 +}
     90 +
     91 +export function isPublicTokenLookup(entityName, filters) {
     92 +  if (!PUBLIC_TOKEN_LOOKUP_ENTITIES.has(entityName)) return false;
     93 +  const token = typeof filters?.token === 'string' ? filters.token.trim() : '';
     94 +  return token.length >= 16;
     95 +}
     96 +
     97 +export function normalizeFilters(filters) {
     98 +  if (!filters || typeof filters !== 'object') return {};
     99 +  return { ...filters };
    100 +}
    101 +
    102 +export function applyPublicRule(entityName, filters) {
    103 +  const rule = getPublicRule(entityName);
    104 +  if (!rule) return null;
    105 +  const next = normalizeFilters(filters);
    106 +  const enforce = rule.enforce || {};
    107 +  Object.entries(enforce).forEach(([key, value]) => {
    108 +    next[key] = value;
    109 +  });
    110 +  return next;
    111 +}
    112 +
    113 +export function sanitizePublicFields(entityName, requestedFields) {
    114 +  const rule = getPublicRule(entityName);
    115 +  if (!rule?.fields) return requestedFields || null;
    116 +  if (!requestedFields || requestedFields.length === 0) return rule.fields;
    117 +  const allow = new Set(rule.fields);
    118 +  return requestedFields.filter((field) => allow.has(field));
    119 +}
    120 +
    121 +export function sanitizePublicPreviewChars(entityName, requestedPreviewChars) {
    122 +  const rule = getPublicRule(entityName);
    123 +  if (!rule?.previewChars) return requestedPreviewChars;
    124 +  const requested = Number(requestedPreviewChars);
    125 +  if (!Number.isFinite(requested) || requested <= 0) return rule.previewChars;
    126 +  return Math.min(requested, rule.previewChars);
    127 +}
    128 +
    129 +export function isSelfScoped(entityName, filters, userEmail) {
    130 +  if (!SELF_SCOPED_ENTITIES.has(entityName)) return false;
    131 +  if (!filters?.user_email) return false;
    132 +  if (!userEmail) return false;
    133 +  return String(filters.user_email).toLowerCase() === String(userEmail).toLowerCase();
    134 +}
    135 +
    136 +export function canWriteUnauth(entityName, method) {
    137 +  return method === 'POST' && PUBLIC_WRITE_ENTITIES.has(entityName);
    138 +}
    139 +
    140 +export function isGlobalAdmin(user, env) {
    141 +  if (!user) return false;
    142 +  if (user.id === 'dev-user') return true;
    143 +  const role = String(user.role || '').toLowerCase();
    144 +  if (['superadmin', 'platform_admin', 'global_admin'].includes(role)) return true;
    145 +  if (env?.GLOBAL_ADMIN_ROLE && role === String(env.GLOBAL_ADMIN_ROLE).toLowerCase()) return true;
    146 +  const list = String(env?.GLOBAL_ADMIN_EMAILS || '')
    147 +    .split(',')
    148 +    .map((value) => value.trim().toLowerCase())
    149 +    .filter(Boolean);
    150 +  if (list.length && user.email) {
    151 +    return list.includes(String(user.email).toLowerCase());
    152 +  }
    153 +  return false;
    154 +}
    155 +
    156 +export async function isSchoolPublic(env, schoolId) {
    157 +  if (!schoolId) return false;
    158 +  const rows = await listEntities(env, 'School', { filters: { id: String(schoolId) }, limit: 1 });
    159 +  const school = rows?.[0];
    160 +  return Boolean(school?.is_public);
    161 +}
    162 +
    163 +export async function hasMembership(env, schoolId, userEmail) {
    164 +  if (!schoolId || !userEmail) return false;
    165 +  const rows = await listEntities(env, 'SchoolMembership', {
    166 +    filters: { school_id: String(schoolId), user_email: String(userEmail) },
    167 +    limit: 1,
    168 +  });
    169 +  return Boolean(rows?.[0]);
    170 +}
    171 +
    172 +export async function findSchoolByFilter(env, filters) {
    173 +  if (!filters) return null;
    174 +  if (filters.id) {
    175 +    const rows = await listEntities(env, 'School', { filters: { id: String(filters.id) }, limit: 1 });
    176 +    return rows?.[0] || null;
    177 +  }
    178 +  if (filters.slug) {
    179 +    const rows = await listEntities(env, 'School', { filters: { slug: String(filters.slug) }, limit: 1 });
    180 +    return rows?.[0] || null;
    183 +}
    184 +
    185 +export async function hasInviteForUser(env, schoolId, userEmail) {
    186 +  if (!schoolId || !userEmail) return false;
    187 +  const invites = await listEntities(env, 'SchoolInvite', {
    188 +    filters: { school_id: String(schoolId), email: String(userEmail) },
    189 +    limit: 25,
    190 +  });
    191 +  const now = new Date();
    192 +  return (invites || []).some((invite) => {
    193 +    if (invite.accepted_at) return false;
    194 +    if (invite.expires_at && new Date(invite.expires_at) <= now) return false;
    195 +    return true;
    196 +  });
    197 +}

• I’m carefully planning to update the entity API to protect sensitive data using _tenancy checks. This involves getting
  user info from tokens, applying public access rules, and enforcing school-scoped access. I also intend to handle the
  "School" entity separately with membership and public visibility checks, while considering global admin and scoped
  permissions for other entities. I'll integrate _tenancy utilities and rethink filtering and authorization logic
  accordingly.

• Ran rg -n "entities\.Integration|entities\.Notification|entities\.TenantApplication" src
  └ src\components\notifications\NotificationCenter.jsx:20:    queryFn: () =>
    base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 20),
    … +7 lines
    src\pages\NetworkAdmin.jsx:68:    queryFn: () => base44.entities.TenantApplication.list('-created_date', 100),
    src\pages\NetworkAdmin.jsx:99:      await base44.entities.TenantApplication.update(app.id, {

• Edited functions/api/_tenancy.js (+8 -0)
     74  const SELF_SCOPED_ENTITIES = new Set(['SchoolMembership', 'UserSchoolPreference']);
     75 +const USER_SCOPED_GLOBAL_ENTITIES = new Set(['UserSchoolPreference', 'Notification', 'User']);
     76  const PUBLIC_WRITE_ENTITIES = new Set(['TenantApplication']);
        ⋮
    136
    137 +export function isUserScopedGlobal(entityName, filters, userEmail) {
    138 +  if (!USER_SCOPED_GLOBAL_ENTITIES.has(entityName)) return false;
    139 +  if (!filters?.user_email) return false;
    140 +  if (!userEmail) return false;
    141 +  return String(filters.user_email).toLowerCase() === String(userEmail).toLowerCase();
    142 +}
    143 +
    144  export function canWriteUnauth(entityName, method) {

• I’m preparing a comprehensive patch for [entity].js that revises request handling with fine-grained auth and
  membership logic. I’ll carefully handle unauthenticated access, school scoping, global entities, and public rules
  while reusing helper functions for normalization and sanitization. This involves strong control over create and read
  paths, distinguishing between global admin, self-scoped users, members, and public access according to entity type and
  context. Implementing this will require careful layering of filters, permissions, and error returns to keep data safe
  and ensure correct behavior in complex tenancy scenarios.

• Edited functions/api/entities/[entity].js (+156 -14)
      3  import { getUserFromToken } from '../_auth.js';
      4 -
      5 -const SENSITIVE_ENTITIES = new Set(['AuthSession', 'AuthState', 'IdentityLink']);
      6 -
      7 -async function enforceSensitiveAccess(entity, request, env) {
      8 -  if (!SENSITIVE_ENTITIES.has(entity)) return null;
      9 -  const token = getBearerToken(request);
     10 -  const user = await getUserFromToken(token, env);
     11 -  if (!user) {
     12 -    return errorResponse('auth_required', 401, 'Authentication required', env);
     13 -  }
     14 -  return null;
     15 -}
      4 +import {
      5 +  applyPublicRule,
      6 +  canWriteUnauth,
      7 +  findSchoolByFilter,
      8 +  getPublicRule,
      9 +  hasInviteForUser,
     10 +  hasMembership,
     11 +  isGlobalAdmin,
     12 +  isGlobalEntity,
     13 +  isPublicTokenLookup,
     14 +  isSchoolPublic,
     15 +  isSelfScoped,
     16 +  isUserScopedGlobal,
     17 +  requiresSchoolScope,
     18 +  sanitizePublicFields,
     19 +  sanitizePublicPreviewChars,
     20 +} from '../_tenancy.js';
     21
        ⋮
     46    }
     42 -  const guard = await enforceSensitiveAccess(entity, request, env);
     43 -  if (guard) return guard;
     47 +  const token = getBearerToken(request);
     48 +  const user = await getUserFromToken(token, env);
     49 +  const isAuthenticated = Boolean(user?.email);
     50 +  const globalAdmin = isGlobalAdmin(user, env);
     51
        ⋮
     59      const previewChars = normalizePreviewChars(url.searchParams.get('previewChars'));
     60 +    const publicRule = getPublicRule(entity);
     61 +    const publicFilters = publicRule ? applyPublicRule(entity, filters) : null;
     62 +
     63 +    if (!isAuthenticated) {
     64 +      if (isPublicTokenLookup(entity, filters)) {
     65 +        try {
     66 +          const rows = await listEntities(env, entity, { filters, sort, limit, fields, previewChars });
     67 +          return json(rows, { env });
     68 +        } catch (err) {
     69 +          return errorResponse('storage_unavailable', 503, err.message, env);
     70 +        }
     71 +      }
     72 +      if (!publicRule || !publicFilters) {
     73 +        return errorResponse('auth_required', 401, 'Authentication required', env);
     74 +      }
     75 +      if (publicRule.requiresSchoolId && !publicFilters.school_id) {
     76 +        return errorResponse('missing_school', 400, 'school_id is required', env);
     77 +      }
     78 +      if (requiresSchoolScope(entity) && publicRule.requiresSchoolId) {
     79 +        const schoolOk = await isSchoolPublic(env, publicFilters.school_id);
     80 +        if (!schoolOk) {
     81 +          return errorResponse('forbidden', 403, 'School is not public', env);
     82 +        }
     83 +      }
     84 +      const safeFields = sanitizePublicFields(entity, fields);
     85 +      const safePreview = sanitizePublicPreviewChars(entity, previewChars);
     86 +      try {
     87 +        const rows = await listEntities(env, entity, { filters: publicFilters, sort, limit, fields: safeFields,
          previewChars: safePreview });
     88 +        return json(rows, { env });
     89 +      } catch (err) {
     90 +        return errorResponse('storage_unavailable', 503, err.message, env);
     91 +      }
     92 +    }
     93 +
     94 +    if (entity === 'School') {
     95 +      if (globalAdmin) {
     96 +        try {
     97 +          const rows = await listEntities(env, entity, { filters, sort, limit, fields, previewChars });
     98 +          return json(rows, { env });
     99 +        } catch (err) {
    100 +          return errorResponse('storage_unavailable', 503, err.message, env);
    101 +        }
    102 +      }
    103 +
    104 +      if (filters?.is_public === true) {
    105 +        const safeFields = sanitizePublicFields(entity, fields);
    106 +        try {
    107 +          const rows = await listEntities(env, entity, { filters: publicFilters || filters, sort, limit, fields
         : safeFields, previewChars });
    108 +          return json(rows, { env });
    109 +        } catch (err) {
    110 +          return errorResponse('storage_unavailable', 503, err.message, env);
    111 +        }
    112 +      }
    113 +
    114 +      const school = await findSchoolByFilter(env, filters);
    115 +      if (!school) {
    116 +        return json([], { env });
    117 +      }
    118 +
    119 +      const isMember = await hasMembership(env, school.id, user.email);
    120 +      if (isMember) {
    121 +        return json([school], { env });
    122 +      }
    123
    124 +      if (school.is_public) {
    125 +        const safeFields = sanitizePublicFields(entity, fields);
    126 +        return json([school].map((row) => {
    127 +          if (!safeFields || safeFields.length === 0) return row;
    128 +          const allow = new Set(safeFields.concat(['id']));
    129 +          const out = {};
    130 +          Object.entries(row).forEach(([key, value]) => {
    131 +            if (allow.has(key)) out[key] = value;
    132 +          });
    133 +          return out;
    134 +        }), { env });
    135 +      }
    136 +
    137 +      return errorResponse('forbidden', 403, 'Not authorized to access this school', env);
    138 +    }
    139 +
    140 +    if (requiresSchoolScope(entity)) {
    141 +      const schoolId = filters?.school_id ? String(filters.school_id) : null;
    142 +      const selfScoped = isSelfScoped(entity, filters, user.email);
    143 +
    144 +      if (!schoolId && !selfScoped) {
    145 +        return errorResponse('missing_school', 400, 'school_id is required', env);
    146 +      }
    147 +
    148 +      if (schoolId && !globalAdmin) {
    149 +        const isMember = await hasMembership(env, schoolId, user.email);
    150 +        if (!isMember && publicRule && publicFilters) {
    151 +          const schoolOk = await isSchoolPublic(env, schoolId);
    152 +          if (!schoolOk) {
    153 +            return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    154 +          }
    155 +          const safeFields = sanitizePublicFields(entity, fields);
    156 +          const safePreview = sanitizePublicPreviewChars(entity, previewChars);
    157 +          try {
    158 +            const rows = await listEntities(env, entity, { filters: publicFilters, sort, limit, fields: safeFie
         lds, previewChars: safePreview });
    159 +            return json(rows, { env });
    160 +          } catch (err) {
    161 +            return errorResponse('storage_unavailable', 503, err.message, env);
    162 +          }
    163 +        }
    164 +        if (!isMember) {
    165 +          return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    166 +        }
    167 +      }
    168 +    } else if (isGlobalEntity(entity)) {
    169 +      if (!globalAdmin && !isUserScopedGlobal(entity, filters, user.email)) {
    170 +        return errorResponse('forbidden', 403, 'Not authorized', env);
    171 +      }
    172 +    }
    173 +
    174      try {
        ⋮
    186      }
    187 +    if (!isAuthenticated && !canWriteUnauth(entity, request.method)) {
    188 +      return errorResponse('auth_required', 401, 'Authentication required', env);
    189 +    }
    190 +    if (requiresSchoolScope(entity)) {
    191 +      const schoolId = payload.school_id ? String(payload.school_id) : null;
    192 +      if (!schoolId) {
    193 +        return errorResponse('missing_school', 400, 'school_id is required', env);
    194 +      }
    195 +      if (!globalAdmin) {
    196 +        const isMember = await hasMembership(env, schoolId, user.email);
    197 +        const invited = entity === 'SchoolMembership'
    198 +          ? await hasInviteForUser(env, schoolId, user.email)
    199 +          : false;
    200 +        if (!isMember && !invited) {
    201 +          return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    202 +        }
    203 +      }
    204 +    } else if (isGlobalEntity(entity) && !canWriteUnauth(entity, request.method)) {
    205 +      if (!globalAdmin && !isUserScopedGlobal(entity, payload, user.email)) {
    206 +        return errorResponse('forbidden', 403, 'Not authorized', env);
    207 +      }
    208 +    }
    209      try {

• Edited functions/api/entities/[entity]/[id].js (+153 -9)
      1 -import { errorResponse, handleOptions, json, readJson } from '../../_utils.js';
      1 +import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../../_utils.js';
      2  import { deleteEntity, listEntities, updateEntity } from '../../_store.js';
      3 +import { getUserFromToken } from '../../_auth.js';
      4 +import {
      5 +  getPublicRule,
      6 +  hasMembership,
      7 +  isGlobalAdmin,
      8 +  isGlobalEntity,
      9 +  isSchoolPublic,
     10 +  isUserScopedGlobal,
     11 +  requiresSchoolScope,
     12 +  sanitizePublicFields,
     13 +} from '../../_tenancy.js';
     14
        ⋮
     25
     26 +  const token = getBearerToken(request);
     27 +  const user = await getUserFromToken(token, env);
     28 +  const isAuthenticated = Boolean(user?.email);
     29 +  const globalAdmin = isGlobalAdmin(user, env);
     30 +
     31 +  let record = null;
     32 +  try {
     33 +    const rows = await listEntities(env, entity, { filters: { id }, limit: 1 });
     34 +    record = rows?.[0] || null;
     35 +  } catch (err) {
     36 +    return errorResponse('storage_unavailable', 503, err.message, env);
     37 +  }
     38 +
     39    if (request.method === 'GET') {
     16 -    try {
     17 -      const rows = await listEntities(env, entity, { filters: { id }, limit: 1 });
     18 -      const row = rows?.[0] || null;
     19 -      if (!row) {
     20 -        return errorResponse('not_found', 404, 'Entity not found', env);
     40 +    if (!record) {
     41 +      return errorResponse('not_found', 404, 'Entity not found', env);
     42 +    }
     43 +    const publicRule = getPublicRule(entity);
     44 +
     45 +    if (!isAuthenticated) {
     46 +      if (entity === 'School' && record.is_public) {
     47 +        const safeFields = sanitizePublicFields(entity, null);
     48 +        if (!safeFields || safeFields.length === 0) return json(record, { env });
     49 +        const allow = new Set(safeFields.concat(['id']));
     50 +        const out = {};
     51 +        Object.entries(record).forEach(([key, value]) => {
     52 +          if (allow.has(key)) out[key] = value;
     53 +        });
     54 +        return json(out, { env });
     55 +      }
     56 +      if (requiresSchoolScope(entity) && publicRule && record.school_id) {
     57 +        const schoolOk = await isSchoolPublic(env, record.school_id);
     58 +        if (schoolOk) {
     59 +          const safeFields = sanitizePublicFields(entity, null);
     60 +          if (!safeFields || safeFields.length === 0) return json(record, { env });
     61 +          const allow = new Set(safeFields.concat(['id']));
     62 +          const out = {};
     63 +          Object.entries(record).forEach(([key, value]) => {
     64 +            if (allow.has(key)) out[key] = value;
     65 +          });
     66 +          return json(out, { env });
     67 +        }
     68 +      }
     69 +      return errorResponse('auth_required', 401, 'Authentication required', env);
     70 +    }
     71 +
     72 +    if (entity === 'School') {
     73 +      if (globalAdmin) return json(record, { env });
     74 +      const isMember = await hasMembership(env, record.id, user.email);
     75 +      if (isMember) return json(record, { env });
     76 +      if (record.is_public) {
     77 +        const safeFields = sanitizePublicFields(entity, null);
     78 +        if (!safeFields || safeFields.length === 0) return json(record, { env });
     79 +        const allow = new Set(safeFields.concat(['id']));
     80 +        const out = {};
     81 +        Object.entries(record).forEach(([key, value]) => {
     82 +          if (allow.has(key)) out[key] = value;
     83 +        });
     84 +        return json(out, { env });
     85 +      }
     86 +      return errorResponse('forbidden', 403, 'Not authorized to access this school', env);
     87 +    }
     88 +
     89 +    if (requiresSchoolScope(entity)) {
     90 +      if (!record.school_id) {
     91 +        return errorResponse('forbidden', 403, 'Missing school scope', env);
     92 +      }
     93 +      if (!globalAdmin) {
     94 +        const isMember = await hasMembership(env, record.school_id, user.email);
     95 +        if (!isMember && publicRule) {
     96 +          const schoolOk = await isSchoolPublic(env, record.school_id);
     97 +          if (schoolOk) {
     98 +            const safeFields = sanitizePublicFields(entity, null);
     99 +            if (!safeFields || safeFields.length === 0) return json(record, { env });
    100 +            const allow = new Set(safeFields.concat(['id']));
    101 +            const out = {};
    102 +            Object.entries(record).forEach(([key, value]) => {
    103 +              if (allow.has(key)) out[key] = value;
    104 +            });
    105 +            return json(out, { env });
    106 +          }
    107 +        }
    108 +        if (!isMember) {
    109 +          return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    110 +        }
    111        }
     22 -      return json(row, { env });
     23 -    } catch (err) {
     24 -      return errorResponse('storage_unavailable', 503, err.message, env);
    112 +    } else if (isGlobalEntity(entity)) {
    113 +      if (!globalAdmin && !isUserScopedGlobal(entity, record, user.email)) {
    114 +        return errorResponse('forbidden', 403, 'Not authorized', env);
    115 +      }
    116      }
    117 +
    118 +    return json(record, { env });
    119    }
        ⋮
    125      }
    126 +    if (!isAuthenticated) {
    127 +      return errorResponse('auth_required', 401, 'Authentication required', env);
    128 +    }
    129 +    if (!record) {
    130 +      return errorResponse('not_found', 404, 'Entity not found', env);
    131 +    }
    132 +
    133 +    if (requiresSchoolScope(entity)) {
    134 +      const schoolId = record.school_id;
    135 +      if (!schoolId) {
    136 +        return errorResponse('forbidden', 403, 'Missing school scope', env);
    137 +      }
    138 +      if (!globalAdmin) {
    139 +        const isMember = await hasMembership(env, schoolId, user.email);
    140 +        const invitee = entity === 'SchoolInvite' && String(record.email || '').toLowerCase() === String(user.e
         mail || '').toLowerCase();
    141 +        if (!isMember && !invitee) {
    142 +          return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    143 +        }
    144 +      }
    145 +      if (!globalAdmin && Object.prototype.hasOwnProperty.call(payload || {}, 'school_id') && String(payload.sc
         hool_id) !== String(schoolId)) {
    146 +        return errorResponse('forbidden', 403, 'Cannot change school scope', env);
    147 +      }
    148 +    } else if (isGlobalEntity(entity)) {
    149 +      if (!globalAdmin && !isUserScopedGlobal(entity, record, user.email)) {
    150 +        return errorResponse('forbidden', 403, 'Not authorized', env);
    151 +      }
    152 +    }
    153 +
    154      try {
        ⋮
    165    if (request.method === 'DELETE') {
    166 +    if (!isAuthenticated) {
    169 +    if (!record) {
    170 +      return errorResponse('not_found', 404, 'Entity not found', env);
    171 +    }
    172 +    if (requiresSchoolScope(entity)) {
    173 +      const schoolId = record.school_id;
    174 +      if (!schoolId) {
    175 +        return errorResponse('forbidden', 403, 'Missing school scope', env);
    176 +      }
    177 +      if (!globalAdmin) {
    178 +        const isMember = await hasMembership(env, schoolId, user.email);
    179 +        if (!isMember) {
    180 +          return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    181 +        }
    182 +      }
    183 +    } else if (isGlobalEntity(entity)) {
    184 +      if (!globalAdmin && !isUserScopedGlobal(entity, record, user.email)) {
    185 +        return errorResponse('forbidden', 403, 'Not authorized', env);
    186 +      }
    187 +    }
    188 +
    189      try {

• Ran Get-Content -Raw src\pages\SchoolThankYou.jsx
  └ import React, { useState, useEffect } from 'react';
    import { base44 } from '@/api/base44Client';
    … +254 lines
    }


• Edited src/pages/CourseSales.jsx (+30 -30)
     53
     54 -  const { data: school } = useQuery({
     55 -    queryKey: ['school-by-slug', slug],
     56 -    queryFn: async () => {
     57 -      const schools = await base44.entities.School.filter({ slug });
     58 -      return schools[0];
     59 -    },
     60 -    enabled: !!slug
     61 -  });
     54 +  const { data: school } = useQuery({
     55 +    queryKey: ['school-by-slug', slug],
     56 +    queryFn: async () => {
     57 +      const schools = await base44.entities.School.filter({ slug, is_public: true });
     58 +      return schools[0];
     59 +    },
     60 +    enabled: !!slug
     61 +  });
     62
     63 -  const { data: course } = useQuery({
     64 -    queryKey: ['course', school?.id, courseId],
     65 -    queryFn: async () => {
     66 -      const courses = await scopedFilter('Course', school.id, { id: courseId });
     67 -      return courses[0];
     68 -    },
     69 -    enabled: !!school?.id && !!courseId
     70 -  });
     63 +  const { data: course } = useQuery({
     64 +    queryKey: ['course', school?.id, courseId],
     65 +    queryFn: async () => {
     66 +      const courses = await scopedFilter('Course', school.id, { id: courseId, is_published: true });
     67 +      return courses[0];
     68 +    },
     69 +    enabled: !!school?.id && !!courseId
     70 +  });
     71
        ⋮
     86      queryFn: async () => {
     87 -      const allOffers = await scopedFilter('Offer', school.id, {});
     87 +      const allOffers = await scopedFilter('Offer', school.id, { is_active: true });
     88        return allOffers.filter(o =>
        ⋮
    172                          Enroll for Free
    173 -                      </Button>
    174 -                    ) : (
    175 -                      <Button size="lg" onClick={() => base44.auth.redirectToLogin()}>
    176 -                        Sign up to Enroll
    173                        </Button>
    178 -                    )
    179 -                  ) : (
    180 -                    user ? (
    174 +                    ) : (
    175 +                      <Button size="lg" onClick={() => window.location.assign(`/login/student?schoolSlug=${enco
         deURIComponent(slug || '')}`)}>
    176 +                        Sign up to Enroll
    177 +                      </Button>
    178 +                    )
    179 +                  ) : (
    180 +                    user ? (
    181                        offers.length > 0 && (
        ⋮
    187                        )
    188 -                    ) : (
    189 -                      <Button size="lg" onClick={() => base44.auth.redirectToLogin()}>
    190 -                        Sign up to Purchase
    191 -                      </Button>
    192 -                    )
    193 -                  )}
    188 +                    ) : (
    189 +                      <Button size="lg" onClick={() => window.location.assign(`/login/student?schoolSlug=${enco
         deURIComponent(slug || '')}`)}>
    190 +                        Sign up to Purchase
    191 +                      </Button>
    192 +                    )
    193 +                  )}
    194                  </div>

• Edited src/pages/SchoolLanding.jsx (+1 -1)
    76      queryFn: async () => {
    77 -      const schools = await base44.entities.School.filter({ slug }, null, 1, { fields: schoolFields });
    77 +      const schools = await base44.entities.School.filter({ slug, is_public: true }, null, 1, { fields: schoolFi
        elds });
    78        return schools[0];

• Edited src/pages/SchoolCourses.jsx (+1 -1)
    52      queryFn: async () => {
    53 -      const schools = await base44.entities.School.filter({ slug }, null, 1, { fields: schoolFields });
    53 +      const schools = await base44.entities.School.filter({ slug, is_public: true }, null, 1, { fields: schoolFi
        elds });
    54        return schools[0];

• Edited src/pages/SchoolPricing.jsx (+2 -2)
    64      queryFn: async () => {
    65 -      const schools = await base44.entities.School.filter({ slug }, null, 1, { fields: schoolFields });
    65 +      const schools = await base44.entities.School.filter({ slug, is_public: true }, null, 1, { fields: schoolFi
        elds });
    66        return schools[0];
       ⋮
    75        school.id,
    76 -      {},
    76 +      { is_active: true },
    77        '-created_date',

• Edited src/portals/public/pages/PublicHome.jsx (+2 -2)
    136      queryKey: ['public-offers', selectedSchoolId],
    137 -    queryFn: () => scopedFilter('Offer', selectedSchoolId, {}, '-created_date', 20, { fields: OFFER_FIELDS }),
    137 +    queryFn: () => scopedFilter('Offer', selectedSchoolId, { is_active: true }, '-created_date', 20, { fields:
         OFFER_FIELDS }),
    138      enabled: !!selectedSchoolId
        ⋮
    142      queryKey: ['public-coupons', selectedSchoolId],
    143 -    queryFn: () => scopedFilter('Coupon', selectedSchoolId, {}, '-created_date', 20, { fields: COUPON_FIELDS })
         ,
    143 +    queryFn: () => scopedFilter('Coupon', selectedSchoolId, { is_active: true }, '-created_date', 20, { fields:
          COUPON_FIELDS }),
    144      enabled: !!selectedSchoolId

• I’m working on enforcing login for transactions and adding an is_public filter to the school query to restrict access
  appropriately. I’ll set auth-check-related states to manage showing login prompts only after auth is confirmed and
  control query triggers based on user and school presence. Also, I’m carefully handling offer queries with is_active
  and considering backend filter support for $in operator to ensure compatibility.

• Edited src/pages/SchoolThankYou.jsx (+50 -22)
     16    const [user, setUser] = useState(null);
     17 +  const [authChecked, setAuthChecked] = useState(false);
     18    const { schoolSlug: slug, transactionId } = useStorefrontContext();
        ⋮
     37
     37 -  useEffect(() => {
     38 -    const loadUser = async () => {
     39 -      try {
     40 -        const currentUser = await base44.auth.me();
     41 -        setUser(currentUser);
     38 +  useEffect(() => {
     39 +    const loadUser = async () => {
     40 +      try {
     41 +        const currentUser = await base44.auth.me();
     42 +        setUser(currentUser);
     43
        ⋮
     58          }
     58 -      } catch (error) {
     59 -        // Guest ok
     60 -      }
     61 -    };
     62 -    loadUser();
     63 -  }, []);
     59 +      } catch (error) {
     60 +        // Guest ok
     61 +      } finally {
     62 +        setAuthChecked(true);
     63 +      }
     64 +    };
     65 +    loadUser();
     66 +  }, []);
     67
        ⋮
     86      queryFn: async () => {
     84 -      const schools = await base44.entities.School.filter({ slug }, null, 1, { fields: schoolFields });
     87 +      const schools = await base44.entities.School.filter({ slug, is_public: true }, null, 1, { fields: schoolF
         ields });
     88        return schools[0];
        ⋮
     91    });
     92 +
     93 +  const { data: transaction } = useQuery({
     94 +    queryKey: ['transaction', school?.id, transactionId],
     95 +    queryFn: async () => {
     96 +      const transactions = await scopedFilter('Transaction', school.id, { id: transactionId });
     97 +      return transactions[0];
     98 +    },
     99 +    enabled: !!school?.id && !!transactionId && !!user
    100 +  });
    101
     90 -  const { data: transaction } = useQuery({
     91 -    queryKey: ['transaction', school?.id, transactionId],
     92 -    queryFn: async () => {
     93 -      const transactions = await scopedFilter('Transaction', school.id, { id: transactionId });
     94 -      return transactions[0];
     95 -    },
     96 -    enabled: !!school?.id && !!transactionId
     97 -  });
     98 -
    102    const { data: offer } = useQuery({
        ⋮
    129          school.id,
    127 -        { offer_type: { $in: ['COPY_LICENSE', 'DOWNLOAD_LICENSE'] } },
    130 +        { offer_type: { $in: ['COPY_LICENSE', 'DOWNLOAD_LICENSE'] }, is_active: true },
    131          '-created_date',
        ⋮
    138    });
    139 +
    140 +  if (authChecked && !user) {
    141 +    return (
    142 +      <div className="min-h-screen bg-slate-50 py-12 px-4">
    145 +            <CardContent className="p-10 space-y-4">
    146 +              <h1 className="text-2xl font-semibold text-slate-900">Sign in to view your receipt</h1>
    147 +              <p className="text-sm text-slate-600">
    148 +                For security, purchase details are available only after signing in.
    151 +                <Button className="w-full" onClick={() => window.location.assign(`/login/student?schoolSlug=${e
         ncodeURIComponent(slug || '')}`)}>
    152 +                  Sign in to continue
    153 +                </Button>
    156 +                </Link>
    157 +              </div>
    158 +            </CardContent>
    159 +          </Card>
    162 +    );
    163 +  }
    164

• Ran rg -n "\$in" src functions
  └ rg: regex parse error:
        (?:\)
        ^
    error: unclosed group

• Ran rg -n "\$in" src functions
  └ rg: regex parse error:
        (?:\)
        ^
    error: unclosed group

• Ran rg -n "\$in" src functions
  └ rg: regex parse error:
        (?:\)
        ^
    error: unclosed group

• Ran rg -n '\$in' src functions
  └ src\components\system\codeScanner.js:67:  const hasEntitlementGate = /\$or\s*:\s*\[/.test(source) && /\
    $in/.test(source) && /(allowedCourseIds|courseIds)/.test(source);
    … +9 lines
    true },
    src\pages\TeachGrading.jsx:66:        course_id: { $in: myCourseIds }

• I’m planning to enhance the matchesFilters function to handle Mongo-like operators such as $or and $in, plus $ne and
  $eq for completeness. This includes recursion for $or arrays of filters, plus matching actual versus expected values
  with these operators. I'll carefully patch _store.js to respect existing logic while supporting these patterns that
  appear widely in filtering entities and content gating.

• Edited functions/api/_store.js (+23 -1)
     71  function matchesFilters(record, filters, ignoredKeys) {
     72 +  if (filters && typeof filters === 'object' && Array.isArray(filters.$or)) {
     73 +    const orMatched = filters.$or.some((clause) => matchesFilters(record, clause, ignoredKeys));
     74 +    if (!orMatched) return false;
     75 +  }
     76 +
     77    const entries = Object.entries(filters || {}).filter(([key, value]) => {
     78      if (ignoredKeys.includes(key)) return false;
     79 +    if (key === '$or') return false;
     80      return value !== undefined && value !== null;
        ⋮
     90      if (expected && typeof expected === 'object') {
     85 -      return actual === expected.value;
     91 +      if (Object.prototype.hasOwnProperty.call(expected, '$in')) {
     92 +        const list = Array.isArray(expected.$in) ? expected.$in : [];
     93 +        if (Array.isArray(actual)) {
     94 +          return actual.some((item) => list.includes(item));
     95 +        }
     96 +        return list.includes(actual);
     97 +      }
     98 +      if (Object.prototype.hasOwnProperty.call(expected, '$ne')) {
     99 +        return actual !== expected.$ne;
    100 +      }
    101 +      if (Object.prototype.hasOwnProperty.call(expected, '$eq')) {
    102 +        return actual === expected.$eq;
    103 +      }
    104 +      if (Object.prototype.hasOwnProperty.call(expected, 'value')) {
    105 +        return actual === expected.value;
    106 +      }
    107 +      return actual === expected;
    108      }

• Edited src/pages/Mentorship.jsx (+14 -12)
     27      queryKey: ['available-mentors'],
     28 -    queryFn: () => base44.entities.User.filter({ role: 'admin' })
     28 +    queryFn: () => scopedFilter('SchoolMembership', activeSchoolId, { role: { $in: ['INSTRUCTOR', 'ADMIN', 'OWN
         ER'] } }),
     29 +    enabled: !!activeSchoolId
     30    });
        ⋮
     88          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
     88 -          {availableMentors.map((mentor) => (
     89 -            <Card key={mentor.id} className="hover:shadow-xl transition-shadow">
     90 -              <CardContent className="p-6">
     91 -                <h3 className="font-bold text-lg mb-2">{mentor.full_name}</h3>
     92 -                <p className="text-slate-600 text-sm mb-4">{mentor.email}</p>
     93 -                <Button
     94 -                  onClick={() => requestMutation.mutate(mentor.email)}
     97 -                  Request Mentorship
     98 -                </Button>
     89 +          {availableMentors.map((mentor) => (
     90 +            <Card key={mentor.id} className="hover:shadow-xl transition-shadow">
     91 +              <CardContent className="p-6">
     94 +                <p className="text-xs text-slate-500 mb-4">{mentor.role}</p>
     95 +                <Button
     96 +                  onClick={() => requestMutation.mutate(mentor.user_email)}
     97 +                  className="w-full"
     98 +                >
     99 +                  Request Mentorship
    100 +                </Button>
    101                </CardContent>

• I'm updating server-side filters and permissions to better handle user-scoped global notifications, public access
  rules for schools and offers, and membership checks, while aiming to enhance documentation and provider login
  behavior. Given the scope, I’m balancing implementing key scaffolding for integrations like Stripe Connect alongside
  solidifying security features and role-based access, knowing the full plan is too large to finish in one go but eager
  to keep progressing steadily.

• Ran Get-Content -Raw src\components\materials\materialsEngine.jsx
  └ /**
     * Materials Retrieval Engine
    … +116 lines
    }


• Ran Get-Content -Raw src\components\protection\ProtectedContent.jsx
  └ import React, { useEffect, useState } from 'react';

    … +147 lines

• I'm noticing some curious control characters in the watermark, but since they're already present and the instructions
  say to default to ASCII, I won't change that. Instead, I'll shift focus to updating server guard components, tweaking
  authentication providers to conditionally include configurations, and adjusting public page selections for the
  is_public flag. I'll also make sure global notifications are handled correctly, and carefully consider restrictions on
  public versus private school access to avoid exposing sensitive policies. Additionally, I'll patch caching keys in
  Mentorship queries to include the active school ID to prevent cross-school cache mix-ups. There's a lot here, so I'll
  prioritize careful, small updates to keep everything consistent.

• Edited src/pages/Mentorship.jsx (+1 -1)
    26    const { data: availableMentors = [] } = useQuery({
    27 -    queryKey: ['available-mentors'],
    27 +    queryKey: ['available-mentors', activeSchoolId],
    28      queryFn: () => scopedFilter('SchoolMembership', activeSchoolId, { role: { $in: ['INSTRUCTOR', 'ADMIN', 'OWNE
        R'] } }),

• I’m reviewing various backend and frontend updates related to user-scoped globals, entity permissions, and public
  school handling to ensure consistency and security. I’m also considering how much Stripe Connect integration
  scaffolding to build now—favoring minimal placeholders and API stubs—to show progress on upcoming phases while
  balancing complexity and time. Next, I’ll likely focus on phase-based planning and incremental feature
  implementations.

• Ran Get-Content -Raw src\components\school\SchoolPayouts.jsx
  └ import React, { useState } from 'react';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    … +193 lines
    }


• This plan outlines adding Stripe Connect onboarding and status checking to SchoolPayouts via new API endpoints and UI
  components, with school-scoped StripeAccount and StripeWebhookEvent entities to track connections and webhook events.
  I’m preparing to implement the backend API calls, signature verification, entity storage, and frontend React panel to
  initiate Stripe onboarding and display status.

• Added functions/api/stripe/_stripe.js (+40 -0)
     1 +function normalizeStripeError(response, data) {
     2 +  const message = data?.error?.message || data?.message || response.statusText || 'Stripe request failed';
     3 +  const error = new Error(message);
     4 +  error.status = response.status;
     5 +  error.data = data;
     6 +  return error;
     7 +}
     8 +
     9 +export async function stripeRequest(env, method, path, body) {
    10 +  const secretKey = env?.STRIPE_SECRET_KEY;
    11 +  if (!secretKey) {
    12 +    const error = new Error('Stripe secret key not configured');
    13 +    error.status = 500;
    14 +    throw error;
    15 +  }
    16 +
    17 +  const url = `https://api.stripe.com${path}`;
    18 +  const headers = new Headers();
    19 +  headers.set('Authorization', `Bearer ${secretKey}`);
    20 +  headers.set('Stripe-Version', env?.STRIPE_API_VERSION || '2023-10-16');
    21 +  headers.set('Content-Type', 'application/x-www-form-urlencoded');
    22 +
    23 +  const params = new URLSearchParams();
    24 +  Object.entries(body || {}).forEach(([key, value]) => {
    25 +    if (value === undefined || value === null || value === '') return;
    26 +    params.set(key, String(value));
    27 +  });
    28 +
    29 +  const response = await fetch(url, {
    30 +    method,
    31 +    headers,
    32 +    body: method === 'GET' ? undefined : params.toString(),
    33 +  });
    34 +
    35 +  const data = await response.json().catch(() => null);
    36 +  if (!response.ok) {
    37 +    throw normalizeStripeError(response, data);
    38 +  }
    39 +  return data;
    40 +}

• Added functions/api/stripe/connect.js (+86 -0)
     1 +import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
     2 +import { createEntity, listEntities, updateEntity } from '../_store.js';
     3 +import { getUserFromToken } from '../_auth.js';
     4 +import { hasMembership, isGlobalAdmin } from '../_tenancy.js';
     5 +import { stripeRequest } from './_stripe.js';
     6 +
     7 +function nowIso() {
     8 +  return new Date().toISOString();
     9 +}
    10 +
    11 +export async function onRequest({ request, env }) {
    12 +  const options = handleOptions(request, env);
    13 +  if (options) return options;
    14 +
    15 +  if (request.method !== 'POST') {
    16 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
    17 +  }
    18 +
    19 +  const token = getBearerToken(request);
    20 +  const user = await getUserFromToken(token, env);
    21 +  if (!user?.email) {
    22 +    return errorResponse('auth_required', 401, 'Authentication required', env);
    23 +  }
    24 +
    25 +  const payload = await readJson(request);
    26 +  if (!payload) {
    27 +    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
    28 +  }
    29 +
    30 +  const schoolId = payload.school_id || payload.schoolId;
    31 +  if (!schoolId) {
    32 +    return errorResponse('missing_school', 400, 'school_id is required', env);
    33 +  }
    34 +
    35 +  const globalAdmin = isGlobalAdmin(user, env);
    36 +  if (!globalAdmin) {
    37 +    const member = await hasMembership(env, schoolId, user.email);
    38 +    if (!member) {
    39 +      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    40 +    }
    41 +  }
    42 +
    43 +  const origin = new URL(request.url).origin;
    44 +  const refreshUrl = payload.refresh_url || `${origin}/admin?stripe=refresh`;
    45 +  const returnUrl = payload.return_url || `${origin}/admin?stripe=connected`;
    46 +
    47 +  const existing = await listEntities(env, 'StripeAccount', {
    48 +    filters: { school_id: String(schoolId) },
    49 +    limit: 1,
    50 +  });
    51 +
    52 +  let accountId = existing?.[0]?.stripe_account_id || null;
    53 +  let recordId = existing?.[0]?.id || null;
    54 +
    55 +  if (!accountId) {
    56 +    const account = await stripeRequest(env, 'POST', '/v1/accounts', {
    57 +      type: 'express',
    58 +      email: user.email,
    59 +      metadata: JSON.stringify({ school_id: String(schoolId) }),
    60 +    });
    61 +    accountId = account.id;
    62 +    const created = await createEntity(env, 'StripeAccount', {
    63 +      school_id: String(schoolId),
    64 +      stripe_account_id: accountId,
    65 +      charges_enabled: Boolean(account.charges_enabled),
    66 +      payouts_enabled: Boolean(account.payouts_enabled),
    67 +      details_submitted: Boolean(account.details_submitted),
    68 +      created_at: nowIso(),
    69 +      updated_at: nowIso(),
    70 +    });
    71 +    recordId = created?.id || null;
    72 +  }
    73 +
    74 +  const link = await stripeRequest(env, 'POST', '/v1/account_links', {
    75 +    account: accountId,
    76 +    refresh_url: refreshUrl,
    77 +    return_url: returnUrl,
    78 +    type: 'account_onboarding',
    79 +  });
    80 +
    81 +  if (recordId) {
    82 +    await updateEntity(env, 'StripeAccount', recordId, { updated_at: nowIso() });
    83 +  }
    84 +
    85 +  return json({ url: link.url, account_id: accountId }, { env });
    86 +}

• Added functions/api/stripe/status.js (+64 -0)
     1 +import { errorResponse, getBearerToken, handleOptions, json } from '../_utils.js';
     2 +import { listEntities, updateEntity } from '../_store.js';
     3 +import { getUserFromToken } from '../_auth.js';
     4 +import { hasMembership, isGlobalAdmin } from '../_tenancy.js';
     5 +import { stripeRequest } from './_stripe.js';
     6 +
     7 +function nowIso() {
     8 +  return new Date().toISOString();
     9 +}
    10 +
    11 +export async function onRequest({ request, env }) {
    12 +  const options = handleOptions(request, env);
    13 +  if (options) return options;
    14 +
    15 +  if (request.method !== 'GET') {
    16 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
    17 +  }
    18 +
    19 +  const token = getBearerToken(request);
    20 +  const user = await getUserFromToken(token, env);
    21 +  if (!user?.email) {
    22 +    return errorResponse('auth_required', 401, 'Authentication required', env);
    23 +  }
    24 +
    25 +  const url = new URL(request.url);
    26 +  const schoolId = url.searchParams.get('school_id') || url.searchParams.get('schoolId');
    27 +  if (!schoolId) {
    28 +    return errorResponse('missing_school', 400, 'school_id is required', env);
    29 +  }
    30 +
    31 +  const globalAdmin = isGlobalAdmin(user, env);
    32 +  if (!globalAdmin) {
    33 +    const member = await hasMembership(env, schoolId, user.email);
    34 +    if (!member) {
    35 +      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    36 +    }
    37 +  }
    38 +
    39 +  const rows = await listEntities(env, 'StripeAccount', {
    40 +    filters: { school_id: String(schoolId) },
    41 +    limit: 1,
    42 +  });
    43 +
    44 +  const record = rows?.[0];
    45 +  if (!record?.stripe_account_id) {
    46 +    return json({ connected: false }, { env });
    47 +  }
    48 +
    49 +  const account = await stripeRequest(env, 'GET', `/v1/accounts/${record.stripe_account_id}`);
    50 +  const updated = await updateEntity(env, 'StripeAccount', record.id, {
    51 +    charges_enabled: Boolean(account.charges_enabled),
    52 +    payouts_enabled: Boolean(account.payouts_enabled),
    53 +    details_submitted: Boolean(account.details_submitted),
    54 +    updated_at: nowIso(),
    55 +  });
    56 +
    57 +  return json({
    58 +    connected: true,
    59 +    account_id: record.stripe_account_id,
    60 +    charges_enabled: updated?.charges_enabled ?? account.charges_enabled,
    61 +    payouts_enabled: updated?.payouts_enabled ?? account.payouts_enabled,
    62 +    details_submitted: updated?.details_submitted ?? account.details_submitted,
    63 +  }, { env });
    64 +}

• Added functions/api/stripe/webhook.js (+104 -0)
      1 +import { errorResponse, handleOptions, json } from '../_utils.js';
      2 +import { createEntity, listEntities, updateEntity } from '../_store.js';
      3 +
      4 +function nowIso() {
      5 +  return new Date().toISOString();
      6 +}
      7 +
      8 +function parseSignature(header) {
      9 +  const parts = String(header || '').split(',');
     10 +  const map = {};
     11 +  parts.forEach((part) => {
     12 +    const [key, value] = part.split('=');
     13 +    if (key && value) {
     14 +      map[key.trim()] = value.trim();
     15 +    }
     16 +  });
     17 +  return map;
     18 +}
     19 +
     20 +async function computeHmac(secret, payload) {
     21 +  const encoder = new TextEncoder();
     22 +  const key = await crypto.subtle.importKey(
     23 +    'raw',
     24 +    encoder.encode(secret),
     25 +    { name: 'HMAC', hash: 'SHA-256' },
     26 +    false,
     27 +    ['sign']
     28 +  );
     29 +  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
     30 +  const bytes = Array.from(new Uint8Array(signature));
     31 +  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
     32 +}
     33 +
     34 +async function verifySignature(request, secret) {
     35 +  const signatureHeader = request.headers.get('Stripe-Signature');
     36 +  if (!signatureHeader) return { ok: false, reason: 'missing_signature' };
     37 +  const payload = await request.text();
     38 +  const parts = parseSignature(signatureHeader);
     39 +  const timestamp = parts.t;
     40 +  const signature = parts.v1;
     41 +  if (!timestamp || !signature) {
     42 +    return { ok: false, reason: 'invalid_signature' };
     43 +  }
     44 +  const signedPayload = `${timestamp}.${payload}`;
     45 +  const expected = await computeHmac(secret, signedPayload);
     46 +  if (expected !== signature) {
     47 +    return { ok: false, reason: 'signature_mismatch' };
     48 +  }
     49 +  return { ok: true, payload };
     50 +}
     51 +
     52 +export async function onRequest({ request, env }) {
     53 +  const options = handleOptions(request, env);
     54 +  if (options) return options;
     55 +
     56 +  if (request.method !== 'POST') {
     57 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
     58 +  }
     59 +
     60 +  const secret = env?.STRIPE_WEBHOOK_SECRET;
     61 +  if (!secret) {
     62 +    return errorResponse('missing_webhook_secret', 500, 'Stripe webhook secret not configured', env);
     63 +  }
     64 +
     65 +  const verification = await verifySignature(request, secret);
     66 +  if (!verification.ok) {
     67 +    return errorResponse('invalid_signature', 400, verification.reason, env);
     68 +  }
     69 +
     70 +  const payload = verification.payload;
     71 +  let event = null;
     72 +  try {
     73 +    event = JSON.parse(payload);
     74 +  } catch {
     75 +    return errorResponse('invalid_payload', 400, 'Invalid JSON payload', env);
     76 +  }
     77 +
     78 +  const accountId = event?.account || event?.data?.object?.account || null;
     79 +  let schoolId = null;
     80 +  if (accountId) {
     81 +    const rows = await listEntities(env, 'StripeAccount', {
     82 +      filters: { stripe_account_id: String(accountId) },
     83 +      limit: 1,
     84 +    });
     85 +    schoolId = rows?.[0]?.school_id || null;
     86 +    if (rows?.[0]) {
     89 +        updated_at: nowIso(),
     90 +      });
     91 +    }
     92 +  }
     93 +
     94 +  await createEntity(env, 'StripeWebhookEvent', {
     95 +    school_id: schoolId,
     96 +    event_id: event.id,
     97 +    event_type: event.type,
     98 +    account_id: accountId,
     99 +    received_at: nowIso(),
    100 +    payload: event,
    101 +  });
    102 +
    103 +  return json({ received: true }, { env });
    104 +}

• Edited src/components/api/scopedEntities.js (+1 -0)
    30    'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy'
    31 +  , 'StripeAccount', 'StripeWebhookEvent'
    32  ];

• Ran Get-Content -Raw src\components\api\scopedEntities.js
  └ // Shared entity scoping lists
    //
    … +39 lines
    }


• Edited src/components/api/scopedEntities.js (+2 -2)
    29    'StudySchedule', 'Tournament', 'UserPowerUp', 'VideoAnnotation', 'WellnessCheck',
    30 -  'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy'
    31 -  , 'StripeAccount', 'StripeWebhookEvent'
    30 +  'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy',
    31 +  'StripeAccount', 'StripeWebhookEvent'
    32  ];

• Edited functions/api/_tenancy.js (+1 -0)
    25    'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy'
    26 +  , 'StripeAccount', 'StripeWebhookEvent'
    27  ];

• Edited functions/api/_tenancy.js (+2 -2)
    24    'StudySchedule', 'Tournament', 'UserPowerUp', 'VideoAnnotation', 'WellnessCheck',
    25 -  'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy'
    26 -  , 'StripeAccount', 'StripeWebhookEvent'
    25 +  'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy',
    26 +  'StripeAccount', 'StripeWebhookEvent'
    27  ];

• Added src/components/billing/StripeConnectPanel.jsx (+78 -0)
     1 +import React from 'react';
     2 +import { useMutation, useQuery } from '@tanstack/react-query';
     3 +import { base44 } from '@/api/base44Client';
     4 +import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
     5 +import { Button } from '@/components/ui/button';
     6 +import { Badge } from '@/components/ui/badge';
     7 +import { toast } from 'sonner';
     8 +
     9 +export default function StripeConnectPanel({ schoolId }) {
    10 +  const { data, isLoading, refetch } = useQuery({
    11 +    queryKey: ['stripe-connect-status', schoolId],
    12 +    queryFn: () => base44.request('/stripe/status', {
    13 +      params: { school_id: schoolId },
    14 +    }),
    15 +    enabled: !!schoolId,
    16 +  });
    17 +
    18 +  const connectMutation = useMutation({
    19 +    mutationFn: async () => {
    20 +      const response = await base44.request('/stripe/connect', {
    21 +        method: 'POST',
    22 +        body: { school_id: schoolId },
    23 +      });
    24 +      return response;
    25 +    },
    26 +    onSuccess: (result) => {
    27 +      if (result?.url) {
    28 +        window.location.assign(result.url);
    29 +      } else {
    30 +        toast.error('Stripe onboarding link unavailable');
    31 +      }
    32 +    },
    33 +    onError: () => {
    34 +      toast.error('Unable to start Stripe onboarding');
    35 +    },
    36 +  });
    37 +
    38 +  if (!schoolId) return null;
    39 +
    40 +  const connected = Boolean(data?.connected);
    41 +  const statusLabel = connected ? 'Connected' : 'Not connected';
    42 +  const statusVariant = connected ? 'default' : 'secondary';
    43 +
    44 +  return (
    45 +    <Card>
    46 +      <CardHeader className="flex flex-row items-start justify-between gap-4">
    47 +        <div>
    48 +          <CardTitle>Stripe Connect</CardTitle>
    49 +          <CardDescription>Accept payments and route payouts directly to your school.</CardDescription>
    50 +        </div>
    51 +        <Badge variant={statusVariant}>{statusLabel}</Badge>
    52 +      </CardHeader>
    53 +      <CardContent className="space-y-4">
    54 +        {isLoading ? (
    55 +          <p className="text-sm text-muted-foreground">Checking Stripe connection...</p>
    56 +        ) : connected ? (
    57 +          <div className="space-y-2 text-sm text-muted-foreground">
    58 +            <div>Charges enabled: {data?.charges_enabled ? 'Yes' : 'No'}</div>
    59 +            <div>Payouts enabled: {data?.payouts_enabled ? 'Yes' : 'No'}</div>
    60 +            <div>Details submitted: {data?.details_submitted ? 'Yes' : 'No'}</div>
    61 +            <Button variant="outline" onClick={() => refetch()}>
    62 +              Refresh status
    63 +            </Button>
    64 +          </div>
    65 +        ) : (
    66 +          <div className="space-y-3">
    67 +            <p className="text-sm text-muted-foreground">
    68 +              Connect your Stripe account to enable payouts and automatic fee routing.
    69 +            </p>
    70 +            <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isLoading}>
    71 +              {connectMutation.isLoading ? 'Launching Stripe...' : 'Connect Stripe'}
    72 +            </Button>
    73 +          </div>
    74 +        )}
    75 +      </CardContent>
    76 +    </Card>
    77 +  );
    78 +}

• Edited src/components/school/SchoolPayouts.jsx (+91 -87)
     11  import { buildCacheKey, scopedCreate, scopedFilter, scopedUpdate } from '@/components/api/scoped';
     12 +import StripeConnectPanel from '@/components/billing/StripeConnectPanel';
     13
        ⋮
    103    return (
    103 -    <Card>
    104 -      <CardHeader className="flex flex-row items-center justify-between">
    105 -        <CardTitle className="flex items-center">
    106 -          <DollarSign className="w-5 h-5 mr-2" />
    107 -          Instructor Payouts
    108 -        </CardTitle>
    109 -        <Dialog open={showDialog} onOpenChange={setShowDialog}>
    110 -          <DialogTrigger asChild>
    111 -            <Button>Create Payout</Button>
    112 -          </DialogTrigger>
    113 -          <DialogContent>
    114 -            <DialogHeader>
    115 -              <DialogTitle>Create Instructor Payout</DialogTitle>
    116 -            </DialogHeader>
    117 -            <form onSubmit={handleCreate} className="space-y-4">
    118 -              <div className="space-y-2">
    119 -                <Label>Instructor Email</Label>
    120 -                <Input name="instructor_email" type="email" required />
    121 -              </div>
    122 -              <div className="space-y-2">
    123 -                <Label>Amount ($)</Label>
    124 -                <Input name="amount" type="number" step="0.01" required />
    125 -              </div>
    126 -              <div className="grid grid-cols-2 gap-4">
    104 +    <div className="space-y-6">
    105 +      <StripeConnectPanel schoolId={school?.id} />
    106 +      <Card>
    107 +        <CardHeader className="flex flex-row items-center justify-between">
    108 +          <CardTitle className="flex items-center">
    109 +            <DollarSign className="w-5 h-5 mr-2" />
    110 +            Instructor Payouts
    111 +          </CardTitle>
    112 +          <Dialog open={showDialog} onOpenChange={setShowDialog}>
    113 +            <DialogTrigger asChild>
    114 +              <Button>Create Payout</Button>
    115 +            </DialogTrigger>
    116 +            <DialogContent>
    117 +              <DialogHeader>
    118 +                <DialogTitle>Create Instructor Payout</DialogTitle>
    119 +              </DialogHeader>
    120 +              <form onSubmit={handleCreate} className="space-y-4">
    121                  <div className="space-y-2">
    128 -                  <Label>Period Start</Label>
    129 -                  <Input name="period_start" type="date" required />
    122 +                  <Label>Instructor Email</Label>
    123 +                  <Input name="instructor_email" type="email" required />
    124 +                </div>
    125 +                <div className="space-y-2">
    126 +                  <Label>Amount ($)</Label>
    127 +                  <Input name="amount" type="number" step="0.01" required />
    128 +                </div>
    129 +                <div className="grid grid-cols-2 gap-4">
    130 +                  <div className="space-y-2">
    131 +                    <Label>Period Start</Label>
    132 +                    <Input name="period_start" type="date" required />
    133 +                  </div>
    134 +                  <div className="space-y-2">
    135 +                    <Label>Period End</Label>
    136 +                    <Input name="period_end" type="date" required />
    137 +                  </div>
    138                  </div>
    139                  <div className="space-y-2">
    132 -                  <Label>Period End</Label>
    133 -                  <Input name="period_end" type="date" required />
    140 +                  <Label>Notes</Label>
    141 +                  <Input name="notes" placeholder="Optional notes" />
    142                  </div>
    135 -              </div>
    136 -              <div className="space-y-2">
    137 -                <Label>Notes</Label>
    138 -                <Input name="notes" placeholder="Optional notes" />
    139 -              </div>
    140 -              <Button type="submit" className="w-full">Create Payout</Button>
    141 -            </form>
    142 -          </DialogContent>
    143 -        </Dialog>
    144 -      </CardHeader>
    145 -      <CardContent>
    146 -        <div className="overflow-x-auto">
    147 -          <table className="w-full">
    148 -            <thead>
    149 -              <tr className="border-b">
    150 -                <th className="text-left py-3 px-4">Instructor</th>
    151 -                <th className="text-left py-3 px-4">Period</th>
    152 -                <th className="text-right py-3 px-4">Amount</th>
    153 -                <th className="text-right py-3 px-4">Status</th>
    154 -                <th className="text-right py-3 px-4">Actions</th>
    155 -              </tr>
    156 -            </thead>
    157 -            <tbody>
    158 -              {payouts.map((payout) => (
    159 -                <tr key={payout.id} className="border-b hover:bg-slate-50">
    160 -                  <td className="py-3 px-4">{payout.instructor_email}</td>
    161 -                  <td className="py-3 px-4 text-sm">
    162 -                    {new Date(payout.period_start).toLocaleDateString()} -{' '}
    163 -                    {new Date(payout.period_end).toLocaleDateString()}
    164 -                  </td>
    165 -                  <td className="text-right py-3 px-4 font-medium">
    166 -                    ${(payout.amount_cents / 100).toFixed(2)}
    167 -                  </td>
    168 -                  <td className="text-right py-3 px-4">
    169 -                    <Badge variant={payout.status === 'PAID' ? 'default' : 'secondary'}>
    170 -                      {payout.status}
    171 -                    </Badge>
    172 -                  </td>
    173 -                  <td className="text-right py-3 px-4">
    174 -                    {payout.status === 'PENDING' && (
    175 -                      <Button
    176 -                        size="sm"
    177 -                        variant="outline"
    178 -                        onClick={() => markPaidMutation.mutate(payout.id)}
    179 -                      >
    180 -                        <Check className="w-4 h-4 mr-1" />
    181 -                        Mark Paid
    182 -                      </Button>
    183 -                    )}
    184 -                  </td>
    143 +                <Button type="submit" className="w-full">Create Payout</Button>
    144 +              </form>
    145 +            </DialogContent>
    146 +          </Dialog>
    147 +        </CardHeader>
    148 +        <CardContent>
    149 +          <div className="overflow-x-auto">
    150 +            <table className="w-full">
    151 +              <thead>
    152 +                <tr className="border-b">
    153 +                  <th className="text-left py-3 px-4">Instructor</th>
    154 +                  <th className="text-left py-3 px-4">Period</th>
    155 +                  <th className="text-right py-3 px-4">Amount</th>
    156 +                  <th className="text-right py-3 px-4">Status</th>
    157 +                  <th className="text-right py-3 px-4">Actions</th>
    158                  </tr>
    186 -              ))}
    187 -            </tbody>
    188 -          </table>
    189 -          {payouts.length === 0 && (
    190 -            <p className="text-slate-500 text-center py-8">No payouts yet</p>
    191 -          )}
    192 -        </div>
    193 -      </CardContent>
    194 -    </Card>
    159 +              </thead>
    160 +              <tbody>
    161 +                {payouts.map((payout) => (
    162 +                  <tr key={payout.id} className="border-b hover:bg-slate-50">
    163 +                    <td className="py-3 px-4">{payout.instructor_email}</td>
    164 +                    <td className="py-3 px-4 text-sm">
    165 +                      {new Date(payout.period_start).toLocaleDateString()} -{' '}
    166 +                      {new Date(payout.period_end).toLocaleDateString()}
    167 +                    </td>
    168 +                    <td className="text-right py-3 px-4 font-medium">
    169 +                      ${(payout.amount_cents / 100).toFixed(2)}
    170 +                    </td>
    171 +                    <td className="text-right py-3 px-4">
    172 +                      <Badge variant={payout.status === 'PAID' ? 'default' : 'secondary'}>
    173 +                        {payout.status}
    174 +                      </Badge>
    175 +                    </td>
    176 +                    <td className="text-right py-3 px-4">
    177 +                      {payout.status === 'PENDING' && (
    178 +                        <Button
    179 +                          size="sm"
    180 +                          variant="outline"
    181 +                          onClick={() => markPaidMutation.mutate(payout.id)}
    182 +                        >
    183 +                          <Check className="w-4 h-4 mr-1" />
    184 +                          Mark Paid
    185 +                        </Button>
    186 +                      )}
    187 +                    </td>
    188 +                  </tr>
    189 +                ))}
    190 +              </tbody>
    191 +            </table>
    192 +            {payouts.length === 0 && (
    193 +              <p className="text-slate-500 text-center py-8">No payouts yet</p>
    194 +            )}
    195 +          </div>
    196 +        </CardContent>
    197 +      </Card>
    198 +    </div>
    199    );

• Edited README.md (+7 -0)
    79  - `OIDC_ALLOW_ALL`: Allow SSO without a per-school policy (default: false).
    82 +
    83 +### Optional environment variables (Stripe)
    84 +- `STRIPE_SECRET_KEY`: Stripe secret key for Connect onboarding.
    85 +- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret.
    86 +- `STRIPE_API_VERSION`: Stripe API version override (defaults to 2023-10-16).
    87

• Edited docs/v11/V11_DOMAIN_MODEL.md (+2 -0)
    47  - PricingChangeRequest (school scoped): pending approvals
    48 +- StripeAccount (school scoped): stripe_account_id, charges_enabled, payouts_enabled
    49 +- StripeWebhookEvent (school scoped): event_type, account_id, payload
    50

⚠ Heads up, you have less than 25% of your 5h limit left. Run /status for a breakdown.

• I'm going through various code pieces to ensure school-scoped membership checks, global entity access, and public
  entity filtering work correctly across API endpoints and UI pages. I’m checking entity handlers for proper scoping,
  updating frontend components to respect new filters like is_public and is_active, and confirming that API tenancy and
  Stripe webhook events are handled properly. Also, I'm verifying that user session queries align with scope checks and
  considering minor UI/UX improvements like loading states around authentication. It feels like a comprehensive pass to
  align backend logic with frontend usage and data visibility rules.

• Ran Get-Content -Raw src\portals\public\components\AuthProviderButtons.jsx
  └ import React, { useMemo } from 'react';
    import { useQuery } from '@tanstack/react-query';
    … +89 lines
    }


• I’m focusing on tightening the update rules for SchoolInvite records so that invitees who aren’t members can only
  modify the accepted_at field. This involves patching the entity update logic to check the payload keys and return
  forbidden errors if unauthorized fields are changed. It’s a safety improvement to prevent invitees from altering roles
• Edited functions/api/entities/[entity]/[id].js (+7 -0)
    140          const invitee = entity === 'SchoolInvite' && String(record.email || '').toLowerCase() === String(user.e
         mail || '').toLowerCase();
    141 +        if (!isMember && invitee) {
    142 +          const allowedKeys = new Set(['accepted_at']);
    143 +          const invalid = Object.keys(payload || {}).some((key) => !allowedKeys.has(key));
    144 +          if (invalid) {
    145 +            return errorResponse('forbidden', 403, 'Invitee cannot modify invite fields', env);
    146 +          }
    147 +        }
    148          if (!isMember && !invitee) {

• Edited functions/api/entities/[entity].js (+6 -0)
    195        if (!globalAdmin) {
    196 +        if (entity === 'SchoolMembership') {
    197 +          const payloadEmail = payload.user_email || payload.userEmail || '';
    198 +          if (payloadEmail && String(payloadEmail).toLowerCase() !== String(user.email).toLowerCase()) {
    199 +            return errorResponse('forbidden', 403, 'Cannot create membership for another user', env);
    200 +          }
    201 +        }
    202          const isMember = await hasMembership(env, schoolId, user.email);

• Ran Get-Content -Raw src\pages\Integrity.jsx
  └ import React, { useEffect, useMemo, useState } from 'react';
    import { FEATURES, getAllRoutes } from '@/components/config/features';
    … +508 lines
    }


• I’m wrapping up key updates around public read rules, Stripe integration, school scopes, and auth enhancements,
  including fixing metadata handling in Stripe requests. I’m preparing a concise summary that highlights file changes,
  environment variables, and potential breaking changes, plus actionable next steps like environment setup and testing—
  while noting tests haven’t run yet.

• Edited functions/api/stripe/connect.js (+1 -1)
    58        email: user.email,
    59 -      metadata: JSON.stringify({ school_id: String(schoolId) }),
    59 +      'metadata[school_id]': String(schoolId),
    60      });

• Edited functions/api/stripe/connect.js (+28 -23)
    54
    55 -  if (!accountId) {
    56 -    const account = await stripeRequest(env, 'POST', '/v1/accounts', {
    57 -      type: 'express',
    58 -      email: user.email,
    59 -      'metadata[school_id]': String(schoolId),
    60 -    });
    61 -    accountId = account.id;
    62 -    const created = await createEntity(env, 'StripeAccount', {
    63 -      school_id: String(schoolId),
    64 -      stripe_account_id: accountId,
    65 -      charges_enabled: Boolean(account.charges_enabled),
    66 -      payouts_enabled: Boolean(account.payouts_enabled),
    67 -      details_submitted: Boolean(account.details_submitted),
    68 -      created_at: nowIso(),
    69 -      updated_at: nowIso(),
    55 +  let link = null;
    56 +  try {
    57 +    if (!accountId) {
    58 +      const account = await stripeRequest(env, 'POST', '/v1/accounts', {
    59 +        type: 'express',
    60 +        email: user.email,
    61 +        'metadata[school_id]': String(schoolId),
    62 +      });
    63 +      accountId = account.id;
    64 +      const created = await createEntity(env, 'StripeAccount', {
    65 +        school_id: String(schoolId),
    66 +        stripe_account_id: accountId,
    67 +        charges_enabled: Boolean(account.charges_enabled),
    68 +        payouts_enabled: Boolean(account.payouts_enabled),
    69 +        details_submitted: Boolean(account.details_submitted),
    70 +        created_at: nowIso(),
    71 +        updated_at: nowIso(),
    72 +      });
    73 +      recordId = created?.id || null;
    74 +    }
    75 +
    76 +    link = await stripeRequest(env, 'POST', '/v1/account_links', {
    77 +      account: accountId,
    78 +      refresh_url: refreshUrl,
    79 +      return_url: returnUrl,
    80 +      type: 'account_onboarding',
    81      });
    71 -    recordId = created?.id || null;
    82 +  } catch (error) {
    83 +    return errorResponse('stripe_error', error.status || 500, error.message, env);
    84    }
    73 -
    76 -    refresh_url: refreshUrl,
    77 -    return_url: returnUrl,
    78 -    type: 'account_onboarding',
    79 -  });
    85

• Edited functions/api/stripe/status.js (+7 -1)
    48
    49 -  const account = await stripeRequest(env, 'GET', `/v1/accounts/${record.stripe_account_id}`);
    49 +  let account = null;
    50 +  try {
    51 +    account = await stripeRequest(env, 'GET', `/v1/accounts/${record.stripe_account_id}`);
    52 +  } catch (error) {
    53 +    return errorResponse('stripe_error', error.status || 500, error.message, env);
    54 +  }
    55 +
    56    const updated = await updateEntity(env, 'StripeAccount', record.id, {

• I'm going through updates across APIs, components, and docs—adding Stripe support, refining entity scopes and
  permissions, ensuring server guards don’t block OIDC, clarifying global admin roles, and cleaning up imports—while
  keeping security tight and preparing for later enhancements like SSO connectors and Cloudflare Stream integration.

• Ran Get-Content -Raw src\pages\Mentorship.jsx
  └ import React from 'react';
    import { base44 } from '@/api/base44Client';
    … +105 lines
    }


• Edited src/pages/Mentorship.jsx (+0 -1)
    1  import React from 'react';
    2 -import { base44 } from '@/api/base44Client';
    2  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

• I'm mapping out updates to allow invited users to access school data before official membership—adding checks for

• Edited functions/api/entities/[entity].js (+5 -0)
    123
    124 +      const invited = await hasInviteForUser(env, school.id, user.email);
    125 +      if (invited) {
    126 +        return json([school], { env });
    127 +      }
    128 +
    129        if (school.is_public) {

• Edited functions/api/entities/[entity]/[id].js (+2 -0)
    75        if (isMember) return json(record, { env });
    76 +      const invited = await hasInviteForUser(env, record.id, user.email);
    77 +      if (invited) return json(record, { env });
    78        if (record.is_public) {

    6 +  hasInviteForUser,
    7    hasMembership,

• Ran rg -n "useMutation\(|isPending|isLoading" src/components src/pages | Select-String -Pattern "isPending|isLoading"
  └
    src/pages\AuditLogViewer.jsx:15:  const { user, role, activeSchoolId, isLoading } = useSession();
    … +207 lines
    disabled={saveMutation.isPending} size="lg" className="w-full">


• Edited src/components/billing/StripeConnectPanel.jsx (+2 -2)
    72              </Button>

─ Worked for 23m 09s ───────────────────────────────────────────────────────────────────────────────────────────────────

• Context compacted
  └
        Directory: C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy
    … +58 lines
    -a---            1/9/2026  9:44 AM         714325 zod-4.3.3.tgz

  but excluding .git—to fully comply with reading all .md files as the user requested. Since the list could be huge,
  I'll gather counts and categorize files by top-level directories to get a structured overview while avoiding flooding
  the output, and then prioritize opening key docs like GEMINI.md or MASTER_PLAN_V11_FULL_SPEC.md for detailed planning.
  Let’s proceed with this efficient yet exhaustive approach!

  │ import collections
  │ … +34 lines
  └ md_count 1032
    md_by_top_dir
    … +19 lines

• Ran Get-Content -Path GEMINI.md
  └ # Breslov Academy - Gemini Instructional Context

    … +53 lines
    ## Integrity
    Admins can visit `/integrity` to run automated scans for registry drift and data leakage.

• Ran Get-Content -Path ARCHITECTURE.md
  └ # Architecture

    … +34 lines

• Ran Get-Content -Path README.md
  └ # Breslov Academy LMS

    … +107 lines

• Ran Get-Content -Path SECURITY_INVARIANTS.md
  └ # Security Invariants

    … +18 lines

• I’m taking in the big picture of the multi-phase plan—phases 0 to 10.3—with strict no-deletion rules and tenant
  isolation enforcement. The focus is on crucial security boundaries and access control states. There’s a need to build
  out the public home page with core features and back-end systems. Since we can’t do everything fast, I’m prioritizing
  continuing to explore the repo, especially under src/pages and src/components, to find existing work before coding
  more. Checking out PublicHome.jsx next sounds like a good way to see progress on the public-facing page. Let’s explore
  this together!

• Ran Get-Content -Path src\portals\public\pages\PublicHome.jsx
  └ import React, { useMemo, useState } from 'react';
      return `$${coupon.discount_value || 0}`;
    }

• Ran Get-ChildItem -Force -Path docs
  └
    -a---           1/11/2026  6:09 AM           1301 v9.1-seo-prerender.md

  └
        Directory: C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\docs\v11
    … +8 lines
    -a---           1/11/2026 10:03 PM           1337 V11_RELEASE_GATES.md

  especially on SSO, domain verification, global connectors, Stripe flows, role-based gating, and tenancy enforcement.
  I’ll check specific parts like entity scoping, the materials engine, audit logging, and APIs to ensure we cover the
  key phases in the user’s plan while respecting “zero deletions.” Let’s explore these areas step-by-step!

• Ran Get-Content -Path functions\api\_store.js
    … +293 lines
      return bucket.delete(String(id));
    }

• Ran Get-Content -Path functions\api\entities\[entity].js
  └ Get-Content: An object at the specified path functions\api\entities\[entity].js does not exist, or has been filtered
    by the -Include or -Exclude parameter.

• Ran Get-ChildItem -Force -Path functions\api\entities
  └
        Directory: C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\functions\api\entities
    … +4 lines
    -a---           1/11/2026 11:06 PM           8826 [entity].js


• Ran Get-Content -LiteralPath "functions\api\entities\[entity].js"
  └ import { errorResponse, getBearerToken, handleOptions, json, normalizeLimit, parseQueryJson, readJson } from '../
    _utils.js';
    }

• Ran Get-Content -LiteralPath "functions\api\entities\[entity]\[id].js"
  └ import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../../_utils.js';
    import { deleteEntity, listEntities, updateEntity } from '../../_store.js';
    }

• I'm mapping out a multi-phase plan with grouped tasks covering governance, spec enforcement, authentication,
  connectors, media, payments, deployment, onboarding, dashboards, and security to ensure steady progress on this
  complex project. I'll update the plan accordingly as I move forward.
  └ Execution plan aligned to the V11 + launch phases, focusing on code and docs already in the repo.
    □ Phase 0-1: Governance + spec pack enforcement (branch model docs, parity checks, release gates CI hooks).
    □ Phase 2: Identity & SSO hardening (OIDC claim mapping, domain verification scaffolding, policy enforcement UI).
    □ Phase 3-4: Classroom + M365 connectors foundations (API scaffolds, config entities, UI panels).
    □ Phase 5-6: Media + billing (Cloudflare Stream/R2 upload flows, Stripe Connect fees + checkout).

• Ran Get-Content -Path docs\ops\BASE44_GITHUB_RELEASE_MODEL.md
  └ # Base44 + GitHub Release Discipline

    … +29 lines

• Ran Get-ChildItem -Force -Path scripts
  └
        Directory: C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\scripts
    … +8 lines

• Ran Get-ChildItem -Force -Path .github
  └
        Directory: C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\.github
    … +5 lines

• Ran Get-ChildItem -Force -Path .github\workflows
  └
        Directory: C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\.github\workflows
    … +4 lines

• Ran Get-Content -Path .github\workflows\ci.yml
  └ name: ci

    … +19 lines

• Ran Get-Content -Path package.json
  └ {
      "name": "breslov-academy",
    … +109 lines

• Ran Get-Content -Path docs\branding\NAME_CHANGE.md
  └ # Repository Name Change Log

    … +13 lines

• Ran Get-Content -Path scripts\validate-v11-spec.mjs
  └ import fs from 'node:fs';
    import path from 'node:path';
    … +117 lines

• Ran Get-Content -Path scripts\parity-sweep.mjs
  └ import fs from 'node:fs';
    import path from 'node:path';
    … +107 lines

• Ran Get-Content -Path MASTER_PLAN_V11_FULL_SPEC.md -TotalCount 120
  └ # BRESLOV ACADEMY - STRATEGIC MASTER PLAN V11.0
    **Author:** Strategic Project Manager (Gemini)
    … +116 lines
    Legacy routes must remain working via:
    - alias routes in registry

• Ran Get-Content -Path wrangler.toml
  └ name = "breslov-academy"
    compatibility_date = "2025-01-01"
    # database_id = "REPLACE_WITH_DATABASE_ID"

• Ran rg -n "Breslov Academy|Breslov University" src docs README.md
  └ README.md:1:# Breslov Academy LMS
    README.md:16:- **[Repo Rename Log](./docs/branding/NAME_CHANGE.md):** Breslov Academy -> Breslov University rename
    … +42 lines
    src\components\utils\ARCHITECTURE.md:3:High-level architecture of Breslov Academy platform.
    src\pages\SchoolNew.jsx:129:                placeholder="Breslov Academy"

• Ran Get-Content -Path src\components\config\features.jsx
    … +199 lines
      return Object.values(groups).sort((a, b) => a.order - b.order);
    };

• I’m thinking about adding scaffolding for new connectors like Google Classroom and Microsoft Graph with placeholder
  scoped entities and updating tenancy configurations. I'll check existing scoped entities next to see how to fit these
  in.

• Ran Get-Content -Path src\components\api\scopedEntities.js
  └ // Shared entity scoping lists
      return SCHOOL_SCOPED_ENTITIES.includes(entityName);
    }

• I’m mapping out where connectors, domain verification, and protected materials enforcement fit in the system. I want
  to verify existing safeguards like useLessonAccess and materialsEngine prevent unauthorized content access while

• Ran rg -n "useLessonAccess" src
  └ src\pages\Integrity.jsx:156:          import('../components/hooks/useLessonAccess.jsx?raw'),
    src\pages\Integrity.jsx:214:      lessonAccess: { label: 'useLessonAccess', source: sources.lessonAccess },
    … +14 lines

• Ran Get-Content -Path src\components\hooks\useLessonAccess.jsx
  └ // Lesson Access Control Hook
    // v10.0-r6: membership-first, drip-aware, and does NOT fetch full Lesson content (caller provides lessonMeta)
    … +182 lines

• Ran Get-Content -Path src\components\materials\materialsEngine.jsx
  └ /**
     * Materials Retrieval Engine
    … +115 lines

• Ran Get-Content -Path .github\CODEOWNERS
  └ # CODEOWNERS
    # Update owners as the team forms.
    … +5 lines

• Ran Get-Content -Path .github\pull_request_template.md
  └ ## Summary
    -
    … +9 lines

• Ran Get-Content -Path functions\api\auth\oidc\_providers.js
  └ const DEFAULT_GOOGLE_SCOPES = 'openid email profile';
    const DEFAULT_MICROSOFT_SCOPES = 'openid email profile';
    … +65 lines

• Ran Get-Content -Path functions\api\auth\oidc\start.js
  └ import { errorResponse, handleOptions, withHeaders } from '../../_utils.js';
    import { createEntity } from '../../_store.js';
    … +133 lines
      });
    }

• Ran Get-Content -Path functions\api\auth\oidc\callback.js
  └ import { errorResponse, handleOptions, withHeaders } from '../../_utils.js';
      });
    }

• Ran Get-Content -Path functions\api\auth\oidc\_policy.js
  └ import { listEntities } from '../../_store.js';

    … +82 lines
      };
    }
  └ import React, { useEffect, useMemo, useState } from 'react';
    import { useQuery } from '@tanstack/react-query';
    … +251 lines
      );
    }
  mapping in SchoolAuthPolicy. This involves new API endpoints for domain challenge and verification, secure handling
  scoped by school and membership, and updating policy logic and UI to enforce verified domains and show statuses. I'll
  integrate DNS lookups via Cloudflare's DNS-over-HTTPS and extend existing auth flows accordingly.

• Ran Get-Content -Path functions\api\auth\providers.js
    … +25 lines
      }, { env });
    }

• I'll expand domain verification and role mapping features by adding fields to SchoolAuthSettings and SchoolAuthPolicy,

• Ran Get-Content -Path functions\api\_tenancy.js
  └ import { listEntities } from './_store.js';

    … +202 lines
      });
    }

• Ran Get-Content -Path src\components\api\scoped.jsx
  └ // Multi-Tenant Scoped Query Helpers
    // Ensures all data queries respect school boundaries
    };

• Ran Get-Content -Path cloudflare\schema.sql
  └ CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
    CREATE INDEX IF NOT EXISTS idx_entities_entity_user ON entities(entity, user_email);

• Ran Get-Content -Path src\pages\Integrity.jsx
  └ import React, { useEffect, useMemo, useState } from 'react';
    import { FEATURES, getAllRoutes } from '@/components/config/features';
    }

• I'm planning to tackle the large feature set step-by-step, starting with domain verification and SSO improvements,
  then scaffolding integrations for Google Classroom and Microsoft Graph, and adding Cloudflare Stream and R2 support
  with upload mechanisms. I'll also prepare Stripe Connect payment flows and inspect the current payment UI to align the

• Ran Get-Content -Path src\pages\SchoolCheckout.jsx
  └ import React, { useState, useEffect } from 'react';
    import { base44 } from '@/api/base44Client';
    … +354 lines

• Ran Get-Content -Path src\components\school\SchoolPayouts.jsx
  └ import React, { useState } from 'react';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    … +196 lines

• Ran Get-Content -Path src\components\billing\StripeConnectPanel.jsx
  └ import React from 'react';
    import { useMutation, useQuery } from '@tanstack/react-query';
    … +74 lines
      );
    }

• Ran Get-ChildItem -Force -Path functions\api\stripe
  └
        Directory: C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\functions\api\stripe


• Ran Get-Content -Path functions\api\stripe\_stripe.js
  └ function normalizeStripeError(response, data) {
      const message = data?.error?.message || data?.message || response.statusText || 'Stripe request failed';
    }

• Ran Get-Content -Path functions\api\stripe\connect.js
  └ import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
    import { createEntity, listEntities, updateEntity } from '../_store.js';
    }

• I’m mapping out how to add audit logs for key entity changes like publishing or price updates by comparing old and new
  data during PATCH requests, creating AuditLog entries with user and school info while avoiding recursion, and ensuring
  the logs respect school scoping and authentication. I’m also considering server-side rate limiting for auth endpoints

• Ran rg -n "RateLimit" functions src
  └ functions\api\_tenancy.js:11:  'AiTutorSession', 'AiTutorPolicyLog', 'RateLimitLog',
    src\components\api\scopedEntities.js:16:  'AiTutorSession', 'AiTutorPolicyLog', 'RateLimitLog',
    … +9 lines

• Ran Get-Content -Path src\api\base44Client.js
  └ import { createAppClient } from '@/api/appClient';
    import { installTenancyEnforcer } from '@/components/api/tenancyEnforcer';
    … +12 lines
      isGlobalAdmin,
    });

• Ran Get-Content -Path src\api\appClient.js
  └ import { appParams, clearStoredToken, getStoredToken } from '@/lib/app-params';
      };
    }

• Ran rg -n "Adapter|adapter" src\components src\api
  └ src\components\system\useToast.js:1:// v8.6 System Toast Adapter
    scopedQueries.js`
    src\components\utils\featureRegistry.jsx:7:// Legacy FEATURES export (adapter)

• Ran rg -n "SSO|Stripe|Stream|Drive|Classroom|Microsoft|OneDrive|R2" docs\v11\V11_MASTER_FEATURE_INDEX.md
  └ 108:| V11-LABS-019 | LiveStreams | Live Streams | student, teacher, admin | P2 | planned | Labs | LiveStream | TBD |
    156:| V11-PLAT-029 | N/A | Payment Webhooks + Ledger | platform | P0 | planned | Platform | Stripe | G/W/T: webhook
    updates ledger and audit log | Data backfill | Payments | Ledger:update |

• I’m organizing the upcoming work to implement domain verification and the SSO admin wizard as core parts of Phase 2,
  while also considering connectors for later phases. I’m laying out tasks like UI updates, API additions, policy
  enforcement, and new entities for integration credentials, all to smoothly support multi-tenant OAuth flows and token
  management. Next, I’ll explore the existing integration marketplace UI to align with connector features.

• Ran rg -n "Integrations" src\pages src\components
    … +11 lines
    Store', route: '/integrations', area: 'system', audiences: ['admin'], icon: 'Plug' },
    src\components\utils\featureRegistry.jsx:225:    label: 'Integrations',

• Ran Get-Content -Path src\components\config\integrations.js
  └ import {
      Video,
    … +132 lines
    export const getIntegrationById = (id) => INTEGRATIONS[id];
    export const getAllIntegrations = () => Object.values(INTEGRATIONS);

    import { useSearchParams, useNavigate } from 'react-router-dom';
    … +186 lines
      );
    }
  Classroom or Microsoft OneDrive by adding config entries and new API endpoints. I want to check the existing API
  folder structure to see how to best set this up.

• Ran Get-ChildItem -Force -Path functions\api\integrations
  └
    d----           1/11/2026  6:18 AM                core


• This plan covers creating new school-scoped and global entities to securely handle OAuth token storage and connection
  status for Google and Microsoft integrations, defining API endpoints for start, callback, status, and disconnect
  future expansion.

• Ran rg -n "video_url|upload" src\pages\TeachLesson.jsx src\pages\TeachCourse.jsx src\components\teaching
  └ rg: src\components\teaching: The system cannot find the file specified. (os error 2)
    src\pages\TeachLesson.jsx:75:        video_url: formData.get('video_url'),
    src\pages\TeachLesson.jsx:165:                <Input name="video_url" defaultValue={lesson.video_url}
    placeholder="https://youtube.com/..." />

• Ran Get-Content -Path src\pages\TeachLesson.jsx
  └ import React, { useState, useEffect } from 'react';
    import { useSession } from '@/components/hooks/useSession';
    … +196 lines

• Ran Get-Content -Path src\pages\LessonViewer.jsx
    … +445 lines
      );
    }

• Ran Get-Content -Path src\components\video\AdvancedVideoPlayer.jsx
    … +336 lines
      );
    }

• I'm mapping out how to restrict video previews in the player and enforce preview content limits server-side to prevent
  unauthorized full content fetches, especially when users try to bypass UI restrictions via the network panel. I'll
  implement playback time limits in the video player for preview mode, and on the server, I'll build entitlement- and
  membership-based access checks to sanitize lesson content responses by trimming or removing material beyond allowed
  preview scope. This involves extending server-side logic to verify user roles, course entitlements, and content
  protection policies before serving lesson data.
  └ Get-Content: Cannot find path 'C:
    \Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\src\components\drip\dripEngine.js' because it does not exist.

• Ran Get-ChildItem -Force -Path src\components\drip
  └
    -a---           1/11/2026  7:25 PM           3372 dripEngine.jsx


• Ran Get-Content -Path src\components\drip\dripEngine.jsx
  └ /**
      }
    }

• I'm mapping out how to replicate drip and entitlement gating on the server to strictly enforce all access states,
  including drip locks. I want to balance accurate access control with complexity, focusing on Lessons and QuizQuestions
  by checking policies, memberships, entitlements, and enrollment dates, then pruning or exposing content accordingly to
  prevent unauthorized access.

• Ran rg -n "QuizQuestion" src
  └ src\components\academic\quizEngine.jsx:7://   (A) Preferred: Quiz metadata in Quiz + questions in QuizQuestion
    src\components\academic\quizEngine.jsx:15:export function supportsQuizQuestions() {
    … +13 lines
    '-created_date', 50);
    src\components\api\scopedEntities.js:21:  'QuizQuestion',

• Ran Get-Content -Path src\pages\QuizTake.jsx
  └ import React, { useEffect, useMemo } from 'react';
    import { Link, useParams, useSearchParams } from 'react-router-dom';
    … +144 lines
      );
    }
  └ // Quiz Engine (v9.0)
    //
    … +166 lines
      });
    }
  they’re allowed based on their membership and entitlements, with preview limits enforced. I’m also setting up domain
  verification endpoints to validate school domains securely. Alongside this, I’ll add audit logging for key entity
  here, so I’m breaking it down into helpers, API changes, and frontend updates.

  Designing Stripe checkout and guest transaction flow

  I'm working through how to integrate Stripe checkout with flexible fallback to manual transactions for guests. The
  implement logic to compute platform fees, retrieve connected Stripe accounts, and ensure smooth frontend integration
  with checkout buttons and status checks. This will require careful coordination between API routes, entity
  permissions, and frontend updates to support both authenticated and guest users making purchases.

• Ran Get-Content -Path functions\api\stripe\webhook.js
  └ import { errorResponse, handleOptions, json } from '../_utils.js';
    import { createEntity, listEntities, updateEntity } from '../_store.js';
    … +100 lines
      return json({ received: true }, { env });
    }

• Ran Get-Content -Path src\components\utils\entitlements.js
  └ Get-Content: Cannot find path 'C:
    \Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\src\components\utils\entitlements.js' because it does not exist.

• Ran Get-ChildItem -Force -Path src\components\utils | Where-Object { $_.Name -match 'entitlement' }
  └
        Directory: C:\Users\gav4y\OneDrive\Desktop\REPO\breslov-academy\src\components\utils
    … +3 lines
    -a---           1/11/2026  6:09 AM          11831 entitlements.jsx


• Ran Get-Content -Path src\components\utils\entitlements.jsx
  └ // Entitlement checking utilities for course access control

    … +351 lines
      }
    }

• I'm working through a detailed plan to implement domain verification with UI updates, role mapping, and policy
  enforcement, followed by server-side access gating for Lessons and QuizQuestions, plus audit logging for key entity
  changes. This includes thoughtful handling of field projections and preview chars, phased integration connector
  additions, and careful API updates across several files. There's a lot to cover, so I'm prioritizing core security and
  payment features while structuring incremental tasks.

• Edited src/components/api/scopedEntities.js (+4 -2)
    30    'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy',
    31 -  'StripeAccount', 'StripeWebhookEvent'
    31 +  'StripeAccount', 'StripeWebhookEvent',
    32 +  'DomainVerification', 'IntegrationConnection', 'StreamUpload'
    33  ];
       ⋮
    37    'Notification', 'Integration', 'UserSchoolPreference',
    37 -  'TenantApplication', 'AuthSession', 'AuthState', 'IdentityLink'
    38 +  'TenantApplication', 'AuthSession', 'AuthState', 'IdentityLink',
    39 +  'IntegrationState', 'IntegrationSecret'
    40  ];

• Edited functions/api/_tenancy.js (+4 -2)
    25    'PricingChangeRequest', 'DownloadToken', 'SchoolAuthPolicy',
    26 -  'StripeAccount', 'StripeWebhookEvent'
    26 +  'StripeAccount', 'StripeWebhookEvent',
    27 +  'DomainVerification', 'IntegrationConnection', 'StreamUpload'
    28  ];
       ⋮
    32    'Notification', 'Integration', 'UserSchoolPreference',
    32 -  'TenantApplication', 'AuthSession', 'AuthState', 'IdentityLink'
    33 +  'TenantApplication', 'AuthSession', 'AuthState', 'IdentityLink',
    34 +  'IntegrationState', 'IntegrationSecret'
    35  ];

• I'm setting up domain verification inside a new functions/api/auth/domain folder with challenge.js and verify.js. I'll
  handle membership checks, token generation, record creation/updating, and DNS TXT record verification using
  Cloudflare's DNS-over-HTTPS API, making sure to enforce admin-only domain verification.

• Added functions/api/auth/domain/challenge.js (+142 -0)
      1 +import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../../_utils.js';
      2 +import { createEntity, listEntities, updateEntity } from '../../_store.js';
      3 +import { getUserFromToken } from '../../_auth.js';
      4 +import { hasMembership, isGlobalAdmin } from '../../_tenancy.js';
      5 +
      6 +const CHALLENGE_TTL_HOURS = 24;
      7 +const VERIFICATION_PREFIX = 'breslov-verification';
      8 +
      9 +function nowIso() {
     10 +  return new Date().toISOString();
     11 +}
     12 +
     13 +function normalizeDomain(domain) {
     14 +  return String(domain || '')
     15 +    .trim()
     16 +    .toLowerCase()
     17 +    .replace(/^@/, '')
     18 +    .replace(/^https?:\/\//, '')
     19 +    .replace(/\/.*$/, '');
     20 +}
     21 +
     22 +function isValidDomain(domain) {
     23 +  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain);
     24 +}
     25 +
     26 +function buildRecordName(domain) {
     27 +  return `_breslov-verification.${domain}`;
     28 +}
     29 +
     30 +function buildRecordValue(token) {
     31 +  return `${VERIFICATION_PREFIX}=${token}`;
     32 +}
     33 +
     34 +function buildToken() {
     35 +  return crypto.randomUUID().replace(/-/g, '');
     36 +}
     37 +
     38 +async function getMembershipRole(env, schoolId, email) {
     39 +  if (!schoolId || !email) return null;
     40 +  const rows = await listEntities(env, 'SchoolMembership', {
     41 +    filters: { school_id: String(schoolId), user_email: String(email) },
     42 +    limit: 1,
     43 +  });
     44 +  return rows?.[0]?.role || null;
     45 +}
     46 +
     47 +function isAdminRole(role) {
     48 +  const normalized = String(role || '').toUpperCase();
     49 +  return ['OWNER', 'ADMIN', 'SUPERADMIN'].includes(normalized);
     50 +}
     51 +
     52 +export async function onRequest({ request, env }) {
     53 +  const options = handleOptions(request, env);
     54 +  if (options) return options;
     55 +
     56 +  if (request.method !== 'POST') {
     57 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
     58 +  }
     59 +
     60 +  const token = getBearerToken(request);
     61 +  const user = await getUserFromToken(token, env);
     62 +  if (!user?.email) {
     63 +    return errorResponse('auth_required', 401, 'Authentication required', env);
     64 +  }
     65 +
     66 +  const payload = await readJson(request);
     67 +  if (!payload) {
     68 +    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
     69 +  }
     70 +
     71 +  const schoolId = payload.school_id || payload.schoolId;
     72 +  const rawDomain = payload.domain || '';
     73 +  const domain = normalizeDomain(rawDomain);
     74 +  const force = payload.force === true;
     75 +
     76 +  if (!schoolId) {
     77 +    return errorResponse('missing_school', 400, 'school_id is required', env);
     78 +  }
     79 +  if (!domain || !isValidDomain(domain)) {
     80 +    return errorResponse('invalid_domain', 400, 'Valid domain is required', env);
     81 +  }
     82 +
     83 +  const globalAdmin = isGlobalAdmin(user, env);
     84 +  if (!globalAdmin) {
     85 +    const member = await hasMembership(env, schoolId, user.email);
     86 +    if (!member) {
     87 +      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
     88 +    }
     89 +    const role = await getMembershipRole(env, schoolId, user.email);
     90 +    if (!isAdminRole(role)) {
     91 +      return errorResponse('forbidden', 403, 'Admin role required', env);
     92 +    }
     93 +  }
     94 +
     95 +  const existing = await listEntities(env, 'DomainVerification', {
     96 +    filters: { school_id: String(schoolId), domain },
     97 +    limit: 1,
     98 +  });
     99 +  const record = existing?.[0] || null;
    100 +
    101 +  if (record?.verified_at && !force) {
    102 +    return json({
    103 +      id: record.id,
    104 +      school_id: record.school_id,
    105 +      domain,
    106 +      status: 'verified',
    107 +      verified_at: record.verified_at,
    108 +      record_name: buildRecordName(domain),
    109 +      record_value: buildRecordValue(record.token || ''),
    110 +    }, { env });
    111 +  }
    112 +
    113 +  const tokenValue = buildToken();
    114 +  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_HOURS * 60 * 60 * 1000).toISOString();
    115 +  const payloadUpdate = {
    116 +    school_id: String(schoolId),
    117 +    domain,
    118 +    token: tokenValue,
    119 +    status: 'pending',
    120 +    requested_by: user.email,
    121 +    requested_at: nowIso(),
    122 +    expires_at: expiresAt,
    123 +    verified_at: null,
    124 +  };
    125 +
    126 +  let saved = null;
    127 +  if (record?.id) {
    128 +    saved = await updateEntity(env, 'DomainVerification', record.id, payloadUpdate);
    129 +  } else {
    130 +    saved = await createEntity(env, 'DomainVerification', payloadUpdate);
    131 +  }
    132 +
    133 +  return json({
    134 +    id: saved?.id || record?.id || null,
    135 +    school_id: String(schoolId),
    136 +    domain,
    137 +    status: 'pending',
    138 +    expires_at: expiresAt,
    139 +    record_name: buildRecordName(domain),
    140 +    record_value: buildRecordValue(tokenValue),
    141 +  }, { env });
    142 +}

• Added functions/api/auth/domain/verify.js (+143 -0)
      1 +import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../../_utils.js';
      2 +import { listEntities, updateEntity } from '../../_store.js';
      3 +import { getUserFromToken } from '../../_auth.js';
      4 +import { hasMembership, isGlobalAdmin } from '../../_tenancy.js';
      5 +
      6 +const VERIFICATION_PREFIX = 'breslov-verification';
      7 +
      8 +function nowIso() {
      9 +  return new Date().toISOString();
     10 +}
     11 +
     12 +function normalizeDomain(domain) {
     13 +  return String(domain || '')
     14 +    .trim()
     15 +    .toLowerCase()
     16 +    .replace(/^@/, '')
     17 +    .replace(/^https?:\/\//, '')
     18 +    .replace(/\/.*$/, '');
     19 +}
     20 +
     21 +function isValidDomain(domain) {
     22 +  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain);
     23 +}
     24 +
     25 +function buildRecordName(domain) {
     26 +  return `_breslov-verification.${domain}`;
     27 +}
     28 +
     29 +async function fetchTxtRecords(name) {
     30 +  const url = new URL('https://cloudflare-dns.com/dns-query');
     31 +  url.searchParams.set('name', name);
     32 +  url.searchParams.set('type', 'TXT');
     33 +  const response = await fetch(url.toString(), {
     34 +    headers: { Accept: 'application/dns-json' },
     35 +  });
     36 +  if (!response.ok) {
     37 +    const error = new Error(`DNS lookup failed (${response.status})`);
     38 +    error.status = response.status;
     39 +    throw error;
     40 +  }
     41 +  const data = await response.json();
     42 +  const answers = Array.isArray(data?.Answer) ? data.Answer : [];
     43 +  return answers.map((entry) => String(entry.data || '').replace(/\"/g, ''));
     44 +}
     45 +
     46 +async function getMembershipRole(env, schoolId, email) {
     47 +  if (!schoolId || !email) return null;
     48 +  const rows = await listEntities(env, 'SchoolMembership', {
     49 +    filters: { school_id: String(schoolId), user_email: String(email) },
     50 +    limit: 1,
     51 +  });
     52 +  return rows?.[0]?.role || null;
     53 +}
     54 +
     55 +function isAdminRole(role) {
     56 +  const normalized = String(role || '').toUpperCase();
     57 +  return ['OWNER', 'ADMIN', 'SUPERADMIN'].includes(normalized);
     58 +}
     59 +
     60 +export async function onRequest({ request, env }) {
     61 +  const options = handleOptions(request, env);
     62 +  if (options) return options;
     63 +
     64 +  if (request.method !== 'POST') {
     65 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
     66 +  }
     67 +
     68 +  const token = getBearerToken(request);
     69 +  const user = await getUserFromToken(token, env);
     70 +  if (!user?.email) {
     71 +    return errorResponse('auth_required', 401, 'Authentication required', env);
     72 +  }
     73 +
     74 +  const payload = await readJson(request);
     75 +  if (!payload) {
     76 +    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
     77 +  }
     78 +
     79 +  const schoolId = payload.school_id || payload.schoolId;
     80 +  const rawDomain = payload.domain || '';
     81 +  const domain = normalizeDomain(rawDomain);
     82 +
     83 +  if (!schoolId) {
     84 +    return errorResponse('missing_school', 400, 'school_id is required', env);
     85 +  }
     86 +  if (!domain || !isValidDomain(domain)) {
     87 +    return errorResponse('invalid_domain', 400, 'Valid domain is required', env);
     88 +  }
     89 +
     90 +  const globalAdmin = isGlobalAdmin(user, env);
     91 +  if (!globalAdmin) {
     92 +    const member = await hasMembership(env, schoolId, user.email);
     93 +    if (!member) {
     94 +      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
     95 +    }
     96 +    const role = await getMembershipRole(env, schoolId, user.email);
     97 +    if (!isAdminRole(role)) {
     98 +      return errorResponse('forbidden', 403, 'Admin role required', env);
     99 +    }
    100 +  }
    101 +
    102 +  const records = await listEntities(env, 'DomainVerification', {
    103 +    filters: { school_id: String(schoolId), domain },
    104 +    limit: 1,
    105 +  });
    106 +  const record = records?.[0];
    107 +  if (!record?.id || !record.token) {
    108 +    return errorResponse('no_challenge', 404, 'Verification challenge not found', env);
    109 +  }
    110 +
    111 +  const recordName = buildRecordName(domain);
    112 +  let txtRecords = [];
    113 +  try {
    114 +    txtRecords = await fetchTxtRecords(recordName);
    115 +  } catch (error) {
    116 +    return errorResponse('dns_lookup_failed', error.status || 502, error.message, env);
    117 +  }
    118 +
    119 +  const expected = `${VERIFICATION_PREFIX}=${record.token}`;
    120 +  const found = txtRecords.some((value) => value.includes(expected));
    121 +
    122 +  if (!found) {
    123 +    return json({
    124 +      verified: false,
    125 +      status: 'pending',
    126 +      domain,
    127 +      record_name: recordName,
    128 +      record_value: expected,
    129 +    }, { env });
    130 +  }
    131 +
    132 +  await updateEntity(env, 'DomainVerification', record.id, {
    133 +    status: 'verified',
    134 +    verified_at: nowIso(),
    135 +  });
    136 +
    137 +  return json({
    138 +    verified: true,
    139 +    status: 'verified',
    140 +    domain,
    141 +    verified_at: nowIso(),
    142 +  }, { env });
    143 +}

• Edited functions/api/auth/oidc/_policy.js (+32 -2)
     51
     52 -export function isDomainAllowed(policy, email) {
     52 +export function isDomainAllowed(policy, email, verifiedDomains = []) {
     53    if (!policy) return false;
        ⋮
     59    if (allowedDomains.length > 0) {
     60 -    return allowedDomains.includes(domain);
     60 +    if (!allowedDomains.includes(domain)) {
     61 +      return false;
     62 +    }
     63    }
     64
     65 +  if (policy.require_domain_verification === true) {
     66 +    const verifiedSet = new Set((verifiedDomains || []).map(normalizeDomain));
     67 +    if (!verifiedSet.has(domain)) {
     68 +      return false;
     69 +    }
     70 +  }
     71 +
     72    if (policy.require_domain_match === true) {
        ⋮
     82
     83 +export function resolveRoleForEmail(policy, email) {
     84 +  const fallback = policy?.auto_provision_role || policy?.default_role || 'STUDENT';
     85 +  if (!policy || !email) return fallback;
     86 +  const domain = normalizeDomain(email.split('@')[1] || '');
     87 +  if (!domain) return fallback;
     88 +
     89 +  const map = policy.domain_role_map || policy.domainRoleMap || null;
     90 +  if (map && typeof map === 'object' && !Array.isArray(map)) {
     91 +    const direct = map[domain];
     92 +    if (direct) return direct;
     93 +  }
     94 +
     95 +  if (Array.isArray(map)) {
     96 +    const match = map.find((entry) => normalizeDomain(entry?.domain) === domain);
     97 +    if (match?.role) return match.role;
     98 +  }
     99 +
    100 +  return fallback;
    101 +}
    102 +
    103  export function sanitizePolicyForPublic(policy) {
        ⋮
    110      require_domain_match: policy.require_domain_match === true,
    111 +    require_domain_verification: policy.require_domain_verification === true,
    112      allow_personal_emails: policy.allow_personal_emails !== false,

• Edited functions/api/auth/oidc/callback.js (+13 -3)
      4  import { getProviderConfig } from './_providers.js';
      5 -import { getSchoolAuthPolicy, isDomainAllowed, policyAllowsProvider, resolveSchool } from './_policy.js';
      5 +import { getSchoolAuthPolicy, isDomainAllowed, policyAllowsProvider, resolveRoleForEmail, resolveSchool } from
         './_policy.js';
      6
        ⋮
    215    if (!policy || !policy.auto_provision) return null;
    216 -  const role = normalizeRole(policy.auto_provision_role || policy.default_role || 'STUDENT');
    216 +  const role = normalizeRole(resolveRoleForEmail(policy, email));
    217    const membership = await createEntity(env, 'SchoolMembership', {
        ⋮
    233
    234 +async function getVerifiedDomains(env, schoolId) {
    235 +  if (!schoolId) return [];
    236 +  const rows = await listEntities(env, 'DomainVerification', {
    237 +    filters: { school_id: String(schoolId), status: 'verified' },
    238 +    limit: 200,
    239 +  });
    240 +  return (rows || []).map((row) => row.domain).filter(Boolean);
    241 +}
    242 +
    243  export async function onRequest({ request, env }) {
        ⋮
    299    const allowAll = String(env?.OIDC_ALLOW_ALL || '').toLowerCase() === 'true';
    300 +  const verifiedDomains = policy?.require_domain_verification ? await getVerifiedDomains(env, school?.id) : [];
    301
        ⋮
    305      }
    296 -    if (!isDomainAllowed(policy, email)) {
    306 +    if (!isDomainAllowed(policy, email, verifiedDomains)) {
    307        return redirectWithError('domain_blocked', 'Email domain not allowed', state.next_url, url.origin, env);

• Edited src/components/school/SchoolAuthSettings.jsx (+171 -0)
     41      requireDomainMatch: true,
     42 +    requireDomainVerification: false,
     43      allowPersonalEmails: false,
        ⋮
     45      autoProvisionRole: 'STUDENT',
     46 +    domainRoleMap: {},
     47    });
     48 +  const [activeChallenge, setActiveChallenge] = useState(null);
     49 +  const [isVerifying, setIsVerifying] = useState(false);
     50
        ⋮
     66
     67 +  const { data: domainVerifications = [], refetch: refetchDomainVerifications } = useQuery({
     68 +    queryKey: ['domain-verifications', schoolId],
     69 +    queryFn: () => scopedFilter('DomainVerification', schoolId, {}, '-requested_at', 50),
     70 +    enabled: !!schoolId,
     71 +  });
     72 +
     73    useEffect(() => {
        ⋮
     81        requireDomainMatch: policy.require_domain_match === true,
     82 +      requireDomainVerification: policy.require_domain_verification === true,
     83        allowPersonalEmails: policy.allow_personal_emails !== false,
        ⋮
     85        autoProvisionRole: policy.auto_provision_role || policy.default_role || 'STUDENT',
     86 +      domainRoleMap: policy.domain_role_map || {},
     87      });
        ⋮
     97
     98 +  const allowedDomains = useMemo(() => normalizeDomains(form.allowedDomains), [form.allowedDomains]);
     99 +
    100 +  const verificationByDomain = useMemo(() => {
    101 +    const map = new Map();
    102 +    (domainVerifications || []).forEach((row) => {
    103 +      if (row?.domain) map.set(String(row.domain).toLowerCase(), row);
    104 +    });
    105 +    return map;
    106 +  }, [domainVerifications]);
    107 +
    108 +  useEffect(() => {
    109 +    if (!allowedDomains.length) return;
    110 +    setForm((prev) => {
    111 +      const nextMap = { ...(prev.domainRoleMap || {}) };
    112 +      let changed = false;
    113 +      allowedDomains.forEach((domain) => {
    114 +        if (!nextMap[domain]) {
    115 +          nextMap[domain] = prev.autoProvisionRole || 'STUDENT';
    116 +          changed = true;
    117 +        }
    118 +      });
    119 +      Object.keys(nextMap).forEach((domain) => {
    120 +        if (!allowedDomains.includes(domain)) {
    121 +          delete nextMap[domain];
    122 +          changed = true;
    123 +        }
    124 +      });
    125 +      if (!changed) return prev;
    126 +      return { ...prev, domainRoleMap: nextMap };
    127 +    });
    128 +  }, [allowedDomains.join(','), form.autoProvisionRole]);
    129 +
    130    const updateProvider = (providerId) => {
        ⋮
    139
    140 +  const handleChallengeDomain = async (domain, force = false) => {
    141 +    if (!schoolId || !domain) return;
    142 +    try {
    143 +      const result = await base44.request('/auth/domain/challenge', {
    144 +        method: 'POST',
    145 +        body: { school_id: schoolId, domain, force },
    146 +      });
    147 +      setActiveChallenge(result);
    148 +      await refetchDomainVerifications();
    149 +      toast.success('Verification record created');
    150 +    } catch (error) {
    151 +      toast.error('Unable to create verification record');
    152 +    }
    153 +  };
    154 +
    155 +  const handleVerifyDomain = async (domain) => {
    156 +    if (!schoolId || !domain) return;
    157 +    setIsVerifying(true);
    158 +    try {
    159 +      const result = await base44.request('/auth/domain/verify', {
    160 +        method: 'POST',
    161 +        body: { school_id: schoolId, domain },
    162 +      });
    163 +      await refetchDomainVerifications();
    164 +      setActiveChallenge(result?.verified ? null : activeChallenge);
    165 +      toast.success(result?.verified ? 'Domain verified' : 'Domain not verified yet');
    166 +    } catch (error) {
    167 +      toast.error('Verification failed');
    168 +    } finally {
    169 +      setIsVerifying(false);
    170 +    }
    171 +  };
    172 +
    173    const handleSave = async () => {
        ⋮
    179        require_domain_match: form.requireDomainMatch,
    180 +      require_domain_verification: form.requireDomainVerification,
    181        allow_personal_emails: form.allowPersonalEmails,
        ⋮
    183        auto_provision_role: form.autoProvisionRole,
    184 +      domain_role_map: form.domainRoleMap,
    185      };
        ⋮
    279              <div>
    280 +              <p className="text-sm font-medium">Require verified domains</p>
    281 +              <p className="text-xs text-muted-foreground">Block SSO until domains are DNS verified.</p>
    282 +            </div>
    283 +            <Switch
    284 +              checked={form.requireDomainVerification}
    285 +              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, requireDomainVerification: checked })
         )}
    286 +            />
    287 +          </div>
    288 +          <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
    289 +            <div>
    290                <p className="text-sm font-medium">Require domain match</p>
        ⋮
    297            </div>
    298 +        </div>
    299 +
    300 +        <div className="grid gap-4 sm:grid-cols-2">
    301            <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
        ⋮
    340
    341 +        {allowedDomains.length > 0 && (
    342 +          <div className="space-y-3">
    343 +            <Label>Domain role overrides</Label>
    344 +            <div className="space-y-2">
    345 +              {allowedDomains.map((domain) => (
    346 +                <div key={domain} className="flex flex-wrap items-center justify-between gap-3 rounded-lg borde
         r border-border/60 p-3">
    347 +                  <div>
    348 +                    <p className="text-sm font-medium">{domain}</p>
    349 +                    <p className="text-xs text-muted-foreground">Override default auto-provision role</p>
    350 +                  </div>
    351 +                  <Select
    352 +                    value={form.domainRoleMap?.[domain] || form.autoProvisionRole}
    353 +                    onValueChange={(value) => setForm((prev) => ({
    354 +                      ...prev,
    355 +                      domainRoleMap: { ...(prev.domainRoleMap || {}), [domain]: value },
    356 +                    }))}
    357 +                  >
    358 +                    <SelectTrigger className="min-w-[180px]">
    359 +                      <SelectValue />
    360 +                    </SelectTrigger>
    361 +                    <SelectContent>
    362 +                      {ROLE_OPTIONS.map((role) => (
    363 +                        <SelectItem key={role} value={role}>
    364 +                          {role}
    365 +                        </SelectItem>
    366 +                      ))}
    367 +                    </SelectContent>
    368 +                  </Select>
    369 +                </div>
    370 +              ))}
    371 +            </div>
    372 +          </div>
    373 +        )}
    374 +
    375 +        <div className="space-y-3">
    376 +          <Label>Domain verification</Label>
    377 +          <div className="space-y-2">
    378 +            {allowedDomains.length === 0 ? (
    379 +              <p className="text-xs text-muted-foreground">Add allowed domains to begin verification.</p>
    380 +            ) : (
    381 +              allowedDomains.map((domain) => {
    382 +                const record = verificationByDomain.get(domain);
    383 +                const status = record?.status || 'unverified';
    384 +                const isVerified = record?.status === 'verified' || Boolean(record?.verified_at);
    385 +                return (
    386 +                  <div key={domain} className="rounded-lg border border-border/60 p-3">
    387 +                    <div className="flex flex-wrap items-center justify-between gap-3">
    388 +                      <div>
    389 +                        <p className="text-sm font-medium">{domain}</p>
    390 +                        <p className="text-xs text-muted-foreground">
    391 +                          Status: {isVerified ? 'Verified' : status}
    392 +                        </p>
    393 +                      </div>
    394 +                      <div className="flex flex-wrap gap-2">
    395 +                        <Button size="sm" variant="outline" onClick={() => handleChallengeDomain(domain)}>
    396 +                          {record ? 'Regenerate TXT' : 'Generate TXT'}
    397 +                        </Button>
    398 +                        <Button size="sm" onClick={() => handleVerifyDomain(domain)} disabled={isVerifying}>
    401 +                      </div>
    402 +                    </div>
    403 +                    {activeChallenge?.domain === domain && (
    404 +                      <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
    405 +                        Add the following TXT record, then click Verify.
    406 +                        <div className="mt-2 font-mono text-[11px]">
    407 +                          <div>Name: {activeChallenge.record_name}</div>
    408 +                          <div>Value: {activeChallenge.record_value}</div>
    409 +                          {activeChallenge.expires_at && <div>Expires: {new Date(activeChallenge.expires_at).to
         LocaleString()}</div>}
    410 +                        </div>
    411 +                      </div>
    412 +                    )}
    413 +                  </div>
    414 +                );
    415 +              })
    416 +            )}
    417 +          </div>
    418 +        </div>
    419 +
    420          <div className="flex justify-end">

• Ran Get-Content -Path src\components\school\SchoolAuthSettings.jsx
  └ import React, { useEffect, useMemo, useState } from 'react';
    import { useQuery } from '@tanstack/react-query';
    … +422 lines
      );
    }

• I’m outlining a new file for server-side access gating and audit logging, focused on lessons and quizzes. I’m planning
  functions to check roles, memberships, and entitlements, compute access levels (FULL, PREVIEW, LOCKED), and sanitize
  or limit content accordingly. I’ll integrate these checks into entity list and detail endpoints, carefully handling
  sensitive fields and previews, plus implementing helper functions like projectFields. It looks like a thorough system
  to enforce fine-grained access while supporting preview modes for non-privileged users. I’m curious how everything
  will fit together once implemented!

• Added functions/api/_access.js (+234 -0)
      1 +import { listEntities } from './_store.js';
      2 +
      3 +const STAFF_ROLES = new Set(['OWNER', 'ADMIN', 'INSTRUCTOR', 'TEACHER', 'TA', 'RAV', 'RABBI', 'SUPERADMIN']);
      4 +const DEFAULT_POLICY = {
      5 +  allow_previews: true,
      6 +  max_preview_seconds: 90,
      7 +  max_preview_chars: 1500,
      8 +};
      9 +
     10 +function parseDateSafe(value) {
     11 +  if (!value) return null;
     12 +  const date = new Date(value);
     13 +  return Number.isNaN(date.valueOf()) ? null : date;
     14 +}
     15 +
     16 +function normalizeEntitlementType(entitlement) {
     17 +  return String(entitlement?.type || entitlement?.entitlement_type || '').toUpperCase();
     18 +}
     19 +
     20 +function isEntitlementActive(entitlement, now = new Date()) {
     21 +  if (!entitlement) return false;
     22 +  if (String(entitlement.status || '').toLowerCase() === 'revoked') return false;
     23 +  const startsAt = parseDateSafe(entitlement.starts_at || entitlement.start_date || entitlement.created_date);
     24 +  const endsAt = parseDateSafe(entitlement.ends_at || entitlement.expires_at || entitlement.end_date);
     25 +  if (startsAt && startsAt > now) return false;
     26 +  if (endsAt && endsAt <= now) return false;
     27 +  return true;
     28 +}
     29 +
     30 +async function getMembership(env, schoolId, email) {
     31 +  if (!schoolId || !email) return null;
     32 +  const rows = await listEntities(env, 'SchoolMembership', {
     33 +    filters: { school_id: String(schoolId), user_email: String(email) },
     34 +    limit: 1,
     35 +  });
     36 +  return rows?.[0] || null;
     37 +}
     38 +
     39 +function isStaffRole(role) {
     40 +  return STAFF_ROLES.has(String(role || '').toUpperCase());
     41 +}
     42 +
     43 +async function getPolicy(env, schoolId) {
     44 +  if (!schoolId) return DEFAULT_POLICY;
     45 +  const rows = await listEntities(env, 'ContentProtectionPolicy', {
     46 +    filters: { school_id: String(schoolId) },
     47 +    limit: 1,
     48 +  });
     49 +  return rows?.[0] || DEFAULT_POLICY;
     50 +}
     51 +
     52 +async function getActiveEntitlements(env, schoolId, email) {
     53 +  if (!schoolId || !email) return [];
     54 +  const rows = await listEntities(env, 'Entitlement', {
     55 +    filters: { school_id: String(schoolId), user_email: String(email) },
     56 +    limit: 500,
     57 +  });
     58 +  const now = new Date();
     59 +  return (rows || []).filter((ent) => isEntitlementActive(ent, now));
     60 +}
     61 +
     62 +function hasCourseAccess(entitlements, courseId) {
     63 +  if (!courseId) return false;
     64 +  const cid = String(courseId);
     65 +  return entitlements.some((ent) => {
     66 +    const type = normalizeEntitlementType(ent);
     67 +    if (type === 'ALL_COURSES') return true;
     68 +    return type === 'COURSE' && String(ent.course_id) === cid;
     69 +  });
     70 +}
     71 +
     72 +function getEnrollDate(entitlements, courseId) {
     73 +  const cid = String(courseId || '');
     74 +  const dates = (entitlements || [])
     75 +    .filter((ent) => {
     76 +      const type = normalizeEntitlementType(ent);
     77 +      return type === 'ALL_COURSES' || (type === 'COURSE' && String(ent.course_id) === cid);
     78 +    })
     79 +    .map((ent) => parseDateSafe(ent.created_date || ent.starts_at))
     80 +    .filter(Boolean)
     81 +    .sort((a, b) => a - b);
     82 +  return dates[0] || null;
     83 +}
     84 +
     85 +function computeDripLock(lesson, enrollDate, now = new Date()) {
     86 +  if (!lesson || !enrollDate) return { locked: false };
     87 +  const publishAt = parseDateSafe(lesson.drip_publish_at);
     88 +  if (publishAt && publishAt > now) {
     89 +    return { locked: true, availableAt: publishAt };
     90 +  }
     91 +  if (lesson.drip_days_after_enroll) {
     92 +    const availableAt = new Date(enrollDate);
     93 +    availableAt.setDate(availableAt.getDate() + Number(lesson.drip_days_after_enroll));
     94 +    if (availableAt > now) {
     95 +      return { locked: true, availableAt };
     96 +    }
     97 +  }
     98 +  return { locked: false };
     99 +}
    100 +
    101 +function truncateString(value, maxChars) {
    102 +  if (typeof value !== 'string') return value;
    103 +  if (!maxChars || value.length <= maxChars) return value;
    104 +  return `${value.slice(0, maxChars)}...`;
    105 +}
    106 +
    107 +function sanitizeLesson(lesson, access, policy, previewChars) {
    108 +  if (!lesson || typeof lesson !== 'object') return lesson;
    109 +  const safe = { ...lesson };
    110 +
    111 +  if (access === 'LOCKED' || access === 'DRIP_LOCKED') {
    112 +    ['content', 'content_json', 'text', 'content_text', 'body'].forEach((key) => {
    113 +      if (key in safe) safe[key] = null;
    114 +    });
    115 +    if ('video_url' in safe) safe.video_url = null;
    116 +    if ('audio_url' in safe) safe.audio_url = null;
    117 +    return safe;
    118 +  }
    119 +
    120 +  if (access === 'PREVIEW') {
    121 +    const maxChars = Math.min(
    122 +      Number.isFinite(previewChars) && previewChars > 0 ? previewChars : policy?.max_preview_chars || DEFAULT_P
         OLICY.max_preview_chars,
    123 +      policy?.max_preview_chars || DEFAULT_POLICY.max_preview_chars,
    124 +    );
    125 +    ['content', 'content_json', 'text', 'content_text', 'body'].forEach((key) => {
    126 +      if (key in safe) safe[key] = truncateString(safe[key], maxChars);
    127 +    });
    128 +    return safe;
    129 +  }
    130 +
    131 +  return safe;
    132 +}
    133 +
    134 +export async function applyLessonAccess({ env, schoolId, userEmail, lessons = [], previewChars = null }) {
    135 +  if (!Array.isArray(lessons) || lessons.length === 0) return lessons;
    136 +  const policy = await getPolicy(env, schoolId);
    137 +  const membership = await getMembership(env, schoolId, userEmail);
    138 +  const staff = isStaffRole(membership?.role);
    139 +  if (staff) return lessons;
    140 +
    141 +  const entitlements = await getActiveEntitlements(env, schoolId, userEmail);
    142 +
    143 +  return lessons.map((lesson) => {
    144 +    const courseAccess = hasCourseAccess(entitlements, lesson.course_id);
    145 +    let access = 'LOCKED';
    146 +    if (courseAccess) access = 'FULL';
    147 +    else if (policy?.allow_previews && lesson?.is_preview) access = 'PREVIEW';
    148 +
    149 +    if (access === 'FULL') {
    150 +      const enrollDate = getEnrollDate(entitlements, lesson.course_id);
    151 +      const drip = computeDripLock(lesson, enrollDate);
    152 +      if (drip.locked) {
    153 +        access = 'DRIP_LOCKED';
    154 +      }
    155 +    }
    156 +
    157 +    return sanitizeLesson(lesson, access, policy, previewChars);
    158 +  });
    159 +}
    160 +
    161 +function projectFields(record, fields) {
    162 +  if (!fields || fields.length === 0) return record;
    163 +  const allow = new Set(fields.map((field) => String(field)));
    164 +  allow.add('id');
    165 +  if (record?.school_id) allow.add('school_id');
    166 +  if (record?.user_email) allow.add('user_email');
    167 +  const out = {};
    168 +  allow.forEach((key) => {
    169 +    if (record && Object.prototype.hasOwnProperty.call(record, key)) {
    170 +      out[key] = record[key];
    171 +    }
    172 +  });
    173 +  return out;
    174 +}
    175 +
    176 +export function applyFieldProjection(records, fields) {
    177 +  if (!fields || fields.length === 0) return records;
    178 +  if (Array.isArray(records)) {
    179 +    return records.map((record) => projectFields(record, fields));
    180 +  }
    181 +  return projectFields(records, fields);
    182 +}
    183 +
    184 +async function getQuizMeta(env, schoolId, quizId) {
    185 +  if (!schoolId || !quizId) return null;
    186 +  const rows = await listEntities(env, 'Quiz', {
    187 +    filters: { school_id: String(schoolId), id: String(quizId) },
    188 +    limit: 1,
    189 +  });
    190 +  return rows?.[0] || null;
    191 +}
    192 +
    193 +function resolveQuizAccess({ quiz, entitlements, staff }) {
    194 +  if (!quiz) return 'LOCKED';
    195 +  if (staff) return 'FULL';
    196 +  if (!quiz.course_id) return 'FULL';
    197 +  const courseAccess = hasCourseAccess(entitlements, quiz.course_id);
    198 +  if (courseAccess) return 'FULL';
    199 +  const previewLimit = Number(quiz.preview_limit_questions || 0);
    200 +  return previewLimit > 0 ? 'PREVIEW' : 'LOCKED';
    201 +}
    202 +
    203 +export async function applyQuizQuestionAccess({ env, schoolId, userEmail, questions = [] }) {
    204 +  if (!Array.isArray(questions) || questions.length === 0) return questions;
    205 +  const membership = await getMembership(env, schoolId, userEmail);
    206 +  const staff = isStaffRole(membership?.role);
    207 +  if (staff) return questions;
    208 +
    209 +  const entitlements = await getActiveEntitlements(env, schoolId, userEmail);
    210 +  const grouped = new Map();
    211 +
    212 +  questions.forEach((question) => {
    213 +    const quizId = question?.quiz_id || question?.quizId || null;
    214 +    if (!quizId) return;
    215 +    if (!grouped.has(quizId)) grouped.set(quizId, []);
    216 +    grouped.get(quizId).push(question);
    217 +  });
    218 +
    219 +  const allowedQuestions = [];
    220 +  for (const [quizId, list] of grouped.entries()) {
    221 +    const quiz = await getQuizMeta(env, schoolId, quizId);
    222 +    const access = resolveQuizAccess({ quiz, entitlements, staff });
    223 +    if (access === 'LOCKED') continue;
    224 +    const sorted = [...list].sort((a, b) => (a?.question_index ?? 0) - (b?.question_index ?? 0));
    225 +    if (access === 'PREVIEW') {
    226 +      const limit = Math.max(0, Number(quiz?.preview_limit_questions || 0));
    227 +      allowedQuestions.push(...sorted.slice(0, limit || 0));
    228 +    } else {
    229 +      allowedQuestions.push(...sorted);
    230 +    }
    231 +  }
    232 +
    233 +  return allowedQuestions;
    234 +}

• Edited functions/api/entities/[entity].js (+40 -13)
      3  import { getUserFromToken } from '../_auth.js';
      4 +import { applyFieldProjection, applyLessonAccess, applyQuizQuestionAccess } from '../_access.js';
      5  import {
        ⋮
     62      const publicFilters = publicRule ? applyPublicRule(entity, filters) : null;
     63 +    const requiresAccessGate = entity === 'Lesson' || entity === 'QuizQuestion';
     64
        ⋮
     66        if (isPublicTokenLookup(entity, filters)) {
     65 -        try {
     66 -          const rows = await listEntities(env, entity, { filters, sort, limit, fields, previewChars });
     67 -          return json(rows, { env });
     68 -        } catch (err) {
     69 -          return errorResponse('storage_unavailable', 503, err.message, env);
     70 -        }
     67 +      try {
     68 +        const rows = await listEntities(env, entity, { filters, sort, limit, fields, previewChars });
     69 +        return json(rows, { env });
     70 +      } catch (err) {
     71 +        return errorResponse('storage_unavailable', 503, err.message, env);
     72        }
     73 +    }
     74        if (!publicRule || !publicFilters) {
        ⋮
    163            const safePreview = sanitizePublicPreviewChars(entity, previewChars);
    162 -          try {
    163 -            const rows = await listEntities(env, entity, { filters: publicFilters, sort, limit, fields: safeFie
         lds, previewChars: safePreview });
    164 -            return json(rows, { env });
    165 -          } catch (err) {
    166 -            return errorResponse('storage_unavailable', 503, err.message, env);
    167 -          }
    164 +        try {
    165 +          const rows = await listEntities(env, entity, { filters: publicFilters, sort, limit, fields: safeField
         s, previewChars: safePreview });
    166 +          return json(rows, { env });
    167 +        } catch (err) {
    168 +          return errorResponse('storage_unavailable', 503, err.message, env);
    169          }
    170 +      }
    171          if (!isMember) {
        ⋮
    180
    181 +    const rawFields = fields;
    182 +    const rawPreview = previewChars;
    183 +    const listFields = requiresAccessGate ? null : rawFields;
    184 +    const listPreviewChars = requiresAccessGate ? null : rawPreview;
    185 +
    186      try {
    180 -      const rows = await listEntities(env, entity, { filters, sort, limit, fields, previewChars });
    187 +      let rows = await listEntities(env, entity, { filters, sort, limit, fields: listFields, previewChars: list
         PreviewChars });
    188 +      if (!globalAdmin && requiresAccessGate) {
    189 +        if (entity === 'Lesson') {
    190 +          rows = await applyLessonAccess({
    191 +            env,
    192 +            schoolId: filters?.school_id,
    193 +            userEmail: user.email,
    194 +            lessons: rows,
    195 +            previewChars: rawPreview,
    196 +          });
    197 +        }
    198 +        if (entity === 'QuizQuestion') {
    199 +          rows = await applyQuizQuestionAccess({
    200 +            env,
    201 +            schoolId: filters?.school_id,
    202 +            userEmail: user.email,
    203 +            questions: rows,
    204 +          });
    205 +        }
    206 +        rows = applyFieldProjection(rows, rawFields);
    207 +      }
    208        return json(rows, { env });

• Edited functions/api/entities/[entity]/[id].js (+24 -0)
      3  import { getUserFromToken } from '../../_auth.js';
      4 +import { applyLessonAccess, applyQuizQuestionAccess } from '../../_access.js';
      5  import {
        ⋮
    121
    122 +    if (!globalAdmin && entity === 'Lesson') {
    123 +      const sanitized = await applyLessonAccess({
    124 +        env,
    125 +        schoolId: record.school_id,
    126 +        userEmail: user.email,
    127 +        lessons: [record],
    128 +      });
    129 +      return json(sanitized?.[0] || record, { env });
    130 +    }
    131 +
    132 +    if (!globalAdmin && entity === 'QuizQuestion') {
    133 +      const allowed = await applyQuizQuestionAccess({
    134 +        env,
    135 +        schoolId: record.school_id,
    136 +        userEmail: user.email,
    137 +        questions: [record],
    138 +      });
    139 +      if (!allowed?.length) {
    140 +        return errorResponse('forbidden', 403, 'Not authorized to access this quiz question', env);
    141 +      }
    142 +      return json(allowed[0], { env });
    143 +    }
    144 +
    145      return json(record, { env });

• Added functions/api/_audit.js (+136 -0)
      1 +function isTruthy(value) {
      2 +  return value !== undefined && value !== null;
      3 +}
      4 +
      5 +function buildEntry({ schoolId, userEmail, action, entityType, entityId, metadata }) {
      6 +  return {
      7 +    school_id: String(schoolId),
      8 +    user_email: userEmail || null,
      9 +    action,
     10 +    entity_type: entityType,
     11 +    entity_id: entityId,
     12 +    metadata: metadata || {},
     13 +    created_date: new Date().toISOString(),
     14 +  };
     15 +}
     16 +
     17 +function changed(before, after, key) {
     18 +  return isTruthy(before?.[key]) || isTruthy(after?.[key])
     19 +    ? before?.[key] !== after?.[key]
     20 +    : false;
     21 +}
     22 +
     23 +export function buildAuditEntries(entity, before, after, userEmail) {
     24 +  if (!entity || !before || !after) return [];
     25 +  const schoolId = after.school_id || before.school_id;
     26 +  if (!schoolId) return [];
     27 +
     28 +  const entries = [];
     29 +  const entityType = entity;
     30 +
     31 +  if (entity === 'Course') {
     32 +    if (changed(before, after, 'is_published')) {
     33 +      entries.push(buildEntry({
     34 +        schoolId,
     35 +        userEmail,
     36 +        action: after.is_published ? 'COURSE_PUBLISHED' : 'COURSE_UNPUBLISHED',
     37 +        entityType,
     38 +        entityId: after.id || before.id,
     39 +        metadata: { from: before.is_published, to: after.is_published },
     40 +      }));
     41 +    }
     42 +  }
     43 +
     44 +  if (entity === 'Lesson') {
     45 +    if (changed(before, after, 'status')) {
     46 +      entries.push(buildEntry({
     47 +        schoolId,
     48 +        userEmail,
     49 +        action: String(after.status || '').toLowerCase() === 'published' ? 'LESSON_PUBLISHED' : 'LESSON_UPDATED
         ',
     50 +        entityType,
     51 +        entityId: after.id || before.id,
     52 +        metadata: { from: before.status, to: after.status },
     53 +      }));
     54 +    }
     55 +  }
     56 +
     57 +  if (entity === 'Offer') {
     58 +    if (changed(before, after, 'price_cents') || changed(before, after, 'billing_interval')) {
     59 +      entries.push(buildEntry({
     60 +        schoolId,
     61 +        userEmail,
     62 +        action: 'OFFER_PRICE_CHANGED',
     63 +        entityType,
     64 +        entityId: after.id || before.id,
     65 +        metadata: {
     66 +          from: { price_cents: before.price_cents, billing_interval: before.billing_interval },
     67 +          to: { price_cents: after.price_cents, billing_interval: after.billing_interval },
     68 +        },
     69 +      }));
     70 +    }
     71 +    if (changed(before, after, 'is_active')) {
     72 +      entries.push(buildEntry({
     73 +        schoolId,
     74 +        userEmail,
     75 +        action: after.is_active ? 'OFFER_ACTIVATED' : 'OFFER_DEACTIVATED',
     76 +        entityType,
     77 +        entityId: after.id || before.id,
     78 +        metadata: { from: before.is_active, to: after.is_active },
     79 +      }));
     80 +    }
     81 +  }
     82 +
     83 +  if (entity === 'Coupon') {
     84 +    if (
     85 +      changed(before, after, 'discount_value')
     86 +      || changed(before, after, 'discount_type')
     87 +      || changed(before, after, 'expires_at')
     88 +    ) {
     89 +      entries.push(buildEntry({
     90 +        schoolId,
     91 +        userEmail,
     92 +        action: 'COUPON_UPDATED',
     93 +        entityType,
     94 +        entityId: after.id || before.id,
     95 +        metadata: {
     96 +          from: { discount_value: before.discount_value, discount_type: before.discount_type, expires_at: befor
         e.expires_at },
     97 +          to: { discount_value: after.discount_value, discount_type: after.discount_type, expires_at: after.exp
         ires_at },
     98 +        },
     99 +      }));
    100 +    }
    101 +    if (changed(before, after, 'is_active')) {
    102 +      entries.push(buildEntry({
    103 +        schoolId,
    104 +        userEmail,
    105 +        action: after.is_active ? 'COUPON_ACTIVATED' : 'COUPON_DEACTIVATED',
    106 +        entityType,
    107 +        entityId: after.id || before.id,
    108 +        metadata: { from: before.is_active, to: after.is_active },
    109 +      }));
    110 +    }
    111 +  }
    112 +
    113 +  if (entity === 'ContentProtectionPolicy') {
    114 +    entries.push(buildEntry({
    115 +      schoolId,
    116 +      userEmail,
    117 +      action: 'CONTENT_POLICY_UPDATED',
    118 +      entityType,
    119 +      entityId: after.id || before.id,
    120 +      metadata: {},
    121 +    }));
    122 +  }
    123 +
    124 +  if (entity === 'SchoolAuthPolicy') {
    125 +    entries.push(buildEntry({
    126 +      schoolId,
    127 +      userEmail,
    128 +      action: 'AUTH_POLICY_UPDATED',
    129 +      entityType,
    130 +      entityId: after.id || before.id,
    131 +      metadata: {},
    132 +    }));
    133 +  }
    134 +
    135 +  return entries;
    136 +}

• Edited functions/api/entities/[entity]/[id].js (+12 -1)
      1  import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../../_utils.js';
      2 -import { deleteEntity, listEntities, updateEntity } from '../../_store.js';
      2 +import { createEntity, deleteEntity, listEntities, updateEntity } from '../../_store.js';
      3  import { getUserFromToken } from '../../_auth.js';
      4  import { applyLessonAccess, applyQuizQuestionAccess } from '../../_access.js';
      5 +import { buildAuditEntries } from '../../_audit.js';
      6  import {
        ⋮
    193        }
    194 +      if (user?.email) {
    195 +        try {
    196 +          const entries = buildAuditEntries(entity, record, updated, user.email);
    197 +          for (const entry of entries || []) {
    198 +            await createEntity(env, 'AuditLog', entry);
    199 +          }
    200 +        } catch {
    201 +          // Best-effort audit logging
    202 +        }
    203 +      }
    204        return json(updated, { env });

• I'm planning to ensure the SSO start flow respects domain verification policies by checking if the school has any
  verified domains when require_domain_verification is true, and reject SSO if none exist. I'll add a helper to fetch
  verified domains and patch the start.js to enforce this before redirecting.

• Edited functions/api/auth/oidc/start.js (+16 -1)
      1  import { errorResponse, handleOptions, withHeaders } from '../../_utils.js';
      2 -import { createEntity } from '../../_store.js';
      2 +import { createEntity, listEntities } from '../../_store.js';
      3  import { getProviderConfig } from './_providers.js';
        ⋮
     67
     68 +async function getVerifiedDomains(env, schoolId) {
     69 +  if (!schoolId) return [];
     70 +  const rows = await listEntities(env, 'DomainVerification', {
     71 +    filters: { school_id: String(schoolId), status: 'verified' },
     72 +    limit: 200,
     73 +  });
     74 +  return (rows || []).map((row) => row.domain).filter(Boolean);
     75 +}
     76 +
     77  export async function onRequest({ request, env }) {
        ⋮
    109    }
    110 +  if (policy?.require_domain_verification) {
    111 +    const verified = await getVerifiedDomains(env, school?.id);
    112 +    if (!verified.length) {
    113 +      return redirectWithError('domain_unverified', 'School domain has not been verified', nextUrl, url.origin,
          env);
    114 +    }
    115 +  }
    116

• I'm outlining enhancements to AdvancedVideoPlayer by adding props like maxSeconds and onPreviewLimitReached to enforce
  video preview time limits, adjusting play controls and state accordingly. I'll also update LessonViewer to handle
  preview limit events, potentially showing a toast notification when limits are reached.

• Edited src/components/video/AdvancedVideoPlayer.jsx (+62 -46)
      1 -import React, { useState, useRef, useEffect } from 'react';
      1 +import React, { useState, useRef, useEffect, useMemo } from 'react';
      2  import { Button } from '@/components/ui/button';
        ⋮
     13
     14 -export default function AdvancedVideoPlayer({ src, onTimeUpdate, onEnded, initialTime = 0 }) {
     15 -  const videoRef = useRef(null);
     16 -  const containerRef = useRef(null);
     14 +export default function AdvancedVideoPlayer({ src, onTimeUpdate, onEnded, onPreviewLimitReached, initialTime =
         0, maxSeconds = null }) {
     15 +  const videoRef = useRef(null);
     16 +  const containerRef = useRef(null);
     17    const [isPlaying, setIsPlaying] = useState(false);
        ⋮
     25
     26 -  useEffect(() => {
     27 -    const video = videoRef.current;
     28 -    if (!video) return;
     29 -
     30 -    const handleTimeUpdate = () => {
     31 -      setCurrentTime(video.currentTime);
     32 -      onTimeUpdate?.(video.currentTime);
     33 -    };
     26 +  const effectiveDuration = useMemo(() => {
     27 +    if (!Number.isFinite(maxSeconds) || maxSeconds <= 0) return duration;
     28 +    return Math.min(duration || 0, maxSeconds);
     29 +  }, [duration, maxSeconds]);
     30 +
     31 +  useEffect(() => {
     32 +    const video = videoRef.current;
     33 +    if (!video) return;
     34 +
     35 +    const handleTimeUpdate = () => {
     36 +      const nextTime = video.currentTime;
     37 +      if (Number.isFinite(maxSeconds) && maxSeconds > 0 && nextTime >= maxSeconds) {
     38 +        video.pause();
     39 +        video.currentTime = maxSeconds;
     40 +        setIsPlaying(false);
     41 +        setCurrentTime(maxSeconds);
     42 +        onPreviewLimitReached?.();
     43 +        return;
     44 +      }
     45 +      setCurrentTime(nextTime);
     46 +      onTimeUpdate?.(nextTime);
     47 +    };
     48
        ⋮
     64
     51 -    return () => {
     52 -      video.removeEventListener('timeupdate', handleTimeUpdate);
     53 -      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
     54 -      video.removeEventListener('ended', handleEnded);
     55 -    };
     56 -  }, [initialTime, onTimeUpdate, onEnded]);
     65 +    return () => {
     66 +      video.removeEventListener('timeupdate', handleTimeUpdate);
     67 +      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
     68 +      video.removeEventListener('ended', handleEnded);
     69 +    };
     70 +  }, [initialTime, onTimeUpdate, onEnded, maxSeconds, onPreviewLimitReached]);
     71
        ⋮
    134
    121 -  const skip = (seconds) => {
    122 -    if (videoRef.current) {
    123 -      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    124 -    }
    125 -  };
    126 -
    127 -  const handleSeek = (value) => {
    128 -    if (videoRef.current) {
    129 -      const newTime = (value[0] / 100) * duration;
    130 -      videoRef.current.currentTime = newTime;
    131 -      setCurrentTime(newTime);
    132 -    }
    133 -  };
    135 +  const skip = (seconds) => {
    136 +    if (videoRef.current) {
    137 +      const maxTime = Number.isFinite(maxSeconds) && maxSeconds > 0 ? maxSeconds : duration;
    138 +      videoRef.current.currentTime = Math.max(0, Math.min(maxTime, currentTime + seconds));
    139 +    }
    140 +  };
    141 +
    142 +  const handleSeek = (value) => {
    143 +    if (videoRef.current) {
    144 +      const maxTime = Number.isFinite(maxSeconds) && maxSeconds > 0 ? maxSeconds : duration;
    145 +      const newTime = (value[0] / 100) * maxTime;
    146 +      videoRef.current.currentTime = newTime;
    147 +      setCurrentTime(newTime);
    148 +    }
    149 +  };
    150
        ⋮
    182
    167 -  const formatTime = (seconds) => {
    168 -    const h = Math.floor(seconds / 3600);
    183 +  const formatTime = (seconds) => {
    184 +    const h = Math.floor(seconds / 3600);
    185      const m = Math.floor((seconds % 3600) / 60);
        ⋮
    193
    178 -  return (
    194 +  return (
    195      <div
        ⋮
    227            {/* Progress Bar */}
    212 -          <Slider
    213 -            value={[duration ? (currentTime / duration) * 100 : 0]}
    214 -            onValueChange={handleSeek}
    215 -            max={100}
    216 -            step={0.1}
    217 -            className="cursor-pointer"
    218 -          />
    228 +          <Slider
    229 +            value={[effectiveDuration ? (currentTime / effectiveDuration) * 100 : 0]}
    230 +            onValueChange={handleSeek}
    231 +            max={100}
    232 +            step={0.1}
    233 +            className="cursor-pointer"
    234 +          />
    235
        ⋮
    299                {/* Time */}
    284 -              <span className="text-white text-sm font-medium">
    285 -                {formatTime(currentTime)} / {formatTime(duration)}
    286 -              </span>
    287 -            </div>
    300 +              <span className="text-white text-sm font-medium">
    301 +                {formatTime(currentTime)} / {formatTime(effectiveDuration)}
    302 +              </span>
    303 +            </div>
    304
        ⋮
    355    );
    340 -}
    356 +}

• Edited src/components/video/AdvancedVideoPlayer.jsx (+7 -6)
    48
    49 -    const handleLoadedMetadata = () => {
    50 -      setDuration(video.duration);
    51 -      if (initialTime > 0) {
    52 -        video.currentTime = initialTime;
    53 -      }
    54 -    };
    49 +    const handleLoadedMetadata = () => {
    50 +      setDuration(video.duration);
    51 +      if (initialTime > 0) {
    52 +        const maxTime = Number.isFinite(maxSeconds) && maxSeconds > 0 ? maxSeconds : video.duration;
    53 +        video.currentTime = Math.min(initialTime, maxTime);
    54 +      }
    55 +    };
    56

• Edited src/pages/LessonViewer.jsx (+37 -27)
     51      'video_url',
     52 +    'video_stream_id',
     53      'audio_url',
        ⋮
    179    // Access control (computed above)
    179 -  const canFetchMaterials = shouldFetchMaterials(access.accessLevel);
    180 -  const rawContent = String(lesson?.content || lesson?.content_json || lesson?.text || '');
    180 +  const canFetchMaterials = shouldFetchMaterials(access.accessLevel);
    181 +  const rawContent = String(lesson?.content || lesson?.content_json || lesson?.text || '');
    182    const maxChars = access.maxPreviewChars || 1500;
        ⋮
    256
    256 -  if (!lesson || !course) {
    257 +  if (!lesson || !course) {
    258      return (
        ⋮
    265
    265 -  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    266 +  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    267    const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
        ⋮
    269
    269 -  return (
    270 +  const videoUrl = lesson?.video_url
    271 +    || (lesson?.video_stream_id ? `https://videodelivery.net/${lesson.video_stream_id}/downloads/default.mp4` :
          null);
    272 +
    273 +  return (
    274      <div className={tokens.page.content}>
        ⋮
    300        {/* Video/Audio Player */}
    297 -      {canFetchMaterials && lesson.video_url && (
    298 -        <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50">
    299 -          <AdvancedVideoPlayer
    300 -            src={lesson.video_url}
    301 -            onTimeUpdate={(time) => {
    302 -              // Auto-save progress
    303 -              if (progress) {
    304 -                scopedUpdate('UserProgress', progress.id, {
    305 -                  last_position_seconds: Math.floor(time)
    306 -                }, activeSchoolId, true);
    307 -              }
    308 -            }}
    309 -            onEnded={() => {
    310 -              // Auto-complete lesson when video ends
    311 -              if (!progress?.completed) {
    312 -                markCompleteMutation.mutate();
    313 -              }
    314 -            }}
    315 -            initialTime={progress?.last_position_seconds || 0}
    316 -          />
    317 -        </div>
    318 -      )}
    301 +      {canFetchMaterials && videoUrl && (
    302 +        <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50">
    303 +          <AdvancedVideoPlayer
    304 +            src={videoUrl}
    305 +            onTimeUpdate={(time) => {
    306 +              // Auto-save progress
    307 +              if (progress) {
    308 +                scopedUpdate('UserProgress', progress.id, {
    309 +                  last_position_seconds: Math.floor(time)
    310 +                }, activeSchoolId, true);
    311 +              }
    312 +            }}
    313 +            onEnded={() => {
    314 +              // Auto-complete lesson when video ends
    315 +              if (!progress?.completed) {
    316 +                markCompleteMutation.mutate();
    317 +              }
    318 +            }}
    319 +            onPreviewLimitReached={() => {
    320 +              if (access.accessLevel === 'PREVIEW') {
    321 +                toast.info('Preview limit reached. Unlock full access to continue.');
    322 +              }
    323 +            }}
    326 +          />
    327 +        </div>
    328 +      )}
    329

• Edited src/components/materials/materialsEngine.jsx (+5 -1)
    27        fields: ['id', 'school_id', 'course_id', 'content', 'video_url', 'audio_url', 'duration_seconds']
    28 +      fields: ['id', 'school_id', 'course_id', 'content', 'video_url', 'video_stream_id', 'audio_url', 'duration
        _seconds']
    29      });
       ⋮
    37 +      || (lesson.video_stream_id ? `https://videodelivery.net/${lesson.video_stream_id}/downloads/default.mp4` :
         null);
    38 +
    39      return {
    40        content_text: lesson.content || '',
    42        audio_url: lesson.audio_url,

• Ran Get-Content -Path src\components\materials\materialsEngine.jsx
  └ /**
     * Materials Retrieval Engine
    … +119 lines
      }
    }

• Edited src/components/materials/materialsEngine.jsx (+0 -1)
    26      const lessons = await scopedFilter('Lesson', school_id, { id: lesson_id }, null, 1, {
    27 -      fields: ['id', 'school_id', 'course_id', 'content', 'video_url', 'audio_url', 'duration_seconds']
    27        fields: ['id', 'school_id', 'course_id', 'content', 'video_url', 'video_stream_id', 'audio_url', 'duration
        _seconds']

• Ran Get-Content -Path src\pages\LessonViewerPremium.jsx
  └ import React, { useState, useEffect, useMemo, useRef } from 'react';
    import { base44 } from '@/api/base44Client';
    … +355 lines
      );
    }

• Ran Get-Content -Path src\components\learning\PremiumVideoPlayer.jsx
  └ import React, { useState, useEffect, useRef } from 'react';
    import { useQueryClient } from '@tanstack/react-query';
    … +270 lines
      );
    }

• Edited src/pages/LessonViewerPremium.jsx (+1 -0)
    54      'video_url',
    55 +    'video_stream_id',
    56      'audio_url',

• Edited src/components/learning/PremiumVideoPlayer.jsx (+28 -27)
      8
      9 -export default function PremiumVideoPlayer({ lesson, progress, user, accessLevel = 'FULL', maxPreviewSeconds =
         90, onProgressUpdate }) {
     10 -  const videoRef = useRef(null);
     11 -  const [playing, setPlaying] = useState(false);
     12 -  const [currentTime, setCurrentTime] = useState(0);
     13 -  const [duration, setDuration] = useState(0);
     14 -  const effectiveDuration = (accessLevel === 'PREVIEW' && maxPreviewSeconds)
     15 -    ? Math.min(duration || 0, maxPreviewSeconds)
     16 -    : (duration || 0);
      9 +export default function PremiumVideoPlayer({ lesson, progress, user, accessLevel = 'FULL', maxPreviewSeconds =
         90, onProgressUpdate }) {
     10 +  const videoRef = useRef(null);
     11 +  const [playing, setPlaying] = useState(false);
     12 +  const [currentTime, setCurrentTime] = useState(0);
     13 +  const [duration, setDuration] = useState(0);
     14 +  const [previewEnded, setPreviewEnded] = useState(false);
     15 +  const effectiveDuration = (accessLevel === 'PREVIEW' && maxPreviewSeconds)
     16 +    ? Math.min(duration || 0, maxPreviewSeconds)
     17 +    : (duration || 0);
     18    const [volume, setVolume] = useState(1);
        ⋮
     30
     30 -  useEffect(() => {
     31 -    const video = videoRef.current;
     32 -    if (!video) return;
     31 +  useEffect(() => {
     32 +    const video = videoRef.current;
     33 +    if (!video) return;
     34
        ⋮
     41          setPlaying(false);
     41 -        if (!previewEnded) {
     42 -          setPreviewEnded(true);
     43 -          toast.info('Preview ended. Enroll to continue.');
     44 -        }
     45 -        return;
     46 -      }
     42 +        if (!previewEnded) {
     43 +          setPreviewEnded(true);
     44 +          toast.info('Preview ended. Enroll to continue.');
     45 +        }
     46 +        return;
     47 +      }
     48
        ⋮
     67      };
     67 -  }, []);
     68 +  }, [accessLevel, maxPreviewSeconds, previewEnded]);
     69
        ⋮
    161
    161 -  return (
    162 -    <div className="relative bg-black rounded-lg overflow-hidden">
    163 -      <video
    164 -        ref={videoRef}
    165 -        src={lesson.video_url}
    166 -        className="w-full aspect-video"
    167 -        onPlay={() => setPlaying(true)}
    168 -        onPause={() => setPlaying(false)}
    169 -      />
    162 +  return (
    163 +    <div className="relative bg-black rounded-lg overflow-hidden">
    164 +      <video
    165 +        ref={videoRef}
    166 +        src={lesson.video_url || (lesson.video_stream_id ? `https://videodelivery.net/${lesson.video_stream_id}
         /downloads/default.mp4` : '')}
    167 +        className="w-full aspect-video"
    168 +        onPlay={() => setPlaying(true)}
    169 +        onPause={() => setPlaying(false)}
    170 +      />
    171

• I’m outlining the plan to build OAuth integration endpoints for Google and Microsoft in the API, including start,
  callback, and disconnect routes. I’m also preparing helper functions to manage admin role checks and entity storage
  for integration connections and secrets, aiming for maintainability but allowing some duplication for speed. Next,
  I’ll proceed with implementing the Google integration start endpoint.

• Added functions/api/integrations/google/start.js (+148 -0)
      1 +import { errorResponse, getBearerToken, handleOptions, withHeaders } from '../../_utils.js';
      2 +import { createEntity, listEntities } from '../../_store.js';
      3 +import { getUserFromToken } from '../../_auth.js';
      4 +import { hasMembership, isGlobalAdmin } from '../../_tenancy.js';
      5 +
      6 +const STATE_TTL_MINUTES = 10;
      7 +
      8 +const PROVIDERS = {
      9 +  classroom: {
     10 +    id: 'google_classroom',
     11 +    scopes: [
     12 +      'https://www.googleapis.com/auth/classroom.courses.readonly',
     13 +      'https://www.googleapis.com/auth/classroom.rosters.readonly',
     14 +      'https://www.googleapis.com/auth/classroom.coursework.me',
     15 +      'https://www.googleapis.com/auth/classroom.coursework.students',
     16 +      'https://www.googleapis.com/auth/classroom.profile.emails',
     17 +    ],
     18 +  },
     19 +  drive: {
     20 +    id: 'google_drive',
     21 +    scopes: [
     22 +      'https://www.googleapis.com/auth/drive.file',
     23 +      'https://www.googleapis.com/auth/drive.metadata.readonly',
     24 +    ],
     25 +  },
     26 +};
     27 +
     28 +function nowIso() {
     29 +  return new Date().toISOString();
     30 +}
     31 +
     32 +function normalizeProvider(raw) {
     33 +  const value = String(raw || '').toLowerCase();
     34 +  if (value.includes('classroom')) return 'classroom';
     35 +  if (value.includes('drive')) return 'drive';
     36 +  return null;
     37 +}
     38 +
     39 +function getConfig(env, origin) {
     40 +  const clientId = env?.GOOGLE_INTEGRATION_CLIENT_ID || '';
     41 +  const clientSecret = env?.GOOGLE_INTEGRATION_CLIENT_SECRET || '';
     42 +  if (!clientId || !clientSecret) return null;
     43 +  const redirectUri = env?.GOOGLE_INTEGRATION_REDIRECT_URI || new URL('/api/integrations/google/callback', orig
         in).toString();
     44 +  return { clientId, clientSecret, redirectUri };
     45 +}
     46 +
     47 +async function getMembershipRole(env, schoolId, email) {
     48 +  if (!schoolId || !email) return null;
     49 +  const rows = await listEntities(env, 'SchoolMembership', {
     50 +    filters: { school_id: String(schoolId), user_email: String(email) },
     51 +    limit: 1,
     52 +  });
     53 +  return rows?.[0]?.role || null;
     54 +}
     55 +
     56 +function isAdminRole(role) {
     57 +  const normalized = String(role || '').toUpperCase();
     58 +  return ['OWNER', 'ADMIN', 'SUPERADMIN'].includes(normalized);
     59 +}
     60 +
     61 +function normalizeNext(next, origin) {
     62 +  if (!next) return new URL('/admin?tab=integrations', origin).toString();
     63 +  try {
     64 +    const url = new URL(next, origin);
     65 +    if (url.origin !== origin) return new URL('/admin?tab=integrations', origin).toString();
     66 +    return url.toString();
     67 +  } catch {
     68 +    return new URL('/admin?tab=integrations', origin).toString();
     69 +  }
     70 +}
     71 +
     72 +export async function onRequest({ request, env }) {
     73 +  const options = handleOptions(request, env);
     74 +  if (options) return options;
     75 +
     76 +  if (request.method !== 'GET') {
     77 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
     78 +  }
     79 +
     80 +  const token = getBearerToken(request);
     81 +  const user = await getUserFromToken(token, env);
     82 +  if (!user?.email) {
     83 +    return errorResponse('auth_required', 401, 'Authentication required', env);
     84 +  }
     85 +
     86 +  const url = new URL(request.url);
     87 +  const schoolId = url.searchParams.get('school_id') || url.searchParams.get('schoolId');
     88 +  const rawProvider = url.searchParams.get('provider');
     89 +  const providerKey = normalizeProvider(rawProvider);
     90 +  const nextUrl = normalizeNext(url.searchParams.get('return_url') || url.searchParams.get('next'), url.origin)
         ;
     91 +
     92 +  if (!schoolId) {
     93 +    return errorResponse('missing_school', 400, 'school_id is required', env);
     94 +  }
     95 +  if (!providerKey || !PROVIDERS[providerKey]) {
     96 +    return errorResponse('invalid_provider', 400, 'Unsupported provider', env);
     97 +  }
     98 +
     99 +  const globalAdmin = isGlobalAdmin(user, env);
    100 +  if (!globalAdmin) {
    101 +    const member = await hasMembership(env, schoolId, user.email);
    102 +    if (!member) {
    103 +      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    104 +    }
    105 +    const role = await getMembershipRole(env, schoolId, user.email);
    106 +    if (!isAdminRole(role)) {
    107 +      return errorResponse('forbidden', 403, 'Admin role required', env);
    108 +    }
    109 +  }
    110 +
    111 +  const config = getConfig(env, url.origin);
    112 +  if (!config) {
    113 +    return errorResponse('not_configured', 500, 'Google integration credentials not configured', env);
    114 +  }
    115 +
    116 +  const state = crypto.randomUUID();
    117 +  const expiresAt = new Date(Date.now() + STATE_TTL_MINUTES * 60 * 1000).toISOString();
    118 +  const scopes = PROVIDERS[providerKey].scopes.join(' ');
    119 +
    120 +  await createEntity(env, 'IntegrationState', {
    121 +    id: state,
    122 +    provider: PROVIDERS[providerKey].id,
    123 +    school_id: String(schoolId),
    124 +    user_email: user.email,
    125 +    requested_at: nowIso(),
    126 +    expires_at: expiresAt,
    127 +    return_url: nextUrl,
    128 +    scopes,
    129 +  });
    130 +
    131 +  const authorize = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    132 +  authorize.searchParams.set('client_id', config.clientId);
    133 +  authorize.searchParams.set('redirect_uri', config.redirectUri);
    134 +  authorize.searchParams.set('response_type', 'code');
    135 +  authorize.searchParams.set('scope', scopes);
    136 +  authorize.searchParams.set('state', state);
    137 +  authorize.searchParams.set('access_type', 'offline');
    138 +  authorize.searchParams.set('prompt', 'consent');
    139 +  authorize.searchParams.set('include_granted_scopes', 'true');
    140 +
    141 +  return new Response(null, {
    142 +    status: 302,
    143 +    headers: {
    144 +      ...withHeaders(null, env),
    145 +      Location: authorize.toString(),
    146 +    },
    147 +  });
    148 +}

⚠ Heads up, you have less than 10% of your 5h limit left. Run /status for a breakdown.

• Added functions/api/integrations/google/callback.js (+154 -0)
      1 +import { errorResponse, handleOptions, withHeaders } from '../../_utils.js';
      2 +import { createEntity, listEntities, updateEntity } from '../../_store.js';
      3 +import { getUserFromToken } from '../../_auth.js';
      4 +
      5 +function nowIso() {
      6 +  return new Date().toISOString();
      7 +}
      8 +
      9 +function getConfig(env, origin) {
     10 +  const clientId = env?.GOOGLE_INTEGRATION_CLIENT_ID || '';
     11 +  const clientSecret = env?.GOOGLE_INTEGRATION_CLIENT_SECRET || '';
     12 +  if (!clientId || !clientSecret) return null;
     13 +  const redirectUri = env?.GOOGLE_INTEGRATION_REDIRECT_URI || new URL('/api/integrations/google/callback', orig
         in).toString();
     14 +  return { clientId, clientSecret, redirectUri };
     15 +}
     16 +
     17 +function normalizeNext(nextUrl, origin) {
     18 +  if (!nextUrl) return new URL('/admin?tab=integrations', origin).toString();
     19 +  try {
     20 +    const url = new URL(nextUrl, origin);
     21 +    if (url.origin !== origin) return new URL('/admin?tab=integrations', origin).toString();
     22 +    return url.toString();
     23 +  } catch {
     24 +    return new URL('/admin?tab=integrations', origin).toString();
     25 +  }
     26 +}
     27 +
     28 +async function exchangeCode(config, code) {
     29 +  const body = new URLSearchParams();
     30 +  body.set('client_id', config.clientId);
     31 +  body.set('client_secret', config.clientSecret);
     32 +  body.set('grant_type', 'authorization_code');
     33 +  body.set('code', code);
     34 +  body.set('redirect_uri', config.redirectUri);
     35 +
     36 +  const response = await fetch('https://oauth2.googleapis.com/token', {
     37 +    method: 'POST',
     38 +    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
     39 +    body: body.toString(),
     40 +  });
     41 +
     42 +  const data = await response.json().catch(() => null);
     43 +  if (!response.ok) {
     44 +    const error = new Error(data?.error_description || data?.error || 'Token exchange failed');
     45 +    error.status = response.status;
     46 +    throw error;
     47 +  }
     48 +  return data;
     49 +}
     50 +
     51 +async function upsertIntegrationConnection(env, state, tokenResponse) {
     52 +  const id = `${state.school_id}:${state.provider}`;
     53 +  const existing = await listEntities(env, 'IntegrationConnection', {
     54 +    filters: { id },
     55 +    limit: 1,
     56 +  });
     57 +  const payload = {
     58 +    id,
     59 +    school_id: state.school_id,
     60 +    provider: state.provider,
     61 +    status: 'connected',
     62 +    scopes: tokenResponse.scope || state.scopes,
     63 +    connected_at: nowIso(),
     64 +    updated_at: nowIso(),
     65 +    access_expires_at: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOS
         tring() : null,
     66 +  };
     67 +  if (existing?.[0]) {
     68 +    await updateEntity(env, 'IntegrationConnection', existing[0].id, payload);
     69 +    return existing[0].id;
     70 +  }
     71 +  const created = await createEntity(env, 'IntegrationConnection', payload);
     72 +  return created?.id || id;
     73 +}
     74 +
     75 +async function upsertIntegrationSecret(env, state, tokenResponse) {
     76 +  const id = `${state.school_id}:${state.provider}`;
     77 +  const existing = await listEntities(env, 'IntegrationSecret', {
     78 +    filters: { id },
     79 +    limit: 1,
     80 +  });
     81 +  const payload = {
     82 +    id,
     83 +    school_id: state.school_id,
     84 +    provider: state.provider,
     85 +    token_type: tokenResponse.token_type || 'Bearer',
     86 +    access_token: tokenResponse.access_token || null,
     87 +    refresh_token: tokenResponse.refresh_token || existing?.[0]?.refresh_token || null,
     88 +    scope: tokenResponse.scope || state.scopes,
     89 +    expires_at: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
          : null,
     90 +    updated_at: nowIso(),
     91 +  };
     92 +  if (existing?.[0]) {
     93 +    await updateEntity(env, 'IntegrationSecret', existing[0].id, payload);
     94 +    return existing[0].id;
     95 +  }
     96 +  const created = await createEntity(env, 'IntegrationSecret', payload);
     97 +  return created?.id || id;
     98 +}
     99 +
    100 +export async function onRequest({ request, env }) {
    101 +  const options = handleOptions(request, env);
    102 +  if (options) return options;
    103 +
    104 +  if (request.method !== 'GET') {
    105 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
    106 +  }
    107 +
    108 +  const url = new URL(request.url);
    109 +  const code = url.searchParams.get('code');
    110 +  const stateId = url.searchParams.get('state');
    111 +  if (!code || !stateId) {
    112 +    return errorResponse('missing_code', 400, 'Missing authorization code', env);
    113 +  }
    114 +
    115 +  const config = getConfig(env, url.origin);
    116 +  if (!config) {
    117 +    return errorResponse('not_configured', 500, 'Google integration credentials not configured', env);
    118 +  }
    119 +
    120 +  const stateRows = await listEntities(env, 'IntegrationState', {
    121 +    filters: { id: String(stateId) },
    122 +    limit: 1,
    123 +  });
    124 +  const state = stateRows?.[0];
    125 +  if (!state || state.used_at || state.revoked_at) {
    126 +    return errorResponse('invalid_state', 400, 'Integration state expired', env);
    127 +  }
    128 +
    129 +  let tokenResponse = null;
    130 +  try {
    131 +    tokenResponse = await exchangeCode(config, code);
    132 +  } catch (error) {
    133 +    return errorResponse('token_exchange_failed', error.status || 500, error.message, env);
    134 +  }
    135 +
    136 +  await upsertIntegrationSecret(env, state, tokenResponse);
    137 +  await upsertIntegrationConnection(env, state, tokenResponse);
    138 +
    139 +  await updateEntity(env, 'IntegrationState', state.id, {
    140 +    used_at: nowIso(),
    141 +  });
    142 +
    143 +  const nextUrl = normalizeNext(state.return_url, url.origin);
    144 +  const redirect = new URL(nextUrl, url.origin);
    145 +  redirect.searchParams.set('integration', state.provider);
    146 +
    147 +  return new Response(null, {
    148 +    status: 302,
    149 +    headers: {
    150 +      ...withHeaders(null, env),
    151 +      Location: redirect.toString(),
    152 +    },
    153 +  });
    154 +}

• Edited functions/api/integrations/google/callback.js (+0 -1)
    2  import { createEntity, listEntities, updateEntity } from '../../_store.js';
    3 -import { getUserFromToken } from '../../_auth.js';
    3

• Added functions/api/integrations/microsoft/start.js (+146 -0)
      1 +import { errorResponse, getBearerToken, handleOptions, withHeaders } from '../../_utils.js';
      2 +import { createEntity, listEntities } from '../../_store.js';
      3 +import { getUserFromToken } from '../../_auth.js';
      4 +import { hasMembership, isGlobalAdmin } from '../../_tenancy.js';
      5 +
      6 +const STATE_TTL_MINUTES = 10;
      7 +
      8 +const PROVIDERS = {
      9 +  onedrive: {
     10 +    id: 'microsoft_onedrive',
     11 +    scopes: [
     12 +      'openid',
     13 +      'offline_access',
     14 +      'User.Read',
     15 +      'Files.ReadWrite.All',
     16 +      'Sites.Read.All',
     17 +    ],
     18 +  },
     19 +};
     20 +
     21 +function nowIso() {
     22 +  return new Date().toISOString();
     23 +}
     24 +
     25 +function normalizeProvider(raw) {
     26 +  const value = String(raw || '').toLowerCase();
     27 +  if (value.includes('drive') || value.includes('onedrive') || value.includes('sharepoint')) {
     28 +    return 'onedrive';
     29 +  }
     30 +  return null;
     31 +}
     32 +
     33 +function getTenant(env) {
     34 +  return String(env?.MICROSOFT_GRAPH_TENANT || 'common');
     35 +}
     36 +
     37 +function getConfig(env, origin) {
     38 +  const clientId = env?.MICROSOFT_GRAPH_CLIENT_ID || '';
     39 +  const clientSecret = env?.MICROSOFT_GRAPH_CLIENT_SECRET || '';
     40 +  if (!clientId || !clientSecret) return null;
     41 +  const redirectUri = env?.MICROSOFT_GRAPH_REDIRECT_URI || new URL('/api/integrations/microsoft/callback', orig
         in).toString();
     42 +  return { clientId, clientSecret, redirectUri };
     43 +}
     44 +
     45 +async function getMembershipRole(env, schoolId, email) {
     46 +  if (!schoolId || !email) return null;
     47 +  const rows = await listEntities(env, 'SchoolMembership', {
     48 +    filters: { school_id: String(schoolId), user_email: String(email) },
     49 +    limit: 1,
     50 +  });
     51 +  return rows?.[0]?.role || null;
     52 +}
     53 +
     54 +function isAdminRole(role) {
     55 +  const normalized = String(role || '').toUpperCase();
     56 +  return ['OWNER', 'ADMIN', 'SUPERADMIN'].includes(normalized);
     57 +}
     58 +
     59 +function normalizeNext(next, origin) {
     60 +  if (!next) return new URL('/admin?tab=integrations', origin).toString();
     61 +  try {
     62 +    const url = new URL(next, origin);
     63 +    if (url.origin !== origin) return new URL('/admin?tab=integrations', origin).toString();
     64 +    return url.toString();
     65 +  } catch {
     66 +    return new URL('/admin?tab=integrations', origin).toString();
     67 +  }
     68 +}
     69 +
     70 +export async function onRequest({ request, env }) {
     71 +  const options = handleOptions(request, env);
     72 +  if (options) return options;
     73 +
     74 +  if (request.method !== 'GET') {
     75 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
     76 +  }
     77 +
     78 +  const token = getBearerToken(request);
     79 +  const user = await getUserFromToken(token, env);
     80 +  if (!user?.email) {
     81 +    return errorResponse('auth_required', 401, 'Authentication required', env);
     82 +  }
     83 +
     84 +  const url = new URL(request.url);
     85 +  const schoolId = url.searchParams.get('school_id') || url.searchParams.get('schoolId');
     86 +  const rawProvider = url.searchParams.get('provider');
     87 +  const providerKey = normalizeProvider(rawProvider);
     88 +  const nextUrl = normalizeNext(url.searchParams.get('return_url') || url.searchParams.get('next'), url.origin)
         ;
     89 +
     90 +  if (!schoolId) {
     91 +    return errorResponse('missing_school', 400, 'school_id is required', env);
     92 +  }
     93 +  if (!providerKey || !PROVIDERS[providerKey]) {
     94 +    return errorResponse('invalid_provider', 400, 'Unsupported provider', env);
     95 +  }
     96 +
     97 +  const globalAdmin = isGlobalAdmin(user, env);
     98 +  if (!globalAdmin) {
     99 +    const member = await hasMembership(env, schoolId, user.email);
    100 +    if (!member) {
    101 +      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    102 +    }
    103 +    const role = await getMembershipRole(env, schoolId, user.email);
    104 +    if (!isAdminRole(role)) {
    105 +      return errorResponse('forbidden', 403, 'Admin role required', env);
    106 +    }
    107 +  }
    108 +
    109 +  const config = getConfig(env, url.origin);
    110 +  if (!config) {
    111 +    return errorResponse('not_configured', 500, 'Microsoft integration credentials not configured', env);
    112 +  }
    113 +
    114 +  const state = crypto.randomUUID();
    115 +  const expiresAt = new Date(Date.now() + STATE_TTL_MINUTES * 60 * 1000).toISOString();
    116 +  const scopes = PROVIDERS[providerKey].scopes.join(' ');
    117 +
    118 +  await createEntity(env, 'IntegrationState', {
    119 +    id: state,
    120 +    provider: PROVIDERS[providerKey].id,
    121 +    school_id: String(schoolId),
    122 +    user_email: user.email,
    123 +    requested_at: nowIso(),
    124 +    expires_at: expiresAt,
    125 +    return_url: nextUrl,
    126 +    scopes,
    127 +  });
    128 +
    129 +  const tenant = getTenant(env);
    130 +  const authorize = new URL(`https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/author
         ize`);
    131 +  authorize.searchParams.set('client_id', config.clientId);
    132 +  authorize.searchParams.set('redirect_uri', config.redirectUri);
    133 +  authorize.searchParams.set('response_type', 'code');
    134 +  authorize.searchParams.set('response_mode', 'query');
    135 +  authorize.searchParams.set('scope', scopes);
    136 +  authorize.searchParams.set('state', state);
    137 +  authorize.searchParams.set('prompt', 'consent');
    138 +
    139 +  return new Response(null, {
    140 +    status: 302,
    141 +    headers: {
    142 +      ...withHeaders(null, env),
    143 +      Location: authorize.toString(),
    144 +    },
    145 +  });
    146 +}

• Added functions/api/integrations/microsoft/callback.js (+157 -0)
      1 +import { errorResponse, handleOptions, withHeaders } from '../../_utils.js';
      2 +import { createEntity, listEntities, updateEntity } from '../../_store.js';
      3 +
      4 +function nowIso() {
      5 +  return new Date().toISOString();
      6 +}
      7 +
      8 +function getTenant(env) {
      9 +  return String(env?.MICROSOFT_GRAPH_TENANT || 'common');
     10 +}
     11 +
     12 +function getConfig(env, origin) {
     13 +  const clientId = env?.MICROSOFT_GRAPH_CLIENT_ID || '';
     14 +  const clientSecret = env?.MICROSOFT_GRAPH_CLIENT_SECRET || '';
     15 +  if (!clientId || !clientSecret) return null;
     16 +  const redirectUri = env?.MICROSOFT_GRAPH_REDIRECT_URI || new URL('/api/integrations/microsoft/callback', orig
         in).toString();
     17 +  return { clientId, clientSecret, redirectUri };
     18 +}
     19 +
     20 +function normalizeNext(nextUrl, origin) {
     21 +  if (!nextUrl) return new URL('/admin?tab=integrations', origin).toString();
     22 +  try {
     23 +    const url = new URL(nextUrl, origin);
     24 +    if (url.origin !== origin) return new URL('/admin?tab=integrations', origin).toString();
     25 +    return url.toString();
     26 +  } catch {
     27 +    return new URL('/admin?tab=integrations', origin).toString();
     28 +  }
     29 +}
     30 +
     31 +async function exchangeCode(config, tenant, code) {
     32 +  const body = new URLSearchParams();
     33 +  body.set('client_id', config.clientId);
     34 +  body.set('client_secret', config.clientSecret);
     35 +  body.set('grant_type', 'authorization_code');
     36 +  body.set('code', code);
     37 +  body.set('redirect_uri', config.redirectUri);
     38 +
     39 +  const response = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/tok
         en`, {
     40 +    method: 'POST',
     41 +    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
     42 +    body: body.toString(),
     43 +  });
     44 +
     45 +  const data = await response.json().catch(() => null);
     46 +  if (!response.ok) {
     47 +    const error = new Error(data?.error_description || data?.error || 'Token exchange failed');
     48 +    error.status = response.status;
     49 +    throw error;
     50 +  }
     51 +  return data;
     52 +}
     53 +
     54 +async function upsertIntegrationConnection(env, state, tokenResponse) {
     55 +  const id = `${state.school_id}:${state.provider}`;
     56 +  const existing = await listEntities(env, 'IntegrationConnection', {
     57 +    filters: { id },
     58 +    limit: 1,
     59 +  });
     60 +  const payload = {
     61 +    id,
     62 +    school_id: state.school_id,
     63 +    provider: state.provider,
     64 +    status: 'connected',
     65 +    scopes: tokenResponse.scope || state.scopes,
     66 +    connected_at: nowIso(),
     67 +    updated_at: nowIso(),
     68 +    access_expires_at: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOS
         tring() : null,
     69 +  };
     70 +  if (existing?.[0]) {
     71 +    await updateEntity(env, 'IntegrationConnection', existing[0].id, payload);
     72 +    return existing[0].id;
     73 +  }
     74 +  const created = await createEntity(env, 'IntegrationConnection', payload);
     75 +  return created?.id || id;
     76 +}
     77 +
     78 +async function upsertIntegrationSecret(env, state, tokenResponse) {
     79 +  const id = `${state.school_id}:${state.provider}`;
     80 +  const existing = await listEntities(env, 'IntegrationSecret', {
     81 +    filters: { id },
     82 +    limit: 1,
     83 +  });
     84 +  const payload = {
     85 +    id,
     86 +    school_id: state.school_id,
     87 +    provider: state.provider,
     88 +    token_type: tokenResponse.token_type || 'Bearer',
     89 +    access_token: tokenResponse.access_token || null,
     90 +    refresh_token: tokenResponse.refresh_token || existing?.[0]?.refresh_token || null,
     91 +    scope: tokenResponse.scope || state.scopes,
     92 +    expires_at: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
          : null,
     93 +    updated_at: nowIso(),
     94 +  };
     95 +  if (existing?.[0]) {
     96 +    await updateEntity(env, 'IntegrationSecret', existing[0].id, payload);
     97 +    return existing[0].id;
     98 +  }
     99 +  const created = await createEntity(env, 'IntegrationSecret', payload);
    100 +  return created?.id || id;
    101 +}
    102 +
    103 +export async function onRequest({ request, env }) {
    104 +  const options = handleOptions(request, env);
    105 +  if (options) return options;
    106 +
    107 +  if (request.method !== 'GET') {
    108 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
    109 +  }
    110 +
    111 +  const url = new URL(request.url);
    112 +  const code = url.searchParams.get('code');
    113 +  const stateId = url.searchParams.get('state');
    114 +  if (!code || !stateId) {
    115 +    return errorResponse('missing_code', 400, 'Missing authorization code', env);
    116 +  }
    117 +
    118 +  const config = getConfig(env, url.origin);
    119 +  if (!config) {
    120 +    return errorResponse('not_configured', 500, 'Microsoft integration credentials not configured', env);
    121 +  }
    122 +
    123 +  const stateRows = await listEntities(env, 'IntegrationState', {
    124 +    filters: { id: String(stateId) },
    125 +    limit: 1,
    126 +  });
    127 +  const state = stateRows?.[0];
    128 +  if (!state || state.used_at || state.revoked_at) {
    129 +    return errorResponse('invalid_state', 400, 'Integration state expired', env);
    130 +  }
    131 +
    132 +  let tokenResponse = null;
    133 +  try {
    134 +    tokenResponse = await exchangeCode(config, getTenant(env), code);
    135 +  } catch (error) {
    136 +    return errorResponse('token_exchange_failed', error.status || 500, error.message, env);
    137 +  }
    138 +
    139 +  await upsertIntegrationSecret(env, state, tokenResponse);
    140 +  await upsertIntegrationConnection(env, state, tokenResponse);
    141 +
    142 +  await updateEntity(env, 'IntegrationState', state.id, {
    143 +    used_at: nowIso(),
    144 +  });
    145 +
    146 +  const nextUrl = normalizeNext(state.return_url, url.origin);
    147 +  const redirect = new URL(nextUrl, url.origin);
    148 +  redirect.searchParams.set('integration', state.provider);
    149 +
    150 +  return new Response(null, {
    151 +    status: 302,
    152 +    headers: {
    153 +      ...withHeaders(null, env),
    154 +      Location: redirect.toString(),
    155 +    },
    156 +  });
    157 +}

• Added functions/api/integrations/disconnect.js (+79 -0)
     1 +import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
     2 +import { deleteEntity, listEntities, updateEntity } from '../_store.js';
     3 +import { getUserFromToken } from '../_auth.js';
     4 +import { hasMembership, isGlobalAdmin } from '../_tenancy.js';
     5 +
     6 +async function getMembershipRole(env, schoolId, email) {
     7 +  if (!schoolId || !email) return null;
     8 +  const rows = await listEntities(env, 'SchoolMembership', {
     9 +    filters: { school_id: String(schoolId), user_email: String(email) },
    10 +    limit: 1,
    11 +  });
    12 +  return rows?.[0]?.role || null;
    13 +}
    14 +
    15 +function isAdminRole(role) {
    16 +  const normalized = String(role || '').toUpperCase();
    17 +  return ['OWNER', 'ADMIN', 'SUPERADMIN'].includes(normalized);
    18 +}
    19 +
    20 +export async function onRequest({ request, env }) {
    21 +  const options = handleOptions(request, env);
    22 +  if (options) return options;
    23 +
    24 +  if (request.method !== 'POST') {
    25 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
    26 +  }
    27 +
    28 +  const token = getBearerToken(request);
    29 +  const user = await getUserFromToken(token, env);
    30 +  if (!user?.email) {
    31 +    return errorResponse('auth_required', 401, 'Authentication required', env);
    32 +  }
    33 +
    34 +  const payload = await readJson(request);
    35 +  if (!payload) {
    36 +    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
    37 +  }
    38 +
    39 +  const schoolId = payload.school_id || payload.schoolId;
    40 +  const provider = payload.provider || payload.integration;
    41 +  if (!schoolId || !provider) {
    42 +    return errorResponse('missing_params', 400, 'school_id and provider are required', env);
    43 +  }
    44 +
    45 +  const globalAdmin = isGlobalAdmin(user, env);
    46 +  if (!globalAdmin) {
    47 +    const member = await hasMembership(env, schoolId, user.email);
    48 +    if (!member) {
    49 +      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    50 +    }
    51 +    const role = await getMembershipRole(env, schoolId, user.email);
    52 +    if (!isAdminRole(role)) {
    53 +      return errorResponse('forbidden', 403, 'Admin role required', env);
    54 +    }
    55 +  }
    56 +
    57 +  const id = `${schoolId}:${provider}`;
    58 +  const connections = await listEntities(env, 'IntegrationConnection', {
    59 +    filters: { id },
    60 +    limit: 1,
    61 +  });
    62 +  if (connections?.[0]) {
    63 +    await updateEntity(env, 'IntegrationConnection', connections[0].id, {
    64 +      status: 'disconnected',
    65 +      disconnected_at: new Date().toISOString(),
    66 +      updated_at: new Date().toISOString(),
    67 +    });
    68 +  }
    69 +
    70 +  const secrets = await listEntities(env, 'IntegrationSecret', {
    71 +    filters: { id },
    72 +    limit: 1,
    73 +  });
    74 +  if (secrets?.[0]) {
    75 +    await deleteEntity(env, 'IntegrationSecret', secrets[0].id);
    76 +  }
    77 +
    78 +  return json({ disconnected: true }, { env });
    79 +}

• Edited src/components/config/integrations.js (+75 -18)
      1 -import {
      2 -  Video,
      3 -  MessageSquare,
      4 -  CreditCard,
      5 -  Mail,
      6 -  Calendar,
      7 -  FileText,
      8 -  Music,
      9 -  Share2
     10 -} from 'lucide-react';
      1 +import {
      2 +  Video,
      3 +  MessageSquare,
      4 +  CreditCard,
      5 +  Mail,
      6 +  Calendar,
      7 +  FileText,
      8 +  Music,
      9 +  Share2,
     10 +  GraduationCap,
     11 +  FolderOpen,
     12 +  Cloud
     13 +} from 'lucide-react';
     14
        ⋮
    120    },
    118 -  zapier: {
    121 +  zapier: {
    122      id: 'zapier',
        ⋮
    129      status: 'available',
    127 -    features: [
    128 -      'Trigger actions on enrollment',
    129 -      'Sync data to CRMs',
    130 -      'Custom notifications'
    131 -    ]
    132 -  }
    133 -};
    130 +    features: [
    131 +      'Trigger actions on enrollment',
    132 +      'Sync data to CRMs',
    133 +      'Custom notifications'
    134 +    ]
    135 +  },
    136 +  google_classroom: {
    137 +    id: 'google_classroom',
    138 +    name: 'Google Classroom',
    139 +    description: 'Sync courses, rosters, and assignments with Google Classroom.',
    140 +    category: 'Classroom Sync',
    141 +    icon: GraduationCap,
    142 +    color: 'text-emerald-500',
    143 +    bg: 'bg-emerald-100 dark:bg-emerald-900/20',
    144 +    status: 'available',
    145 +    connectMode: 'oauth',
    146 +    oauthStartPath: '/integrations/google/start',
    147 +    providerKey: 'google_classroom',
    148 +    features: [
    149 +      'Import Classroom courses and rosters',
    150 +      'Post assignments from Breslov to Classroom',
    151 +      'Grade passback and sync metadata'
    152 +    ]
    153 +  },
    154 +  google_drive: {
    155 +    id: 'google_drive',
    156 +    name: 'Google Drive',
    157 +    description: 'Attach and manage lesson materials from Google Drive.',
    158 +    category: 'Content Storage',
    159 +    icon: FolderOpen,
    160 +    color: 'text-green-600',
    161 +    bg: 'bg-green-100 dark:bg-green-900/20',
    162 +    status: 'available',
    163 +    connectMode: 'oauth',
    164 +    oauthStartPath: '/integrations/google/start',
    165 +    providerKey: 'google_drive',
    166 +    features: [
    167 +      'Attach Drive files to lessons',
    168 +      'Auto-folder creation per course',
    169 +      'Permissions synced to student access'
    170 +    ]
    171 +  },
    172 +  microsoft_onedrive: {
    173 +    id: 'microsoft_onedrive',
    174 +    name: 'Microsoft OneDrive',
    175 +    description: 'Attach materials from OneDrive or SharePoint libraries.',
    176 +    category: 'Microsoft 365',
    177 +    icon: Cloud,
    178 +    color: 'text-blue-600',
    179 +    bg: 'bg-blue-100 dark:bg-blue-900/20',
    180 +    status: 'available',
    181 +    connectMode: 'oauth',
    182 +    oauthStartPath: '/integrations/microsoft/start',
    183 +    providerKey: 'microsoft_onedrive',
    184 +    features: [
    185 +      'Attach OneDrive or SharePoint files',
    186 +      'Resumable uploads via Graph sessions',
    187 +      'Permissions aligned to course rosters'
    188 +    ]
    189 +  }
    190 +};
    191

• Edited src/pages/IntegrationDetail.jsx (+122 -64)
      1 -import React, { useState, useEffect } from 'react';
      2 -import { useSearchParams, useNavigate } from 'react-router-dom';
      3 -import { getIntegrationById } from '@/components/config/integrations';
      4 -import { Button } from '@/components/ui/button';
      5 -import { Badge } from '@/components/ui/badge';
      6 -import { Separator } from '@/components/ui/separator';
      7 -import { ArrowLeft, Check, ExternalLink, ShieldCheck } from 'lucide-react';
      8 -import { createPageUrl } from '@/utils';
      9 -import { cx } from '@/components/theme/tokens';
     10 -import PageShell from '@/components/ui/PageShell';
     11 -import GlassCard from '@/components/ui/GlassCard';
     12 -import { toast } from 'sonner';
     13 -
     14 -export default function IntegrationDetail() {
     15 -  const [params] = useSearchParams();
     16 -  const navigate = useNavigate();
     17 -  const appId = params.get('id');
     18 -  const app = getIntegrationById(appId);
     19 -  const [isConnecting, setIsConnecting] = useState(false);
     20 -  const [isConnected, setIsConnected] = useState(app?.status === 'connected');
     21 -
     22 -  useEffect(() => {
     23 -    if (!app) {
     24 -      navigate(createPageUrl('IntegrationsMarketplace'));
     25 -    }
     26 -  }, [app, navigate]);
     27 -
     28 -  if (!app) return null;
     29 -
     30 -  const handleConnect = () => {
     31 -    setIsConnecting(true);
     32 -    // Mock connection delay
     33 -    setTimeout(() => {
     34 -      setIsConnecting(false);
     35 -      setIsConnected(true);
     36 -      toast.success(`Successfully connected to ${app.name}`);
     37 -    }, 1500);
     38 -  };
     39 -
     40 -  const handleDisconnect = () => {
     41 -    if (confirm(`Are you sure you want to disconnect ${app.name}?`)) {
     42 -      setIsConnected(false);
     43 -      toast.info(`Disconnected from ${app.name}`);
     44 -    }
     45 -  };
      1 +import React, { useMemo, useState, useEffect } from 'react';
      2 +import { useSearchParams, useNavigate } from 'react-router-dom';
      3 +import { useQuery } from '@tanstack/react-query';
      4 +import { getIntegrationById } from '@/components/config/integrations';
      5 +import { scopedFilter } from '@/components/api/scoped';
      6 +import { Button } from '@/components/ui/button';
      7 +import { Badge } from '@/components/ui/badge';
      8 +import { Separator } from '@/components/ui/separator';
      9 +import { ArrowLeft, Check, ExternalLink, ShieldCheck } from 'lucide-react';
     10 +import { createPageUrl } from '@/utils';
     11 +import { cx } from '@/components/theme/tokens';
     12 +import PageShell from '@/components/ui/PageShell';
     13 +import GlassCard from '@/components/ui/GlassCard';
     14 +import { toast } from 'sonner';
     15 +import { useSession } from '@/components/hooks/useSession';
     16 +import { base44 } from '@/api/base44Client';
     17 +import { buildApiUrl } from '@/api/appClient';
     18 +
     19 +export default function IntegrationDetail() {
     20 +  const [params] = useSearchParams();
     21 +  const navigate = useNavigate();
     22 +  const appId = params.get('id');
     23 +  const app = getIntegrationById(appId);
     24 +  const { activeSchoolId } = useSession();
     25 +  const [isConnecting, setIsConnecting] = useState(false);
     26 +  const [isConnected, setIsConnected] = useState(app?.status === 'connected');
     27 +
     28 +  const isOAuth = app?.connectMode === 'oauth';
     29 +  const providerKey = app?.providerKey || app?.id;
     30 +
     31 +  const { data: connectionRows = [], refetch: refetchConnection } = useQuery({
     32 +    queryKey: ['integration-connection', activeSchoolId, providerKey],
     33 +    queryFn: () => scopedFilter(
     34 +      'IntegrationConnection',
     35 +      activeSchoolId,
     36 +      { provider: providerKey },
     37 +      '-updated_at',
     38 +      1,
     39 +      { fields: ['id', 'provider', 'status', 'connected_at', 'updated_at'] }
     40 +    ),
     41 +    enabled: !!activeSchoolId && !!providerKey && isOAuth,
     42 +  });
     43 +
     44 +  const connection = useMemo(() => connectionRows?.[0] || null, [connectionRows]);
     45 +
     46 +  useEffect(() => {
     47 +    if (!app) {
     48 +      navigate(createPageUrl('IntegrationsMarketplace'));
     49 +    }
     50 +  }, [app, navigate]);
     51 +
     52 +  useEffect(() => {
     53 +    if (isOAuth) return;
     54 +    setIsConnected(app?.status === 'connected');
     55 +  }, [app, isOAuth]);
     56 +
     57 +  if (!app) return null;
     58 +
     59 +  const connected = isOAuth ? connection?.status === 'connected' : isConnected;
     60 +
     61 +  const handleConnect = () => {
     62 +    if (isOAuth) {
     63 +      if (!activeSchoolId) {
     64 +        toast.error('Select a school first');
     65 +        return;
     66 +      }
     67 +      const url = buildApiUrl(app.oauthStartPath, {
     68 +        school_id: activeSchoolId,
     69 +        provider: providerKey,
     70 +        return_url: window.location.href,
     71 +      });
     72 +      window.location.assign(url);
     73 +      return;
     74 +    }
     75 +
     76 +    setIsConnecting(true);
     77 +    setTimeout(() => {
     78 +      setIsConnecting(false);
     79 +      setIsConnected(true);
     80 +      toast.success(`Successfully connected to ${app.name}`);
     81 +    }, 1500);
     82 +  };
     83 +
     84 +  const handleDisconnect = async () => {
     85 +    if (!confirm(`Are you sure you want to disconnect ${app.name}?`)) return;
     86 +
     87 +    if (isOAuth) {
     88 +      try {
     89 +        await base44.request('/integrations/disconnect', {
     90 +          method: 'POST',
     91 +          body: { school_id: activeSchoolId, provider: providerKey },
     92 +        });
     93 +        await refetchConnection();
     94 +        toast.info(`Disconnected from ${app.name}`);
     95 +      } catch (error) {
     96 +        toast.error('Unable to disconnect integration');
     97 +      }
     98 +      return;
     99 +    }
    100 +
    101 +    setIsConnected(false);
    102 +    toast.info(`Disconnected from ${app.name}`);
    103 +  };
    104
        ⋮
    120        subtitle={app.category}
     63 -      actions={
     64 -        isConnected ? (
     65 -          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDisconne
         ct}>
     66 -            Disconnect
     67 -          </Button>
     68 -        ) : (
     69 -          <Button onClick={handleConnect} disabled={isConnecting}>
     70 -            {isConnecting ? 'Connecting...' : 'Connect App'}
    121 +      actions={
    122 +        connected ? (
    123 +          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDisconne
         ct}>
    124 +            Disconnect
    125 +          </Button>
    126 +        ) : (
    127 +          <Button onClick={handleConnect} disabled={isConnecting}>
    128 +            {isConnecting ? 'Connecting...' : 'Connect App'}
    129            </Button>
        ⋮
    203                  <span className="font-medium">2.4.0</span>
    146 -              </div>
    147 -              <div className="flex justify-between">
    148 -                <span className="text-muted-foreground">Developer</span>
    149 -                <span className="font-medium">Breslov Academy</span>
    150 -              </div>
    151 -              <div className="flex justify-between items-center">
    152 -                <span className="text-muted-foreground">Status</span>
    153 -                <Badge variant={app.status === 'beta' ? 'secondary' : 'default'} className="capitalize">
    154 -                  {app.status}
    155 -                </Badge>
    204                </div>
    157 -            </div>
    205 +              <div className="flex justify-between">
    206 +                <span className="text-muted-foreground">Developer</span>
    207 +                <span className="font-medium">{app.developer || 'Breslov Academy'}</span>
    208 +              </div>
    209 +              <div className="flex justify-between items-center">
    210 +                <span className="text-muted-foreground">Status</span>
    211 +                <Badge variant={connected ? 'default' : app.status === 'beta' ? 'secondary' : 'outline'} classN
         ame="capitalize">
    212 +                  {connected ? 'connected' : app.status}
    213 +                </Badge>
    214 +              </div>
    215 +            </div>
    216

• I'm mapping out creating a new API endpoint for Cloudflare Stream uploads, ensuring proper folder structure,
  authentication, and handling upload metadata like durations and role checks. I'll track uploads with a StreamUpload
  entity, capturing key info such as stream UID and status, and think through which URLs to store and expose.

• Added functions/api/media/stream/create.js (+117 -0)
      1 +import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../../_utils.js';
      2 +import { createEntity, listEntities } from '../../_store.js';
      3 +import { getUserFromToken } from '../../_auth.js';
      4 +import { hasMembership, isGlobalAdmin } from '../../_tenancy.js';
      5 +
      6 +function nowIso() {
      7 +  return new Date().toISOString();
      8 +}
      9 +
     10 +function getStreamConfig(env) {
     11 +  const accountId = env?.CLOUDFLARE_ACCOUNT_ID || '';
     12 +  const token = env?.CLOUDFLARE_STREAM_TOKEN || '';
     13 +  if (!accountId || !token) return null;
     14 +  return { accountId, token };
     15 +}
     16 +
     17 +async function getMembershipRole(env, schoolId, email) {
     18 +  if (!schoolId || !email) return null;
     19 +  const rows = await listEntities(env, 'SchoolMembership', {
     20 +    filters: { school_id: String(schoolId), user_email: String(email) },
     21 +    limit: 1,
     22 +  });
     23 +  return rows?.[0]?.role || null;
     24 +}
     25 +
     26 +function isTeacherRole(role) {
     27 +  const normalized = String(role || '').toUpperCase();
     28 +  return ['OWNER', 'ADMIN', 'INSTRUCTOR', 'TEACHER', 'TA', 'RAV', 'RABBI'].includes(normalized);
     29 +}
     30 +
     31 +export async function onRequest({ request, env }) {
     32 +  const options = handleOptions(request, env);
     33 +  if (options) return options;
     34 +
     35 +  if (request.method !== 'POST') {
     36 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
     37 +  }
     38 +
     39 +  const token = getBearerToken(request);
     40 +  const user = await getUserFromToken(token, env);
     41 +  if (!user?.email) {
     42 +    return errorResponse('auth_required', 401, 'Authentication required', env);
     43 +  }
     44 +
     45 +  const payload = await readJson(request);
     46 +  if (!payload) {
     47 +    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
     48 +  }
     49 +
     50 +  const schoolId = payload.school_id || payload.schoolId;
     51 +  if (!schoolId) {
     52 +    return errorResponse('missing_school', 400, 'school_id is required', env);
     53 +  }
     54 +
     55 +  const globalAdmin = isGlobalAdmin(user, env);
     56 +  if (!globalAdmin) {
     57 +    const member = await hasMembership(env, schoolId, user.email);
     58 +    if (!member) {
     59 +      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
     60 +    }
     61 +    const role = await getMembershipRole(env, schoolId, user.email);
     62 +    if (!isTeacherRole(role)) {
     63 +      return errorResponse('forbidden', 403, 'Teacher role required', env);
     64 +    }
     65 +  }
     66 +
     67 +  const config = getStreamConfig(env);
     68 +  if (!config) {
     69 +    return errorResponse('not_configured', 500, 'Cloudflare Stream credentials not configured', env);
     70 +  }
     71 +
     72 +  const requestBody = {
     73 +    maxDurationSeconds: payload.max_duration_seconds || 7200,
     74 +    expiry: payload.expires_at || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
     75 +    requireSignedURLs: payload.require_signed_urls === true,
     76 +    meta: {
     77 +      school_id: String(schoolId),
     78 +      lesson_id: payload.lesson_id || null,
     79 +      course_id: payload.course_id || null,
     80 +      uploaded_by: user.email,
     81 +    },
     82 +  };
     83 +
     84 +  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.accountId}/stream/direct
         _upload`, {
     85 +    method: 'POST',
     86 +    headers: {
     87 +      Authorization: `Bearer ${config.token}`,
     88 +      'Content-Type': 'application/json',
     89 +    },
     90 +    body: JSON.stringify(requestBody),
     91 +  });
     92 +
     93 +  const data = await response.json().catch(() => null);
     94 +  if (!response.ok || data?.success !== true) {
     95 +    return errorResponse('stream_error', response.status || 500, data?.errors?.[0]?.message || 'Stream upload f
         ailed', env);
     96 +  }
     97 +
     98 +  const result = data?.result || {};
     99 +  const uploadRecord = await createEntity(env, 'StreamUpload', {
    100 +    school_id: String(schoolId),
    101 +    stream_uid: result.uid,
    102 +    upload_url: result.uploadURL,
    103 +    expires_at: result.expiry,
    104 +    created_at: nowIso(),
    105 +    created_by: user.email,
    106 +    lesson_id: payload.lesson_id || null,
    107 +    course_id: payload.course_id || null,
    108 +    status: 'pending',
    109 +  });
    110 +
    111 +  return json({
    112 +    upload_url: result.uploadURL,
    113 +    stream_uid: result.uid,
    114 +    expires_at: result.expiry,
    115 +    record_id: uploadRecord?.id || null,
    116 +  }, { env });
    117 +}

• I'm outlining updating TeachLesson.jsx to support uploading videos via the new /api/media/stream/create endpoint. I'll
  add state to track video/audio URLs, uploading status, errors, and the stream ID. The plan includes adding a file
  input triggered by a button, uploading selected files with fetch and FormData, handling success by auto-saving the
  lesson with the new video URL and stream ID, and managing UI feedback like spinners and error messages. This setup
  will smoothly connect the UI to the Cloudflare Stream upload flow.

• Edited src/pages/TeachLesson.jsx (+132 -35)
      1 -import React, { useState, useEffect } from 'react';
      2 -import { useSession } from '@/components/hooks/useSession';
      1 +import React, { useState, useEffect, useRef } from 'react';
      2 +import { useSession } from '@/components/hooks/useSession';
      3  import { scopedCreate, scopedFilter, scopedUpdate } from '@/components/api/scoped';
      4 -import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
      5 -import { useNavigate } from 'react-router-dom';
      6 -import { createPageUrl } from '@/utils';
      4 +import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
      5 +import { useNavigate } from 'react-router-dom';
      6 +import { createPageUrl } from '@/utils';
      7  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
        ⋮
     18    const { user, activeSchoolId } = useSession();
     19 -  const [lessonId, setLessonId] = useState(null);
     20 -  const [content, setContent] = useState('');
     21 -  const navigate = useNavigate();
     22 -  const queryClient = useQueryClient();
     19 +  const [lessonId, setLessonId] = useState(null);
     20 +  const [content, setContent] = useState('');
     21 +  const [videoUrl, setVideoUrl] = useState('');
     22 +  const [videoStreamId, setVideoStreamId] = useState('');
     23 +  const [audioUrl, setAudioUrl] = useState('');
     24 +  const [isUploading, setIsUploading] = useState(false);
     25 +  const [uploadError, setUploadError] = useState('');
     26 +  const navigate = useNavigate();
     27 +  const queryClient = useQueryClient();
     28 +  const fileInputRef = useRef(null);
     29
        ⋮
     34
     29 -  const { data: lesson, isLoading } = useQuery({
     30 -    queryKey: ['lesson', lessonId, activeSchoolId],
     31 -    queryFn: async () => {
     32 -      const lessons = await scopedFilter('Lesson', activeSchoolId, { id: lessonId });
     33 -      const l = lessons[0];
     34 -      if (l) setContent(l.content || '');
     35 -      return l;
     36 -    },
     37 -    enabled: !!lessonId && !!activeSchoolId
     38 -  });
     35 +  const { data: lesson, isLoading } = useQuery({
     36 +    queryKey: ['lesson', lessonId, activeSchoolId],
     37 +    queryFn: async () => {
     38 +      const lessons = await scopedFilter('Lesson', activeSchoolId, { id: lessonId });
     39 +      const l = lessons[0];
     40 +      if (l) {
     41 +        setContent(l.content || '');
     42 +        setVideoUrl(l.video_url || '');
     43 +        setVideoStreamId(l.video_stream_id || '');
     44 +        setAudioUrl(l.audio_url || '');
     45 +      }
     46 +      return l;
     47 +    },
     48 +    enabled: !!lessonId && !!activeSchoolId
     49 +  });
     50
        ⋮
     77
     67 -  const handleSave = (e) => {
     68 -    e.preventDefault();
     69 -    const formData = new FormData(e.target);
     70 -
     78 +  const handleSave = (e) => {
     79 +    e.preventDefault();
     80 +    const formData = new FormData(e.target);
     81 +
     82      updateLessonMutation.mutate({
        ⋮
     85          content,
     75 -        video_url: formData.get('video_url'),
     76 -        audio_url: formData.get('audio_url'),
     86 +        video_url: videoUrl || formData.get('video_url'),
     87 +        video_stream_id: videoStreamId || null,
     88 +        audio_url: audioUrl || formData.get('audio_url'),
     89          duration_minutes: parseInt(formData.get('duration_minutes')) || 0,
        ⋮
     94
     95 +  const handleStreamUpload = async (file) => {
     96 +    if (!file || !activeSchoolId || !lessonId) return;
     97 +    setIsUploading(true);
     98 +    setUploadError('');
     99 +    try {
    100 +      const session = await base44.request('/media/stream/create', {
    101 +        method: 'POST',
    102 +        body: {
    103 +          school_id: activeSchoolId,
    104 +          lesson_id: lessonId,
    105 +          course_id: lesson?.course_id || null,
    106 +        },
    107 +      });
    108 +
    109 +      const formData = new FormData();
    110 +      formData.append('file', file, file.name);
    111 +      const uploadResponse = await fetch(session.upload_url, {
    112 +        method: 'POST',
    113 +        body: formData,
    114 +      });
    115 +      if (!uploadResponse.ok) {
    116 +        throw new Error('Upload failed');
    117 +      }
    118 +
    119 +      const streamUrl = `https://videodelivery.net/${session.stream_uid}/downloads/default.mp4`;
    120 +      setVideoUrl(streamUrl);
    121 +      setVideoStreamId(session.stream_uid);
    122 +
    123 +      await scopedUpdate('Lesson', lessonId, {
    124 +        video_url: streamUrl,
    125 +        video_stream_id: session.stream_uid,
    126 +      }, activeSchoolId, true);
    127 +
    128 +      toast.success('Video uploaded successfully');
    129 +    } catch (error) {
    130 +      setUploadError('Video upload failed. Please try again.');
    131 +      toast.error('Video upload failed');
    132 +    } finally {
    133 +      setIsUploading(false);
    134 +    }
    135 +  };
    136 +
    137    const toggleStatus = () => {
        ⋮
    215
    162 -            <div className="grid grid-cols-2 gap-4">
    163 -              <div className="space-y-2">
    164 -                <Label>Video URL</Label>
    165 -                <Input name="video_url" defaultValue={lesson.video_url} placeholder="https://youtube.com/..." /
         >
    166 -              </div>
    167 -              <div className="space-y-2">
    168 -                <Label>Audio URL</Label>
    169 -                <Input name="audio_url" defaultValue={lesson.audio_url} placeholder="https://..." />
    170 -              </div>
    171 -            </div>
    216 +            <div className="grid grid-cols-2 gap-4">
    217 +              <div className="space-y-2">
    218 +                <Label>Video URL</Label>
    219 +                <Input
    220 +                  name="video_url"
    221 +                  value={videoUrl}
    222 +                  onChange={(event) => setVideoUrl(event.target.value)}
    223 +                  placeholder="https://youtube.com/..."
    224 +                />
    225 +              </div>
    226 +              <div className="space-y-2">
    227 +                <Label>Audio URL</Label>
    228 +                <Input
    229 +                  name="audio_url"
    230 +                  value={audioUrl}
    231 +                  onChange={(event) => setAudioUrl(event.target.value)}
    232 +                  placeholder="https://..."
    233 +                />
    234 +              </div>
    235 +            </div>
    236 +
    237 +            <div className="rounded-lg border border-dashed border-border/60 p-4">
    238 +              <div className="flex flex-wrap items-center justify-between gap-3">
    239 +                <div>
    240 +                  <p className="text-sm font-medium">Upload via Cloudflare Stream</p>
    241 +                  <p className="text-xs text-muted-foreground">Direct upload to secure video hosting.</p>
    242 +                </div>
    243 +                <div className="flex items-center gap-2">
    244 +                  <input
    245 +                    ref={fileInputRef}
    246 +                    type="file"
    247 +                    accept="video/*"
    248 +                    className="hidden"
    249 +                    onChange={(event) => {
    250 +                      const file = event.target.files?.[0];
    251 +                      if (file) handleStreamUpload(file);
    253 +                    }}
    254 +                  />
    255 +                  <Button
    256 +                    type="button"
    257 +                    variant="outline"
    258 +                    onClick={() => fileInputRef.current?.click()}
    259 +                    disabled={isUploading}
    260 +                  >
    261 +                    {isUploading ? 'Uploading...' : 'Select video'}
    262 +                  </Button>
    263 +                </div>
    264 +              </div>
    265 +              {uploadError && (
    266 +                <p className="mt-2 text-xs text-destructive">{uploadError}</p>
    267 +              )}
    268 +            </div>
    269

• Edited src/pages/TeachLesson.jsx (+1 -0)
    3  import { scopedCreate, scopedFilter, scopedUpdate } from '@/components/api/scoped';
    4 +import { base44 } from '@/api/base44Client';
    5  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

• I’m outlining the Stripe checkout API endpoint with validation, discount calculation, session creation, and handling
  free transactions by creating entitlements server-side. I’ll also build shared billing helper functions to manage
  offer courses, entitlements creation, and coupon redemptions to keep logic consistent between checkout and webhook.
  This approach feels thorough and keeps the payment flow clean!

• Added functions/api/_billing.js (+126 -0)
      1 +import { createEntity, listEntities, updateEntity } from './_store.js';
      2 +
      3 +function nowIso() {
      4 +  return new Date().toISOString();
      5 +}
      6 +
      7 +function normalizeType(value) {
      8 +  return String(value || '').toUpperCase();
      9 +}
     10 +
     11 +function includesCopyLicense(name) {
     12 +  return String(name || '').toLowerCase().includes('copy');
     13 +}
     14 +
     15 +export async function resolveOfferCourses(env, schoolId, offerId) {
     16 +  if (!schoolId || !offerId) return [];
     17 +  const rows = await listEntities(env, 'OfferCourse', {
     18 +    filters: { school_id: String(schoolId), offer_id: String(offerId) },
     19 +    limit: 500,
     20 +  });
     21 +  return rows || [];
     22 +}
     23 +
     24 +export async function createEntitlementsForOffer({ env, schoolId, offer, userEmail, source = 'PURCHASE', source
         Id, endsAt = null }) {
     25 +  if (!schoolId || !offer || !userEmail) return { created: [], skipped: [] };
     26 +  const created = [];
     27 +  const skipped = [];
     28 +  const startAt = nowIso();
     29 +
     30 +  const existing = await listEntities(env, 'Entitlement', {
     31 +    filters: { school_id: String(schoolId), user_email: String(userEmail), source_id: String(sourceId || '') },
     32 +    limit: 500,
     33 +  });
     34 +
     35 +  const type = normalizeType(offer.offer_type);
     36 +  const accessScope = normalizeType(offer.access_scope);
     37 +
     38 +  if (type === 'ADDON') {
     39 +    const licenseType = includesCopyLicense(offer.name) ? 'COPY_LICENSE' : 'DOWNLOAD_LICENSE';
     40 +    const already = (existing || []).some((ent) => normalizeType(ent.type || ent.entitlement_type) === licenseT
         ype);
     41 +    if (already) {
     42 +      skipped.push({ type: licenseType, reason: 'already_exists' });
     43 +    } else {
     44 +      const ent = await createEntity(env, 'Entitlement', {
     45 +        school_id: String(schoolId),
     46 +        user_email: userEmail,
     47 +        type: licenseType,
     48 +        source,
     49 +        source_id: sourceId,
     50 +        starts_at: startAt,
     51 +        ends_at: endsAt,
     52 +      });
     53 +      created.push(ent);
     54 +    }
     55 +    return { created, skipped };
     56 +  }
     57 +
     58 +  if (accessScope === 'ALL_COURSES' || type === 'SUBSCRIPTION') {
     59 +    const already = (existing || []).some((ent) => normalizeType(ent.type || ent.entitlement_type) === 'ALL_COU
         RSES');
     60 +    if (already) {
     61 +      skipped.push({ type: 'ALL_COURSES', reason: 'already_exists' });
     62 +    } else {
     63 +      const ent = await createEntity(env, 'Entitlement', {
     64 +        school_id: String(schoolId),
     65 +        user_email: userEmail,
     66 +        type: 'ALL_COURSES',
     67 +        source,
     68 +        source_id: sourceId,
     69 +        starts_at: startAt,
     70 +        ends_at: endsAt,
     71 +      });
     72 +      created.push(ent);
     73 +    }
     74 +    return { created, skipped };
     75 +  }
     76 +
     77 +  if (accessScope === 'SELECTED_COURSES' || type === 'COURSE' || type === 'BUNDLE') {
     78 +    const offerCourses = await resolveOfferCourses(env, schoolId, offer.id);
     79 +    for (const oc of offerCourses) {
     80 +      const already = (existing || []).some((ent) => {
     81 +        const entType = normalizeType(ent.type || ent.entitlement_type);
     82 +        return entType === 'COURSE' && String(ent.course_id) === String(oc.course_id);
     83 +      });
     84 +      if (already) {
     85 +        skipped.push({ type: 'COURSE', course_id: oc.course_id, reason: 'already_exists' });
     86 +        continue;
     87 +      }
     88 +      const ent = await createEntity(env, 'Entitlement', {
     89 +        school_id: String(schoolId),
     90 +        user_email: userEmail,
     91 +        type: 'COURSE',
     92 +        course_id: oc.course_id,
     93 +        source,
     94 +        source_id: sourceId,
     95 +        starts_at: startAt,
     96 +        ends_at: endsAt,
     97 +      });
     98 +      created.push(ent);
     99 +    }
    100 +  }
    101 +
    102 +  return { created, skipped };
    103 +}
    104 +
    105 +export async function recordCouponRedemption({ env, schoolId, coupon, transactionId, userEmail, discountCents }
         ) {
    106 +  if (!coupon || !transactionId || !schoolId || !userEmail) return { created: false, skipped: 'invalid' };
    107 +  const existing = await listEntities(env, 'CouponRedemption', {
    108 +    filters: { school_id: String(schoolId), transaction_id: String(transactionId) },
    109 +    limit: 1,
    110 +  });
    111 +  if (existing?.[0]) return { created: false, skipped: 'already_exists' };
    112 +
    113 +  await createEntity(env, 'CouponRedemption', {
    114 +    school_id: String(schoolId),
    115 +    coupon_id: coupon.id,
    116 +    user_email: userEmail,
    117 +    transaction_id: transactionId,
    118 +    discount_cents: discountCents || 0,
    119 +  });
    120 +
    121 +  await updateEntity(env, 'Coupon', coupon.id, {
    122 +    usage_count: (coupon.usage_count || 0) + 1,
    123 +  });
    124 +
    125 +  return { created: true, skipped: null };
    126 +}

• Added functions/api/stripe/checkout.js (+250 -0)
      1 +import { errorResponse, handleOptions, json, readJson } from '../_utils.js';
      2 +import { createEntity, listEntities, updateEntity } from '../_store.js';
      3 +import { stripeRequest } from './_stripe.js';
      4 +import { createEntitlementsForOffer, recordCouponRedemption } from '../_billing.js';
      5 +import { isSchoolPublic } from '../_tenancy.js';
      6 +
      7 +function nowIso() {
      8 +  return new Date().toISOString();
      9 +}
     10 +
     11 +function normalizeInterval(interval) {
     12 +  const value = String(interval || '').toLowerCase();
     13 +  if (value === 'year' || value === 'annual') return 'year';
     14 +  return 'month';
     15 +}
     16 +
     17 +function getFeePercent(env, school) {
     18 +  const raw = school?.platform_fee_percent ?? env?.PLATFORM_FEE_PERCENT ?? env?.PLATFORM_FEE_RATE;
     19 +  const parsed = Number(raw);
     20 +  if (!Number.isFinite(parsed) || parsed < 0) return 0;
     21 +  return Math.min(parsed, 100);
     22 +}
     23 +
     24 +function hasExpired(value) {
     25 +  if (!value) return false;
     26 +  const date = new Date(value);
     27 +  if (Number.isNaN(date.valueOf())) return false;
     28 +  return date <= new Date();
     29 +}
     30 +
     31 +function computeDiscount(offer, coupon) {
     32 +  if (!offer || !coupon) return 0;
     33 +  if (coupon.is_active === false) return 0;
     34 +  if (coupon.expires_at && hasExpired(coupon.expires_at)) return 0;
     35 +  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return 0;
     36 +
     37 +  if (coupon.discount_type === 'PERCENTAGE') {
     38 +    return Math.round((offer.price_cents || 0) * (coupon.discount_value || 0) / 100);
     39 +  }
     40 +  if (coupon.discount_type === 'AMOUNT') {
     41 +    return Math.round((coupon.discount_value || 0) * 100);
     42 +  }
     43 +  return 0;
     44 +}
     45 +
     46 +async function resolveSchool(env, schoolId) {
     47 +  if (!schoolId) return null;
     48 +  const rows = await listEntities(env, 'School', {
     49 +    filters: { id: String(schoolId) },
     50 +    limit: 1,
     51 +  });
     52 +  return rows?.[0] || null;
     53 +}
     54 +
     55 +async function resolveOffer(env, schoolId, offerId) {
     56 +  if (!schoolId || !offerId) return null;
     57 +  const rows = await listEntities(env, 'Offer', {
     58 +    filters: { school_id: String(schoolId), id: String(offerId) },
     59 +    limit: 1,
     60 +  });
     61 +  return rows?.[0] || null;
     62 +}
     63 +
     64 +async function resolveCoupon(env, schoolId, code) {
     65 +  if (!schoolId || !code) return null;
     66 +  const rows = await listEntities(env, 'Coupon', {
     67 +    filters: { school_id: String(schoolId), code: String(code).toUpperCase() },
     68 +    limit: 1,
     69 +  });
     70 +  return rows?.[0] || null;
     71 +}
     72 +
     73 +async function resolveStripeAccount(env, schoolId) {
     74 +  const rows = await listEntities(env, 'StripeAccount', {
     75 +    filters: { school_id: String(schoolId) },
     76 +    limit: 1,
     77 +  });
     78 +  return rows?.[0] || null;
     79 +}
     80 +
     81 +async function findExistingTransaction(env, schoolId, idempotencyKey) {
     82 +  if (!idempotencyKey) return null;
     83 +  const rows = await listEntities(env, 'Transaction', {
     84 +    filters: { school_id: String(schoolId), idempotency_key: String(idempotencyKey) },
     85 +    limit: 1,
     86 +  });
     87 +  return rows?.[0] || null;
     88 +}
     89 +
     90 +function buildCheckoutParams({ offer, amountCents, email, metadata, mode, feePercent, stripeAccountId, successU
         rl, cancelUrl }) {
     91 +  const params = {
     92 +    mode,
     93 +    success_url: successUrl,
     94 +    cancel_url: cancelUrl,
     95 +    customer_email: email,
     96 +    'line_items[0][quantity]': 1,
     97 +    'line_items[0][price_data][currency]': 'usd',
     98 +    'line_items[0][price_data][product_data][name]': offer.name || 'Course Access',
     99 +    'line_items[0][price_data][product_data][description]': offer.description || '',
    100 +    'line_items[0][price_data][unit_amount]': amountCents,
    101 +  };
    102 +
    103 +  if (mode === 'subscription') {
    104 +    params['line_items[0][price_data][recurring][interval]'] = normalizeInterval(offer.billing_interval);
    105 +    params['subscription_data[application_fee_percent]'] = feePercent;
    106 +    params['subscription_data[transfer_data][destination]'] = stripeAccountId;
    107 +  } else {
    108 +    params['payment_intent_data[application_fee_percent]'] = feePercent;
    109 +    params['payment_intent_data[transfer_data][destination]'] = stripeAccountId;
    110 +  }
    111 +
    112 +  Object.entries(metadata || {}).forEach(([key, value]) => {
    113 +    if (value === undefined || value === null || value === '') return;
    114 +    params[`metadata[${key}]`] = value;
    115 +  });
    116 +
    117 +  return params;
    118 +}
    119 +
    120 +export async function onRequest({ request, env }) {
    121 +  const options = handleOptions(request, env);
    122 +  if (options) return options;
    123 +
    124 +  if (request.method !== 'POST') {
    125 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
    126 +  }
    127 +
    128 +  const payload = await readJson(request);
    129 +  if (!payload) {
    130 +    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
    131 +  }
    132 +
    133 +  const schoolId = payload.school_id || payload.schoolId;
    134 +  const offerId = payload.offer_id || payload.offerId;
    135 +  const email = payload.email || payload.user_email || payload.userEmail;
    136 +  const couponCode = payload.coupon_code || payload.couponCode || null;
    137 +  const idempotencyKey = payload.idempotency_key || null;
    138 +
    139 +  if (!schoolId || !offerId || !email) {
    140 +    return errorResponse('missing_params', 400, 'school_id, offer_id, and email are required', env);
    141 +  }
    142 +
    143 +  const school = await resolveSchool(env, schoolId);
    144 +  if (!school) {
    145 +    return errorResponse('school_not_found', 404, 'School not found', env);
    146 +  }
    147 +
    148 +  const offer = await resolveOffer(env, schoolId, offerId);
    149 +  if (!offer || offer.is_active === false) {
    150 +    return errorResponse('offer_unavailable', 404, 'Offer not available', env);
    151 +  }
    152 +
    153 +  const isPublic = await isSchoolPublic(env, schoolId);
    154 +  if (!isPublic && !payload.allow_private) {
    155 +    return errorResponse('forbidden', 403, 'School is not public', env);
    156 +  }
    157 +
    158 +  const coupon = couponCode ? await resolveCoupon(env, schoolId, couponCode) : null;
    159 +  const discountCents = coupon ? computeDiscount(offer, coupon) : 0;
    160 +  const amountCents = Math.max(0, (offer.price_cents || 0) - discountCents);
    161 +
    162 +  const stripeAccount = await resolveStripeAccount(env, schoolId);
    163 +  if (!stripeAccount?.stripe_account_id || stripeAccount.charges_enabled === false) {
    164 +    return errorResponse('stripe_unavailable', 409, 'Stripe is not connected for this school', env);
    165 +  }
    166 +
    167 +  const existing = await findExistingTransaction(env, schoolId, idempotencyKey);
    168 +  if (existing?.stripe_session_id && existing?.checkout_url) {
    169 +    return json({ url: existing.checkout_url, transaction_id: existing.id }, { env });
    170 +  }
    171 +
    172 +  const transaction = existing || await createEntity(env, 'Transaction', {
    173 +    school_id: String(schoolId),
    174 +    user_email: email,
    175 +    offer_id: String(offerId),
    176 +    amount_cents: amountCents,
    177 +    discount_cents: discountCents,
    178 +    coupon_code: couponCode || null,
    179 +    provider: 'STRIPE',
    180 +    status: amountCents === 0 ? 'paid' : 'pending',
    181 +    idempotency_key: idempotencyKey || null,
    182 +    metadata: {
    183 +      referral_code: payload.referral_code || payload.refCode || null,
    184 +    },
    185 +    created_date: nowIso(),
    186 +  });
    187 +
    188 +  if (amountCents === 0) {
    189 +    await createEntitlementsForOffer({
    190 +      env,
    191 +      schoolId,
    192 +      offer,
    193 +      userEmail: email,
    194 +      source: 'PURCHASE',
    195 +      sourceId: transaction.id,
    196 +    });
    197 +    if (coupon) {
    198 +      await recordCouponRedemption({
    199 +        env,
    200 +        schoolId,
    201 +        coupon,
    202 +        transactionId: transaction.id,
    203 +        userEmail: email,
    204 +        discountCents,
    205 +      });
    206 +    }
    207 +    return json({ url: payload.success_url || '/', transaction_id: transaction.id, free: true }, { env });
    208 +  }
    209 +
    210 +  const origin = new URL(request.url).origin;
    211 +  const successUrl = payload.success_url
    212 +    || `${origin}/s/${school.slug || 'demo'}/thank-you?session_id={CHECKOUT_SESSION_ID}`;
    213 +  const cancelUrl = payload.cancel_url
    214 +    || `${origin}/s/${school.slug || 'demo'}/pricing`;
    215 +
    216 +  const feePercent = getFeePercent(env, school);
    217 +  const mode = offer.offer_type === 'SUBSCRIPTION' ? 'subscription' : 'payment';
    218 +  const metadata = {
    219 +    school_id: String(schoolId),
    220 +    offer_id: String(offerId),
    221 +    transaction_id: transaction.id,
    222 +    user_email: email,
    223 +    coupon_code: couponCode || '',
    224 +  };
    225 +
    226 +  let session = null;
    227 +  try {
    228 +    session = await stripeRequest(env, 'POST', '/v1/checkout/sessions', buildCheckoutParams({
    229 +      offer,
    230 +      amountCents,
    231 +      email,
    232 +      metadata,
    233 +      mode,
    234 +      feePercent,
    235 +      stripeAccountId: stripeAccount.stripe_account_id,
    236 +      successUrl,
    237 +      cancelUrl,
    238 +    }));
    239 +  } catch (error) {
    240 +    return errorResponse('stripe_error', error.status || 500, error.message, env);
    241 +  }
    242 +
    243 +  await updateEntity(env, 'Transaction', transaction.id, {
    244 +    stripe_session_id: session.id,
    245 +    checkout_url: session.url,
    246 +    updated_date: nowIso(),
    247 +  });
    248 +
    249 +  return json({ url: session.url, transaction_id: transaction.id }, { env });
    250 +}

• Added functions/api/checkout/create.js (+153 -0)
      1 +import { errorResponse, handleOptions, json, readJson } from '../_utils.js';
      2 +import { createEntity, listEntities } from '../_store.js';
      3 +import { createEntitlementsForOffer, recordCouponRedemption } from '../_billing.js';
      4 +import { isSchoolPublic } from '../_tenancy.js';
      5 +
      6 +function nowIso() {
      7 +  return new Date().toISOString();
      8 +}
      9 +
     10 +function hasExpired(value) {
     11 +  if (!value) return false;
     12 +  const date = new Date(value);
     13 +  if (Number.isNaN(date.valueOf())) return false;
     14 +  return date <= new Date();
     15 +}
     16 +
     17 +async function resolveSchool(env, schoolId) {
     18 +  if (!schoolId) return null;
     19 +  const rows = await listEntities(env, 'School', {
     20 +    filters: { id: String(schoolId) },
     21 +    limit: 1,
     22 +  });
     23 +  return rows?.[0] || null;
     24 +}
     25 +
     26 +async function resolveOffer(env, schoolId, offerId) {
     27 +  if (!schoolId || !offerId) return null;
     28 +  const rows = await listEntities(env, 'Offer', {
     29 +    filters: { school_id: String(schoolId), id: String(offerId) },
     30 +    limit: 1,
     31 +  });
     32 +  return rows?.[0] || null;
     33 +}
     34 +
     35 +async function resolveCoupon(env, schoolId, code) {
     36 +  if (!schoolId || !code) return null;
     37 +  const rows = await listEntities(env, 'Coupon', {
     38 +    filters: { school_id: String(schoolId), code: String(code).toUpperCase() },
     39 +    limit: 1,
     40 +  });
     41 +  return rows?.[0] || null;
     42 +}
     43 +
     44 +function computeDiscount(offer, coupon) {
     45 +  if (!offer || !coupon) return 0;
     46 +  if (coupon.is_active === false) return 0;
     47 +  if (coupon.expires_at && hasExpired(coupon.expires_at)) return 0;
     48 +  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return 0;
     49 +
     50 +  if (coupon.discount_type === 'PERCENTAGE') {
     51 +    return Math.round((offer.price_cents || 0) * (coupon.discount_value || 0) / 100);
     52 +  }
     53 +  if (coupon.discount_type === 'AMOUNT') {
     54 +    return Math.round((coupon.discount_value || 0) * 100);
     55 +  }
     56 +  return 0;
     57 +}
     58 +
     59 +async function findExistingTransaction(env, schoolId, idempotencyKey) {
     60 +  if (!idempotencyKey) return null;
     61 +  const rows = await listEntities(env, 'Transaction', {
     62 +    filters: { school_id: String(schoolId), idempotency_key: String(idempotencyKey) },
     63 +    limit: 1,
     64 +  });
     65 +  return rows?.[0] || null;
     66 +}
     67 +
     68 +export async function onRequest({ request, env }) {
     69 +  const options = handleOptions(request, env);
     70 +  if (options) return options;
     71 +
     72 +  if (request.method !== 'POST') {
     73 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
     74 +  }
     75 +
     76 +  const payload = await readJson(request);
     77 +  if (!payload) {
     78 +    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
     79 +  }
     80 +
     81 +  const schoolId = payload.school_id || payload.schoolId;
     82 +  const offerId = payload.offer_id || payload.offerId;
     83 +  const email = payload.email || payload.user_email || payload.userEmail;
     84 +  const couponCode = payload.coupon_code || payload.couponCode || null;
     85 +  const idempotencyKey = payload.idempotency_key || null;
     86 +
     87 +  if (!schoolId || !offerId || !email) {
     88 +    return errorResponse('missing_params', 400, 'school_id, offer_id, and email are required', env);
     89 +  }
     90 +
     91 +  const school = await resolveSchool(env, schoolId);
     92 +  if (!school) {
     93 +    return errorResponse('school_not_found', 404, 'School not found', env);
     94 +  }
     95 +
     96 +  const offer = await resolveOffer(env, schoolId, offerId);
     97 +  if (!offer || offer.is_active === false) {
     98 +    return errorResponse('offer_unavailable', 404, 'Offer not available', env);
     99 +  }
    100 +
    101 +  const isPublic = await isSchoolPublic(env, schoolId);
    102 +  if (!isPublic && !payload.allow_private) {
    103 +    return errorResponse('forbidden', 403, 'School is not public', env);
    104 +  }
    105 +
    106 +  const coupon = couponCode ? await resolveCoupon(env, schoolId, couponCode) : null;
    107 +  const discountCents = coupon ? computeDiscount(offer, coupon) : 0;
    108 +  const amountCents = Math.max(0, (offer.price_cents || 0) - discountCents);
    109 +
    110 +  const existing = await findExistingTransaction(env, schoolId, idempotencyKey);
    111 +  if (existing) {
    112 +    return json({ transaction_id: existing.id }, { env });
    113 +  }
    114 +
    115 +  const transaction = await createEntity(env, 'Transaction', {
    116 +    school_id: String(schoolId),
    117 +    user_email: email,
    118 +    offer_id: String(offerId),
    119 +    amount_cents: amountCents,
    120 +    discount_cents: discountCents,
    121 +    coupon_code: couponCode || null,
    122 +    provider: 'MANUAL',
    123 +    status: amountCents === 0 ? 'paid' : 'pending',
    124 +    idempotency_key: idempotencyKey || null,
    125 +    metadata: {
    126 +      referral_code: payload.referral_code || payload.refCode || null,
    127 +    },
    128 +    created_date: nowIso(),
    129 +  });
    130 +
    131 +  if (amountCents === 0) {
    132 +    await createEntitlementsForOffer({
    133 +      env,
    134 +      schoolId,
    135 +      offer,
    136 +      userEmail: email,
    137 +      source: 'PURCHASE',
    138 +      sourceId: transaction.id,
    139 +    });
    140 +    if (coupon) {
    141 +      await recordCouponRedemption({
    142 +        env,
    143 +        schoolId,
    144 +        coupon,
    145 +        transactionId: transaction.id,
    146 +        userEmail: email,
    147 +        discountCents,
    148 +      });
    149 +    }
    150 +  }
    151 +
    152 +  return json({ transaction_id: transaction.id }, { env });
    153 +}

• I'm planning to update the webhook to handle the checkout.session.completed event by parsing the event data to
  identify the school and transaction, then updating or creating a Transaction and related entitlements and
  subscriptions accordingly. I'll integrate existing billing functions and set up a helper to streamline processing
  these checkout events.

• Edited functions/api/stripe/webhook.js (+84 -0)
      2  import { createEntity, listEntities, updateEntity } from '../_store.js';
      3 +import { createEntitlementsForOffer, recordCouponRedemption } from '../_billing.js';
      4
        ⋮
    103
    104 +  const session = event?.data?.object || null;
    105 +  const eventType = String(event?.type || '');
    106 +  const isCheckoutComplete = eventType === 'checkout.session.completed'
    107 +    || eventType === 'checkout.session.async_payment_succeeded';
    108 +
    109 +  if (isCheckoutComplete && session) {
    110 +    const meta = session.metadata || {};
    111 +    const resolvedSchoolId = meta.school_id || schoolId;
    112 +    const transactionId = meta.transaction_id || session.client_reference_id || null;
    113 +    const offerId = meta.offer_id || null;
    114 +    const userEmail = meta.user_email || session.customer_email || null;
    115 +    const couponCode = meta.coupon_code || null;
    116 +
    117 +    let transaction = null;
    118 +    if (transactionId) {
    119 +      const rows = await listEntities(env, 'Transaction', {
    120 +        filters: { id: String(transactionId) },
    121 +        limit: 1,
    122 +      });
    123 +      transaction = rows?.[0] || null;
    124 +    }
    125 +
    126 +    if (transaction) {
    127 +      await updateEntity(env, 'Transaction', transaction.id, {
    128 +        status: 'paid',
    129 +        paid_at: nowIso(),
    130 +        stripe_session_id: session.id,
    131 +        provider_reference: session.payment_intent || session.subscription || null,
    132 +        updated_date: nowIso(),
    133 +      });
    134 +    } else if (resolvedSchoolId && offerId && userEmail) {
    135 +      transaction = await createEntity(env, 'Transaction', {
    136 +        school_id: String(resolvedSchoolId),
    137 +        user_email: userEmail,
    138 +        offer_id: String(offerId),
    139 +        amount_cents: session.amount_total || session.amount_subtotal || 0,
    140 +        discount_cents: session.total_details?.amount_discount || 0,
    141 +        coupon_code: couponCode || null,
    142 +        provider: 'STRIPE',
    143 +        status: 'paid',
    144 +        stripe_session_id: session.id,
    145 +        provider_reference: session.payment_intent || session.subscription || null,
    146 +        created_date: nowIso(),
    147 +      });
    148 +    }
    149 +
    150 +    if (transaction && resolvedSchoolId) {
    151 +      const offerRows = await listEntities(env, 'Offer', {
    152 +        filters: { id: String(transaction.offer_id || offerId), school_id: String(resolvedSchoolId) },
    153 +        limit: 1,
    154 +      });
    155 +      const offer = offerRows?.[0] || null;
    156 +      if (offer) {
    157 +        await createEntitlementsForOffer({
    158 +          env,
    159 +          schoolId: resolvedSchoolId,
    160 +          offer,
    161 +          userEmail: transaction.user_email,
    162 +          source: 'PURCHASE',
    163 +          sourceId: transaction.id,
    164 +        });
    165 +      }
    166 +
    167 +      if (couponCode && offer) {
    168 +        const couponRows = await listEntities(env, 'Coupon', {
    169 +          filters: { school_id: String(resolvedSchoolId), code: String(couponCode).toUpperCase() },
    170 +          limit: 1,
    171 +        });
    172 +        const coupon = couponRows?.[0] || null;
    173 +        if (coupon) {
    174 +          await recordCouponRedemption({
    175 +            env,
    176 +            schoolId: resolvedSchoolId,
    177 +            coupon,
    178 +            transactionId: transaction.id,
    179 +            userEmail: transaction.user_email,
    180 +            discountCents: transaction.discount_cents || 0,
    181 +          });
    182 +        }
    183 +      }
    184 +    }
    185 +  }
    186 +
    187    return json({ received: true }, { env });

• I’m updating SchoolCheckout.jsx to use new API endpoints, replacing the old scopedCreate transaction calls with base44
  requests. The checkout process will first try Stripe via the new endpoint and fallback to a manual checkout if Stripe
  returns a 409 error. I’ll simplify by removing useMutation for transactions and adjust handleCheckout accordingly,
  ensuring fallback navigation to the thank-you page with transaction ID, while considering event logging changes.

• Edited src/pages/SchoolCheckout.jsx (+85 -80)
      2  import { base44 } from '@/api/base44Client';
      3 -import { scopedCreate, scopedFilter } from '@/components/api/scoped';
      4 -import { useQuery, useMutation } from '@tanstack/react-query';
      3 +import { scopedFilter } from '@/components/api/scoped';
      4 +import { useQuery } from '@tanstack/react-query';
      5  import { useNavigate } from 'react-router-dom';
        ⋮
    112
    113 -  const createTransactionMutation = useMutation({
    114 -    mutationFn: async (data) => {
    115 -      setIsSubmitting(true);
    116 -      return await scopedCreate('Transaction', school.id, data);
    117 -    },
    118 -    onSuccess: (transaction) => {
    119 -      // Log purchase initiation
    120 -      try {
    121 -        scopedCreate('EventLog', school.id, {
    122 -          school_id: school.id,
    123 -          user_email: transaction.user_email,
    124 -          event_type: 'purchase_initiated',
    125 -          entity_type: 'TRANSACTION',
    126 -          entity_id: transaction.id,
    127 -          metadata: { offer_id: offer.id, idempotency_key: checkoutIdRef.current }
    128 -        });
    129 -      } catch (e) {
    130 -        // Optional log
    131 -      }
    132 -
    133 -      navigate(createPageUrl(`SchoolThankYou?slug=${slug}&transactionId=${transaction.id}`));
    134 -    },
    135 -    onSettled: () => {
    136 -      setIsSubmitting(false);
    137 -    }
    138 -  });
    139 -
    140 -  const handleApplyCoupon = () => {
    113 +  const handleApplyCoupon = () => {
    114      if (coupon) {
        ⋮
    133    };
    161 -
    162 -  const handleCheckout = async () => {
    163 -    const email = user?.email || guestEmail;
    164 -    if (!email) {
    165 -      toast.error('Please provide an email address');
    166 -      return;
    167 -    }
    168 -
    169 -    if (isSubmitting) return;
    134
    171 -    // Rate limit check
    172 -    const { allowed } = await checkRateLimit('checkout', email, school.id);
    173 -    if (!allowed) {
    174 -      toast.error('Too many attempts. Please try again later.');
    175 -      return;
    176 -    }
    177 -
    178 -    const finalAmount = Math.max(0, offer.price_cents - discount);
    179 -    const discountAmount = discount;
    180 -
    181 -    // Build metadata with attribution
    182 -    import('../components/analytics/attribution').then(({ getAttribution, attachAttribution }) => {
    183 -      const attribution = getAttribution({ schoolSlug: slug });
    184 -      const baseMetadata = {
    185 -        referral_code: refCode || undefined,
    186 -        idempotency_key: checkoutIdRef.current,
    187 -        checkout_session_id: checkoutIdRef.current
    188 -      };
    189 -      const metadata = attachAttribution(baseMetadata, attribution);
    190 -
    191 -      createTransactionMutation.mutate({
    192 -        school_id: school.id,
    193 -        user_email: email,
    194 -        offer_id: offer.id,
    195 -        amount_cents: finalAmount,
    196 -        discount_cents: discountAmount,
    197 -        coupon_code: couponCode || undefined,
    198 -        provider: 'MANUAL',
    199 -        status: 'pending',
    200 -        metadata
    201 -      });
    202 -    });
    203 -  };
    135 +  const handleCheckout = async () => {
    136 +    const email = user?.email || guestEmail;
    137 +    if (!email) {
    138 +      toast.error('Please provide an email address');
    139 +      return;
    140 +    }
    141 +
    142 +    if (isSubmitting) return;
    143 +
    144 +    // Rate limit check
    145 +    const { allowed } = await checkRateLimit('checkout', email, school.id);
    146 +    if (!allowed) {
    147 +      toast.error('Too many attempts. Please try again later.');
    148 +      return;
    149 +    }
    150 +
    151 +    setIsSubmitting(true);
    152 +
    153 +    const attributionModule = await import('../components/analytics/attribution');
    154 +    const attribution = attributionModule.getAttribution({ schoolSlug: slug });
    155 +    const metadata = attributionModule.attachAttribution({
    156 +      referral_code: refCode || undefined,
    157 +      idempotency_key: checkoutIdRef.current,
    158 +    }, attribution);
    159 +
    160 +    try {
    161 +      const stripeResponse = await base44.request('/stripe/checkout', {
    162 +        method: 'POST',
    163 +        body: {
    164 +          school_id: school.id,
    165 +          offer_id: offer.id,
    166 +          email,
    167 +          coupon_code: couponCode || undefined,
    168 +          idempotency_key: checkoutIdRef.current,
    169 +          referral_code: refCode || undefined,
    170 +          metadata,
    171 +          success_url: `${window.location.origin}/s/${slug}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    172 +          cancel_url: `${window.location.origin}/s/${slug}/pricing`,
    173 +        }
    174 +      });
    175 +
    176 +      if (stripeResponse?.url) {
    177 +        window.location.assign(stripeResponse.url);
    178 +        return;
    179 +      }
    180 +    } catch (error) {
    181 +      if (error?.status !== 409) {
    182 +        toast.error('Stripe checkout failed, using manual payment.');
    183 +      }
    184 +    }
    185 +
    186 +    try {
    187 +      const manual = await base44.request('/checkout/create', {
    188 +        method: 'POST',
    189 +        body: {
    190 +          school_id: school.id,
    191 +          offer_id: offer.id,
    192 +          email,
    193 +          coupon_code: couponCode || undefined,
    194 +          idempotency_key: checkoutIdRef.current,
    195 +          referral_code: refCode || undefined,
    196 +          metadata,
    197 +        }
    198 +      });
    199 +      if (manual?.transaction_id) {
    200 +        navigate(createPageUrl(`SchoolThankYou?slug=${slug}&transactionId=${manual.transaction_id}`));
    201 +        return;
    202 +      }
    203 +    } catch (error) {
    204 +      toast.error('Checkout failed. Please try again.');
    205 +    } finally {
    206 +      setIsSubmitting(false);
    207 +    }
    208 +  };
    346
    342 -          <Button
    343 -            size="lg"
    344 -            className="w-full h-14 text-lg font-bold shadow-lg"
    345 -            onClick={handleCheckout}
    348 -            {isSubmitting || createTransactionMutation.isPending ? 'Processing Securely...' : 'Complete Order &
          Get Access'}
    349 -          </Button>
    347 +          <Button
    348 +            size="lg"
    351 +            disabled={isSubmitting}
    352 +          >
    353 +            {isSubmitting ? 'Processing Securely...' : 'Complete Order & Get Access'}
    354 +          </Button>
    355

⚠ Heads up, you have less than 5% of your 5h limit left. Run /status for a breakdown.

• Ran Get-Content -Path src\pages\SchoolCheckout.jsx -TotalCount 40
  └ import React, { useState, useEffect } from 'react';
    import { base44 } from '@/api/base44Client';
    … +36 lines
      const couponFields = [
        'id',

• Ran Get-Content -Path src\pages\SchoolThankYou.jsx
  └ import React, { useState, useEffect } from 'react';
      );
    }

• Ran Get-Content -Path src\components\hooks\useStorefrontContext.jsx
  └ import { useParams } from 'react-router-dom';

    … +30 lines
      };
    }

• Edited src/components/hooks/useStorefrontContext.jsx (+3 -1)
    17    const transactionId = params.transactionId || urlParams.get('transactionId');
    18 +  const sessionId = urlParams.get('session_id') || urlParams.get('sessionId');
    19
       ⋮
    32      transactionId,
    33 +    sessionId,
    34      refCode
    35    };
    34 -}
    36 +}

• Ran rg -n "transaction" -n src\pages\SchoolThankYou.jsx
  └ 18:  const { schoolSlug: slug, transactionId } = useStorefrontContext();
    70:    if (transaction && school) {
    … +15 lines
    209:                  {transaction.discount_cents > 0 && (
    212:                      <span>-${(transaction.discount_cents / 100).toFixed(2)}</span>

• Edited src/pages/SchoolThankYou.jsx (+12 -5)
     17    const [authChecked, setAuthChecked] = useState(false);
     18 -  const { schoolSlug: slug, transactionId } = useStorefrontContext();
     18 +  const { schoolSlug: slug, transactionId, sessionId } = useStorefrontContext();
     19    const schoolFields = [
        ⋮
     93    const { data: transaction } = useQuery({
     94 -    queryKey: ['transaction', school?.id, transactionId],
     94 +    queryKey: ['transaction', school?.id, transactionId, sessionId],
     95      queryFn: async () => {
     96 -      const transactions = await scopedFilter('Transaction', school.id, { id: transactionId });
     97 -      return transactions[0];
     96 +      if (transactionId) {
     97 +        const transactions = await scopedFilter('Transaction', school.id, { id: transactionId });
     98 +        return transactions[0];
     99 +      }
    100 +      if (sessionId) {
    101 +        const transactions = await scopedFilter('Transaction', school.id, { stripe_session_id: sessionId });
    102 +        return transactions[0];
    105      },
     99 -    enabled: !!school?.id && !!transactionId && !!user
    106 +    enabled: !!school?.id && !!user && (!!transactionId || !!sessionId)
    107    });

• Edited src/pages/SchoolThankYou.jsx (+4 -4)
    201                  <div className="space-y-2 text-sm">
    202 -                  <div className="flex justify-between">
    203 -                    <span className="text-slate-600">Order ID:</span>
    204 -                    <span className="font-mono">{transactionId?.substring(0, 8)}</span>
    205 -                  </div>
    202 +                  <div className="flex justify-between">
    203 +                    <span className="text-slate-600">Order ID:</span>
    204 +                    <span className="font-mono">{(transaction?.id || transactionId || sessionId || '').substrin
         g(0, 8)}</span>
    205 +                  </div>
    206                    {offer && (

• I'm reviewing completed updates like sessionId inclusion, domain verification, API endpoint creation, and integration
  connection handling while planning to update environment variable docs and feature status tracking in README and
  multiple v11 docs to reflect new implementations and ongoing feature builds.

• Ran Get-Content -Path docs\v11\V11_MASTER_FEATURE_INDEX.md -TotalCount 200
  └ # V11 Master Feature Index (Breslov University)

    … +158 lines
    - Registry Key is required for features in src/components/config/features.jsx. Use N/A for platform-only features.
    - This file is validated by scripts/validate-v11-spec.mjs. P0 rows must include Owner and Acceptance Tests.

• Edited docs/v11/V11_MASTER_FEATURE_INDEX.md (+10 -10)
    134  | V11-PLAT-007 | N/A | Base44 + GitHub Release Discipline | platform | P0 | planned | Platform | branch model |
          G/W/T: main only via PR and checks | None | GitHub settings | CODEOWNERS |
    135 -| V11-PLAT-008 | N/A | Google OIDC SSO | platform | P0 | planned | Platform | OIDC, domain policy | G/W/T: Goog
         le login issues session and role mapping | None | Auth | auth/login/google |
    136 -| V11-PLAT-009 | N/A | Microsoft OIDC SSO | platform | P0 | planned | Platform | OIDC, domain policy | G/W/T: M
         icrosoft login issues session and role mapping | None | Auth | auth/login/microsoft |
    137 -| V11-PLAT-010 | N/A | Domain Verification + IdP Policies | platform | P0 | planned | Platform | DNS verify | G
         /W/T: unverified domain blocks SSO enable | None | Admin settings | DomainPolicy:update |
    138 -| V11-PLAT-011 | N/A | Google Classroom Sync | platform | P1 | planned | Platform | Classroom API | TBD | None
         | Admin integrations | Classroom:sync |
    139 -| V11-PLAT-012 | N/A | Google Drive Attachments | platform | P1 | planned | Platform | Drive API | TBD | None |
          Authoring | Drive:attach |
    140 -| V11-PLAT-013 | N/A | Microsoft OneDrive/SharePoint Attachments | platform | P1 | planned | Platform | Graph A
         PI | TBD | None | Authoring | OneDrive:attach |
    141 -| V11-PLAT-014 | N/A | Stripe Connect + Application Fees | platform | P0 | planned | Platform | Stripe Connect
         | G/W/T: payment splits apply platform fee | None | Monetization | Stripe:webhook |
    135 +| V11-PLAT-008 | N/A | Google OIDC SSO | platform | P0 | building | Platform | OIDC, domain policy | G/W/T: Goo
         gle login issues session and role mapping | None | Auth | auth/login/google |
    136 +| V11-PLAT-009 | N/A | Microsoft OIDC SSO | platform | P0 | building | Platform | OIDC, domain policy | G/W/T:
         Microsoft login issues session and role mapping | None | Auth | auth/login/microsoft |
    137 +| V11-PLAT-010 | N/A | Domain Verification + IdP Policies | platform | P0 | building | Platform | DNS verify |
         G/W/T: unverified domain blocks SSO enable | None | Admin settings | DomainPolicy:update |
    138 +| V11-PLAT-011 | N/A | Google Classroom Sync | platform | P1 | building | Platform | Classroom API | TBD | None
          | Admin integrations | Classroom:sync |
    139 +| V11-PLAT-012 | N/A | Google Drive Attachments | platform | P1 | building | Platform | Drive API | TBD | None
         | Authoring | Drive:attach |
    140 +| V11-PLAT-013 | N/A | Microsoft OneDrive/SharePoint Attachments | platform | P1 | building | Platform | Graph
         API | TBD | None | Authoring | OneDrive:attach |
    141 +| V11-PLAT-014 | N/A | Stripe Connect + Application Fees | platform | P0 | building | Platform | Stripe Connect
          | G/W/T: payment splits apply platform fee | None | Monetization | Stripe:webhook |
    142  | V11-PLAT-015 | N/A | Billing + Metering | platform | P0 | planned | Platform | Stripe, usage metrics | G/W/T:
          billing invoices reflect usage tiers | Data backfill | Admin billing | Invoice:create |
    143 -| V11-PLAT-016 | N/A | Cloudflare Stream Uploads | platform | P1 | planned | Platform | Stream API | TBD | None
         e | Authoring | Stream:upload |
    144  | V11-PLAT-017 | N/A | R2 Presigned Files | platform | P1 | planned | Platform | R2 | TBD | None | Materials |
         R2:presign |
        ⋮
    149  | V11-PLAT-022 | N/A | Download Tokenization | platform | P0 | building | Platform | DownloadToken | G/W/T: fil
         e URL never exposed before token validation | None | Downloads | DownloadToken:issue |
    150 -| V11-PLAT-023 | N/A | SSO Admin Wizard | platform | P1 | planned | Platform | domain policy | TBD | None | Adm
         in settings | SSOConfig:update |
    150 +| V11-PLAT-023 | N/A | SSO Admin Wizard | platform | P1 | building | Platform | domain policy | TBD | None | Ad
         min settings | SSOConfig:update |
    151  | V11-PLAT-024 | N/A | Onboarding Wizard | platform | P0 | planned | Platform | tenant setup | G/W/T: onboardin
         g creates school, admin, first course | None | Public onboarding | TenantApplication:create |
        ⋮
    155  | V11-PLAT-028 | N/A | Org Units (Campus/Department) | platform | P1 | planned | Platform | OrgUnit | TBD | Sch
         ema changes | Admin | OrgUnit:create |
    156 -| V11-PLAT-029 | N/A | Payment Webhooks + Ledger | platform | P0 | planned | Platform | Stripe | G/W/T: webhook
          updates ledger and audit log | Data backfill | Payments | Ledger:update |
    156 +| V11-PLAT-029 | N/A | Payment Webhooks + Ledger | platform | P0 | building | Platform | Stripe | G/W/T: webhoo
         k updates ledger and audit log | Data backfill | Payments | Ledger:update |
    157  | V11-PLAT-030 | N/A | Compliance Exports | platform | P1 | planned | Platform | AuditLog | TBD | None | Admin
         | Export:run |

• Ran Get-Content -Path docs\v11\V11_DOMAIN_MODEL.md
  └ # V11 Domain Model (Tenant First)

    … +71 lines
    - All school scoped entities must include school_id and be queried via scoped helpers.
    - Public surfaces must filter to is_public schools and avoid fetching locked content.

• Edited docs/v11/V11_DOMAIN_MODEL.md (+6 -1)
    17  - UserSchoolPreference (global): id, user_email, active_school_id
    18 -- SchoolAuthPolicy (school scoped): allowed_providers, allowed_domains, require_domain_match, auto_provision
    18 +- SchoolAuthPolicy (school scoped): allowed_providers, allowed_domains, require_domain_match, require_domain_ver
        ification, auto_provision, domain_role_map
    19 +- DomainVerification (school scoped): domain, token, status, verified_at, expires_at
    20
       ⋮
    55  - DownloadToken (school scoped): token, download_id, expires_at, used_at
    56 +- StreamUpload (school scoped): stream_uid, upload_url, lesson_id, status
    57
       ⋮
    59  - Integration (global): marketplace metadata
    60 +- IntegrationState (global): provider, school_id, expires_at
    61 +- IntegrationSecret (global): provider, school_id, access_token, refresh_token
    62 +- IntegrationConnection (school scoped): provider, status, connected_at, scopes
    63  - GoogleOAuthToken, GoogleDriveToken (global)

• Edited README.md (+14 -0)
     86  - `STRIPE_API_VERSION`: Stripe API version override (defaults to 2023-10-16).
     87 +- `PLATFORM_FEE_PERCENT`: Default platform fee percent for Connect (optional).
     88
        ⋮
    101
    102 +### Optional environment variables (Integrations)
    103 +- `GOOGLE_INTEGRATION_CLIENT_ID`: Google OAuth client ID for Classroom/Drive.
    104 +- `GOOGLE_INTEGRATION_CLIENT_SECRET`: Google OAuth client secret for Classroom/Drive.
    105 +- `GOOGLE_INTEGRATION_REDIRECT_URI`: Override Google integration callback URL.
    106 +- `MICROSOFT_GRAPH_CLIENT_ID`: Microsoft OAuth client ID for OneDrive/SharePoint.
    107 +- `MICROSOFT_GRAPH_CLIENT_SECRET`: Microsoft OAuth client secret.
    108 +- `MICROSOFT_GRAPH_TENANT`: Microsoft tenant (defaults to `common`).
    109 +- `MICROSOFT_GRAPH_REDIRECT_URI`: Override Microsoft integration callback URL.
    110 +
    111 +### Optional environment variables (Cloudflare Stream)
    112 +- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID for Stream.
    113 +- `CLOUDFLARE_STREAM_TOKEN`: API token with Stream permissions.
    114 +
    115  ### D1 schema

• I’m checking how access gating impacts field projection for global admins and want to fix the logic so global admins
  get field restrictions respected properly, especially for Lesson and QuizQuestion entities. It looks like the current
  code overrides fields incorrectly, so I’ll plan to patch that.

• Edited functions/api/entities/[entity].js (+4 -3)
    182      const rawPreview = previewChars;
    183 -    const listFields = requiresAccessGate ? null : rawFields;
    184 -    const listPreviewChars = requiresAccessGate ? null : rawPreview;
    183 +    const shouldGate = requiresAccessGate && !globalAdmin;
    184 +    const listFields = shouldGate ? null : rawFields;
    185 +    const listPreviewChars = shouldGate ? null : rawPreview;
    186
        ⋮
    188        let rows = await listEntities(env, entity, { filters, sort, limit, fields: listFields, previewChars: list
         PreviewChars });
    188 -      if (!globalAdmin && requiresAccessGate) {
    189 +      if (shouldGate) {
    190          if (entity === 'Lesson') {

• I'm verifying that access gating logic applies correctly, especially for global admins and membership checks, and
  reviewing related component updates like PremiumVideoPlayer and SchoolCheckout. I’m also planning to adjust
  SchoolCheckout’s UI to better reflect Stripe availability without complex auth checks, aiming for clearer payment
  messaging with dynamic text.

• Edited src/pages/SchoolCheckout.jsx (+17 -18)
    314            {/* Payment Method & Trust */}
    315 -          <Card className="shadow-sm border-amber-100">
    316 -            <CardHeader className="pb-2">
    317 -              <CardTitle className="text-sm font-semibold flex items-center gap-2">
    318 -                <Lock className="w-4 h-4 text-amber-600" />
    319 -                Secure Checkout
    320 -              </CardTitle>
    321 -            </CardHeader>
    322 -            <CardContent className="space-y-4">
    323 -              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 text-center">
    324 -                <p className="text-amber-900 font-bold mb-3">
    325 -                  Manual Payment Processing
    326 -                </p>
    327 -                <p className="text-sm text-amber-800 leading-relaxed">
    328 -                  We currently accept manual payments (Bank Transfer, Zelle, PayPal).
    329 -                  After clicking "Complete Order", you will receive an email with our payment details.
    330 -                  Once paid, your course access will be activated within 24 hours.
    331 -                </p>
    332 -              </div>
    315 +          <Card className="shadow-sm border-amber-100">
    316 +            <CardHeader className="pb-2">
    317 +              <CardTitle className="text-sm font-semibold flex items-center gap-2">
    318 +                <Lock className="w-4 h-4 text-amber-600" />
    319 +                Secure Checkout
    320 +              </CardTitle>
    321 +            </CardHeader>
    322 +            <CardContent className="space-y-4">
    323 +              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 text-center">
    324 +                <p className="text-amber-900 font-bold mb-3">
    325 +                  Fast checkout options
    326 +                </p>
    327 +                <p className="text-sm text-amber-800 leading-relaxed">
    328 +                  If card payments are enabled for this school, you will be redirected to secure Stripe checkou
         t.
    329 +                  Otherwise, manual payment instructions (Bank Transfer, Zelle, PayPal) will be sent by email.
    330 +                </p>
    331 +              </div>
    332

• Edited functions/api/_access.js (+26 -1)
     71
     72 +async function buildCourseMap(env, schoolId, lessons) {
     73 +  const map = new Map();
     74 +  const ids = new Set((lessons || []).map((lesson) => lesson?.course_id).filter(Boolean));
     75 +  for (const id of ids) {
     76 +    const rows = await listEntities(env, 'Course', {
     77 +      filters: { school_id: String(schoolId), id: String(id) },
     78 +      limit: 1,
     79 +    });
     80 +    if (rows?.[0]) {
     81 +      map.set(String(id), rows[0]);
     82 +    }
     83 +  }
     84 +  return map;
     85 +}
     86 +
     87 +function isCourseFree(course) {
     88 +  if (!course) return false;
     89 +  const level = String(course.access_level || '').toUpperCase();
     90 +  if (level === 'FREE' || level === 'PUBLIC') return true;
     91 +  if (String(course.access_tier || '').toLowerCase() === 'free') return true;
     92 +  return false;
     93 +}
     94 +
     95  function getEnrollDate(entitlements, courseId) {
        ⋮
    164    const entitlements = await getActiveEntitlements(env, schoolId, userEmail);
    165 +  const courseMap = await buildCourseMap(env, schoolId, lessons);
    166
    167    return lessons.map((lesson) => {
    144 -    const courseAccess = hasCourseAccess(entitlements, lesson.course_id);
    168 +    const course = courseMap.get(String(lesson.course_id || '')) || null;
    169 +    const courseAccess = isCourseFree(course) || hasCourseAccess(entitlements, lesson.course_id);
    170      let access = 'LOCKED';

• I'll enhance quiz access control to allow free courses by fetching each quiz's course and checking if it's free; this
  requires adding a getCourse helper and updating resolveQuizAccess and applyQuizQuestionAccess accordingly.

• Edited functions/api/_access.js (+13 -3)
    217
    218 -function resolveQuizAccess({ quiz, entitlements, staff }) {
    218 +async function getCourse(env, schoolId, courseId) {
    219 +  if (!schoolId || !courseId) return null;
    220 +  const rows = await listEntities(env, 'Course', {
    221 +    filters: { school_id: String(schoolId), id: String(courseId) },
    222 +    limit: 1,
    223 +  });
    224 +  return rows?.[0] || null;
    225 +}
    226 +
    227 +function resolveQuizAccess({ quiz, entitlements, staff, course }) {
    228    if (!quiz) return 'LOCKED';
        ⋮
    230    if (!quiz.course_id) return 'FULL';
    222 -  const courseAccess = hasCourseAccess(entitlements, quiz.course_id);
    231 +  const courseAccess = isCourseFree(course) || hasCourseAccess(entitlements, quiz.course_id);
    232    if (courseAccess) return 'FULL';
        ⋮
    255      const quiz = await getQuizMeta(env, schoolId, quizId);
    247 -    const access = resolveQuizAccess({ quiz, entitlements, staff });
    258      if (access === 'LOCKED') continue;

• Edited src/pages/SchoolThankYou.jsx (+9 -7)
    221                    )}
    222 -                  <div className="flex justify-between pt-2 border-t">
    225 -                  </div>
    226 -                </div>
    227 -              </div>
    228 -            )}
    222 +                  <div className="flex justify-between pt-2 border-t">
    223 +                    <span className="text-slate-600">Status:</span>
    224 +                    <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'}>
    225 +                      {transaction.status === 'paid' ? 'Paid' : 'Pending Payment'}
    226 +                    </Badge>
    227 +                  </div>
    228 +                </div>
    229 +              </div>
    230 +            )}
    231

• Ran Get-Content -Path docs\v11\V11_ACCEPTANCE_CRITERIA.md
  └ # V11 Acceptance Criteria (P0)

    … +37 lines
    ## Integrity Diagnostics
    - Given an admin, when they open /integrity, then the scan reports tenancy guard and drift checks.

• Ran Get-Content -Path functions\api\_auth.js
  └ import { createEntity, listEntities, updateEntity } from './_store.js';

    … +100 lines
      return Boolean(revoked);
    }

• I'm reviewing a thorough list of updates across the codebase related to domain verification, role handling,
  integrations, policy application, UI tweaks, and Stripe checkout enhancements. I’m considering where changes are
  needed, what’s already done, and possible next small improvements like adding client_reference_id support in Stripe
  checkout params to better link transactions with webhooks. This careful walkthrough helps me keep track of all moving
  parts before implementing or testing anything.

• Edited functions/api/stripe/checkout.js (+3 -1)
     89
     90 -function buildCheckoutParams({ offer, amountCents, email, metadata, mode, feePercent, stripeAccountId, successU
         rl, cancelUrl }) {
     90 +function buildCheckoutParams({ offer, amountCents, email, metadata, mode, feePercent, stripeAccountId, successU
         rl, cancelUrl, clientReferenceId }) {
     91    const params = {
        ⋮
     95      customer_email: email,
     96 +    client_reference_id: clientReferenceId,
     97      'line_items[0][quantity]': 1,
        ⋮
    238        cancelUrl,
    239 +      clientReferenceId: transaction.id,
    240      }));

• Edited src/pages/SchoolThankYou.jsx (+21 -16)
    180
    181 -            <h1 className="text-3xl font-bold text-slate-900 mb-4">Order Received!</h1>
    182 -
    183 -            <p className="text-lg text-slate-600 mb-6">
    184 -              Thank you for your purchase. We've received your order and will process it shortly.
    185 -            </p>
    186 -
    187 -            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
    188 -              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
    189 -              <p className="text-slate-700 mb-2">
    190 -                <strong>What happens next?</strong>
    191 -              </p>
    192 -              <p className="text-sm text-slate-600">
    193 -                Our team will contact you via email within 24 hours with payment instructions.
    194 -                Once payment is confirmed, you'll receive immediate access to your course(s).
    195 -              </p>
    196 -            </div>
    181 +            <h1 className="text-3xl font-bold text-slate-900 mb-4">
    182 +              {transaction?.status === 'paid' ? 'Payment Confirmed!' : 'Order Received!'}
    183 +            </h1>
    184 +
    185 +            <p className="text-lg text-slate-600 mb-6">
    186 +              {transaction?.status === 'paid'
    187 +                ? 'Thank you for your purchase. Your payment has been confirmed.'
    188 +                : 'Thank you for your purchase. We have received your order and will process it shortly.'}
    189 +            </p>
    190 +
    191 +            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
    192 +              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
    193 +              <p className="text-slate-700 mb-2">
    194 +                <strong>What happens next?</strong>
    195 +              </p>
    196 +              <p className="text-sm text-slate-600">
    197 +                {transaction?.status === 'paid'
    198 +                  ? 'Your access is now active. You can start learning immediately from your dashboard.'
    199 +                  : 'Our team will contact you via email within 24 hours with payment instructions. Once paymen
         t is confirmed, your access will unlock.'}
    200 +              </p>
    201 +            </div>
    202

• Edited functions/api/stripe/checkout.js (+9 -1)
    189    if (amountCents === 0) {
    190 +    await updateEntity(env, 'Transaction', transaction.id, {
    191 +      paid_at: nowIso(),
    192 +      updated_date: nowIso(),
    193 +    });
    194      await createEntitlementsForOffer({
        ⋮
    211      }
    208 -    return json({ url: payload.success_url || '/', transaction_id: transaction.id, free: true }, { env });
    212 +    return json({
    213 +      url: payload.success_url || `${new URL(request.url).origin}/s/${school.slug || 'demo'}/thank-you?transact
         ionId=${transaction.id}`,
    214 +      transaction_id: transaction.id,
    215 +      free: true,
    216 +    }, { env });
    217    }

• Edited functions/api/checkout/create.js (+8 -0)
    131    if (amountCents === 0) {
    132 +    await createEntity(env, 'AuditLog', {
    133 +      school_id: String(schoolId),
    134 +      user_email: email,
    135 +      action: 'TRANSACTION_PAID',
    136 +      entity_type: 'Transaction',
    137 +      entity_id: transaction.id,
    138 +      metadata: { amount_cents: amountCents },
    139 +    });
    140      await createEntitlementsForOffer({

• Edited functions/api/checkout/create.js (+2 -0)
    123      status: amountCents === 0 ? 'paid' : 'pending',
    124 +    paid_at: amountCents === 0 ? nowIso() : null,
    125 +    updated_date: nowIso(),
    126      idempotency_key: idempotencyKey || null,

• Edited functions/api/stripe/webhook.js (+22 -0)
    183        }
    184 +
    185 +      if (session.mode === 'subscription' && session.subscription) {
    186 +        const existingSubs = await listEntities(env, 'Subscription', {
    187 +          filters: { school_id: String(resolvedSchoolId), stripe_subscription_id: String(session.subscription)
         },
    188 +          limit: 1,
    189 +        });
    190 +        if (existingSubs?.[0]) {
    191 +          await updateEntity(env, 'Subscription', existingSubs[0].id, {
    192 +            status: 'active',
    193 +            updated_date: nowIso(),
    194 +          });
    195 +        } else {
    196 +          await createEntity(env, 'Subscription', {
    197 +            school_id: String(resolvedSchoolId),
    198 +            user_email: transaction.user_email,
    199 +            offer_id: transaction.offer_id || offerId,
    200 +            stripe_subscription_id: String(session.subscription),
    201 +            status: 'active',
    202 +            created_date: nowIso(),
    203 +          });
    204 +        }
    205 +      }
    206      }

• Edited functions/api/entities/[entity].js (+10 -0)
    22
    23 +async function hasAdminRole(env, schoolId, email) {
    24 +  if (!schoolId || !email) return false;
    25 +  const rows = await listEntities(env, 'SchoolMembership', {
    26 +    filters: { school_id: String(schoolId), user_email: String(email) },
    27 +    limit: 1,
    28 +  });
    29 +  const role = String(rows?.[0]?.role || '').toUpperCase();
    30 +  return ['OWNER', 'ADMIN', 'SUPERADMIN'].includes(role);
    31 +}
    32 +
    33  function normalizePreviewChars(value) {

• Edited functions/api/entities/[entity].js (+12 -0)
    166          const isMember = await hasMembership(env, schoolId, user.email);
    167 +        if (entity === 'DomainVerification') {
    168 +          const isAdmin = await hasAdminRole(env, schoolId, user.email);
    169 +          if (!isAdmin) {
    170 +            return errorResponse('forbidden', 403, 'Admin role required', env);
    171 +          }
    172 +        }
    173          if (!isMember && publicRule && publicFilters) {
        ⋮
    244        if (!globalAdmin) {
    245 +        if (entity === 'DomainVerification') {
    246 +          const isAdmin = await hasAdminRole(env, schoolId, user.email);
    247 +          if (!isAdmin) {
    248 +            return errorResponse('forbidden', 403, 'Admin role required', env);
    249 +          }
    250 +        }
    251          if (entity === 'SchoolMembership') {

• Edited functions/api/entities/[entity]/[id].js (+28 -0)
     17
     18 +async function hasAdminRole(env, schoolId, email) {
     19 +  if (!schoolId || !email) return false;
     20 +  const rows = await listEntities(env, 'SchoolMembership', {
     21 +    filters: { school_id: String(schoolId), user_email: String(email) },
     22 +    limit: 1,
     23 +  });
     24 +  const role = String(rows?.[0]?.role || '').toUpperCase();
     25 +  return ['OWNER', 'ADMIN', 'SUPERADMIN'].includes(role);
     26 +}
     27 +
     28  export async function onRequest({ request, env, params }) {
        ⋮
    109          const isMember = await hasMembership(env, record.school_id, user.email);
    110 +        if (entity === 'DomainVerification') {
    111 +          const isAdmin = await hasAdminRole(env, record.school_id, user.email);
    112 +          if (!isAdmin) {
    113 +            return errorResponse('forbidden', 403, 'Admin role required', env);
    114 +          }
    115 +        }
    116          if (!isMember && publicRule) {
        ⋮
    183          const isMember = await hasMembership(env, schoolId, user.email);
    184 +        if (entity === 'DomainVerification') {
    185 +          const isAdmin = await hasAdminRole(env, schoolId, user.email);
    186 +          if (!isAdmin) {
    187 +            return errorResponse('forbidden', 403, 'Admin role required', env);
    188 +          }
    189 +        }
    190          const invitee = entity === 'SchoolInvite' && String(record.email || '').toLowerCase() === String(user.e
         mail || '').toLowerCase();
        ⋮
    245          const isMember = await hasMembership(env, schoolId, user.email);
    246 +        if (entity === 'DomainVerification') {
    247 +          const isAdmin = await hasAdminRole(env, schoolId, user.email);
    248 +          if (!isAdmin) {
    249 +            return errorResponse('forbidden', 403, 'Admin role required', env);
    250 +          }
    251 +        }
    252          if (!isMember) {

• Edited src/pages/SchoolCheckout.jsx (+1 -1)
    89      queryFn: async () => {
    90 -      const offers = await scopedFilter('Offer', school.id, { id: offerId }, null, 1, { fields: offerFields });
    90 +      const offers = await scopedFilter('Offer', school.id, { id: offerId, is_active: true }, null, 1, { fields:
         offerFields });
    91        return offers[0];

• Edited functions/api/stripe/checkout.js (+3 -2)
    159    const coupon = couponCode ? await resolveCoupon(env, schoolId, couponCode) : null;
    160 -  const discountCents = coupon ? computeDiscount(offer, coupon) : 0;
    161 -  const amountCents = Math.max(0, (offer.price_cents || 0) - discountCents);
    160 +  const basePrice = Number(offer.price_cents || 0);
    161 +  const discountCents = coupon ? computeDiscount({ ...offer, price_cents: basePrice }, coupon) : 0;
    162 +  const amountCents = Math.max(0, Math.round(basePrice) - discountCents);
    163

• Edited functions/api/checkout/create.js (+3 -2)
    106    const coupon = couponCode ? await resolveCoupon(env, schoolId, couponCode) : null;
    107 -  const discountCents = coupon ? computeDiscount(offer, coupon) : 0;
    108 -  const amountCents = Math.max(0, (offer.price_cents || 0) - discountCents);
    107 +  const basePrice = Number(offer.price_cents || 0);
    108 +  const discountCents = coupon ? computeDiscount({ ...offer, price_cents: basePrice }, coupon) : 0;
    109 +  const amountCents = Math.max(0, Math.round(basePrice) - discountCents);
    110

• I'm reviewing a series of code updates and upcoming tasks, covering API fixes, imports, subscription price handling,
  and feature additions like referral code metadata for Stripe. There are several noted features not yet implemented but
  flagged as suggestions, while confirming certain fields don't need changes. Next, I'll patch adding referral_code to
  Stripe metadata to keep discount and affiliate info consistent.

• Edited functions/api/stripe/checkout.js (+1 -0)
    233      coupon_code: couponCode || '',
    234 +    referral_code: payload.referral_code || payload.refCode || '',
    235    };

• I’m considering various small updates and optional features, like improving referral recording, showing discounts on
  checkout, potential UI additions for cloud attachments, and minor docs and security notes. I’ll focus on patching the
  SECURITY_INVARIANTS.md to mention new server gating while deferring more complex integrations and UI work for now.

• Edited SECURITY_INVARIANTS.md (+1 -0)
    19  - Watermarks must include user identity (email) when protected.
    20 +- Lesson and quiz payloads are sanitized server-side for non-entitled users (no full content leakage).
    21

• Edited src/components/learning/PremiumVideoPlayer.jsx (+5 -1)
    23    const schoolId = lesson?.school_id;
    24 -
    24 +
    25 +  useEffect(() => {
    26 +    setPreviewEnded(false);
    27 +  }, [lesson?.id, accessLevel]);
    28 +
    29    useEffect(() => {

• Edited functions/api/integrations/google/callback.js (+2 -1)
    123    const state = stateRows?.[0];
    124 -  if (!state || state.used_at || state.revoked_at) {
    124 +  const expired = state?.expires_at ? new Date(state.expires_at) <= new Date() : false;
    125 +  if (!state || state.used_at || state.revoked_at || expired) {
    126      return errorResponse('invalid_state', 400, 'Integration state expired', env);

• Edited functions/api/integrations/microsoft/callback.js (+2 -1)
    127    const state = stateRows?.[0];
    128 -  if (!state || state.used_at || state.revoked_at) {
    128 +  const expired = state?.expires_at ? new Date(state.expires_at) <= new Date() : false;
    129 +  if (!state || state.used_at || state.revoked_at || expired) {
    130      return errorResponse('invalid_state', 400, 'Integration state expired', env);

• There is a lot here! I'm going through various notes on integration fields, API updates, logging choices, UI tweaks,
  and documentation changes—mostly confirming what needs to be done or is already done. The main focus is updating the
  project plan phases to reflect what's completed, in progress, or pending based on the recent work around SSO, domain
  verification, connectors scaffolding, media and billing implementations. I’m carefully weighing which phases to mark
  as completed or in progress while respecting the “only one phase in progress” rule and preparing an explanation for
  the plan update.

• Updated Plan
  └ Completed governance/spec updates, SSO hardening, and OAuth connector scaffolding; began media/billing
    implementation (Stream + Stripe checkout).
    ✔ Phase 0-1: Governance + spec pack enforcement (branch model docs, parity checks, release gates CI hooks).
    ✔ Phase 2: Identity & SSO hardening (OIDC claim mapping, domain verification scaffolding, policy enforcement UI).
    ✔ Phase 3-4: Classroom + M365 connectors foundations (API scaffolds, config entities, UI panels).
    □ Phase 5-6: Media + billing (Cloudflare Stream/R2 upload flows, Stripe Connect fees + checkout).
    □ Phase 7-8: Deployment adapters + onboarding funnel upgrades.
    □ Phase 9-10: Security hardening, audit logging, observability, launch gates.

• I'm planning to implement a Cloudflare R2 presigned URL generator using AWS SigV4 signing in a new API endpoint. This
  involves creating secure PUT and GET URLs with proper auth and path validation, leveraging environment variables for
  keys, and using crypto functions for signature computation—all to support teacher uploads securely and comply with the
  project’s harder, more sophisticated criteria.

• Added functions/api/media/r2/presign.js (+183 -0)
      1 +import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../../_utils.js';
      2 +import { listEntities } from '../../_store.js';
      3 +import { getUserFromToken } from '../../_auth.js';
      4 +import { hasMembership, isGlobalAdmin } from '../../_tenancy.js';
      5 +
      6 +const DEFAULT_EXPIRES = 900;
      7 +
      8 +function toHex(buffer) {
      9 +  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
     10 +}
     11 +
     12 +async function sha256(message) {
     13 +  const data = new TextEncoder().encode(message);
     14 +  const hash = await crypto.subtle.digest('SHA-256', data);
     15 +  return toHex(hash);
     16 +}
     17 +
     18 +async function hmac(key, message) {
     19 +  const cryptoKey = await crypto.subtle.importKey(
     20 +    'raw',
     21 +    key,
     22 +    { name: 'HMAC', hash: 'SHA-256' },
     23 +    false,
     24 +    ['sign']
     25 +  );
     26 +  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
     27 +  return new Uint8Array(signature);
     28 +}
     29 +
     30 +async function getSignatureKey(secret, dateStamp, region, service) {
     31 +  const kDate = await hmac(new TextEncoder().encode(`AWS4${secret}`), dateStamp);
     32 +  const kRegion = await hmac(kDate, region);
     33 +  const kService = await hmac(kRegion, service);
     34 +  return hmac(kService, 'aws4_request');
     35 +}
     36 +
     37 +function formatAmzDate(date) {
     38 +  const pad = (n) => String(n).padStart(2, '0');
     39 +  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHour
         s())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
     40 +}
     41 +
     42 +function formatDateStamp(date) {
     43 +  const pad = (n) => String(n).padStart(2, '0');
     44 +  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
     45 +}
     46 +
     47 +function normalizeKey(key) {
     48 +  return String(key || '').replace(/^\/+/, '').trim();
     49 +}
     50 +
     51 +function getR2Config(env) {
     52 +  const accessKeyId = env?.R2_ACCESS_KEY_ID || '';
     53 +  const secretAccessKey = env?.R2_SECRET_ACCESS_KEY || '';
     54 +  const bucket = env?.R2_BUCKET || '';
     55 +  const endpoint = env?.R2_ENDPOINT || '';
     56 +  const region = env?.R2_REGION || 'auto';
     57 +  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) return null;
     58 +  return { accessKeyId, secretAccessKey, bucket, endpoint, region };
     59 +}
     60 +
     61 +async function getMembershipRole(env, schoolId, email) {
     62 +  if (!schoolId || !email) return null;
     63 +  const rows = await listEntities(env, 'SchoolMembership', {
     64 +    filters: { school_id: String(schoolId), user_email: String(email) },
     65 +    limit: 1,
     66 +  });
     67 +  return rows?.[0]?.role || null;
     68 +}
     69 +
     70 +function isTeacherRole(role) {
     71 +  const normalized = String(role || '').toUpperCase();
     72 +  return ['OWNER', 'ADMIN', 'INSTRUCTOR', 'TEACHER', 'TA', 'RAV', 'RABBI'].includes(normalized);
     73 +}
     74 +
     75 +export async function onRequest({ request, env }) {
     76 +  const options = handleOptions(request, env);
     77 +  if (options) return options;
     78 +
     79 +  if (request.method !== 'POST') {
     80 +    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
     81 +  }
     82 +
     83 +  const token = getBearerToken(request);
     84 +  const user = await getUserFromToken(token, env);
     85 +  if (!user?.email) {
     86 +    return errorResponse('auth_required', 401, 'Authentication required', env);
     87 +  }
     88 +
     89 +  const payload = await readJson(request);
     90 +  if (!payload) {
     91 +    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
     92 +  }
     93 +
     94 +  const schoolId = payload.school_id || payload.schoolId;
     95 +  const rawKey = payload.key || '';
     96 +  const method = String(payload.method || 'PUT').toUpperCase();
     97 +  const expiresIn = Math.min(Number(payload.expires_in || DEFAULT_EXPIRES), 3600);
     98 +
     99 +  if (!schoolId || !rawKey) {
    100 +    return errorResponse('missing_params', 400, 'school_id and key are required', env);
    101 +  }
    102 +  if (!['PUT', 'GET'].includes(method)) {
    103 +    return errorResponse('invalid_method', 400, 'method must be GET or PUT', env);
    104 +  }
    105 +
    106 +  const globalAdmin = isGlobalAdmin(user, env);
    107 +  if (!globalAdmin) {
    108 +    const member = await hasMembership(env, schoolId, user.email);
    109 +    if (!member) {
    110 +      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    111 +    }
    112 +    const role = await getMembershipRole(env, schoolId, user.email);
    113 +    if (!isTeacherRole(role)) {
    114 +      return errorResponse('forbidden', 403, 'Teacher role required', env);
    115 +    }
    116 +  }
    117 +
    118 +  const config = getR2Config(env);
    119 +  if (!config) {
    120 +    return errorResponse('not_configured', 500, 'R2 credentials not configured', env);
    121 +  }
    122 +
    123 +  const key = normalizeKey(rawKey);
    124 +  if (!key.startsWith(`schools/${schoolId}/`)) {
    125 +    return errorResponse('invalid_key', 400, 'Key must be prefixed with schools/{schoolId}/', env);
    126 +  }
    127 +
    128 +  const now = new Date();
    129 +  const amzDate = formatAmzDate(now);
    130 +  const dateStamp = formatDateStamp(now);
    131 +  const service = 's3';
    132 +  const scope = `${dateStamp}/${config.region}/${service}/aws4_request`;
    133 +  const credential = `${config.accessKeyId}/${scope}`;
    134 +
    135 +  const endpointUrl = new URL(config.endpoint);
    136 +  const canonicalUri = `/${config.bucket}/${key}`;
    137 +
    138 +  const params = new URLSearchParams();
    139 +  params.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
    140 +  params.set('X-Amz-Credential', credential);
    141 +  params.set('X-Amz-Date', amzDate);
    142 +  params.set('X-Amz-Expires', String(expiresIn));
    143 +  params.set('X-Amz-SignedHeaders', 'host');
    144 +
    145 +  const canonicalQuery = Array.from(params.entries())
    146 +    .sort((a, b) => a[0].localeCompare(b[0]))
    147 +    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    148 +    .join('&');
    149 +
    150 +  const canonicalHeaders = `host:${endpointUrl.host}\n`;
    151 +  const signedHeaders = 'host';
    152 +  const payloadHash = 'UNSIGNED-PAYLOAD';
    153 +
    154 +  const canonicalRequest = [
    155 +    method,
    156 +    canonicalUri,
    157 +    canonicalQuery,
    158 +    canonicalHeaders,
    159 +    signedHeaders,
    160 +    payloadHash,
    164 +    'AWS4-HMAC-SHA256',
    165 +    amzDate,
    166 +    scope,

