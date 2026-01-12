const DEFAULT_GOOGLE_SCOPES = 'openid email profile';
const DEFAULT_MICROSOFT_SCOPES = 'openid email profile';

function normalizeBaseUrl(url) {
  if (!url) return '';
  return String(url).trim();
}

function buildRedirectUri(provider, env, origin) {
  const key = provider === 'google' ? env?.GOOGLE_OIDC_REDIRECT_URI : env?.MICROSOFT_OIDC_REDIRECT_URI;
  if (key) return normalizeBaseUrl(key);
  return new URL('/api/auth/oidc/callback', origin).toString();
}

function getGoogleIssuer() {
  return 'https://accounts.google.com';
}

function getGoogleJwksUrl() {
  return 'https://www.googleapis.com/oauth2/v3/certs';
}

function getMicrosoftTenant(env) {
  const raw = env?.MICROSOFT_OIDC_TENANT || 'common';
  return String(raw || 'common');
}

function getMicrosoftIssuer(env) {
  const tenant = getMicrosoftTenant(env);
  return `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/v2.0`;
}

function getMicrosoftJwksUrl(env) {
  const tenant = getMicrosoftTenant(env);
  return `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/discovery/v2.0/keys`;
}

export function getProviderConfig(provider, env, origin) {
  const normalized = String(provider || '').toLowerCase();
  if (normalized === 'google') {
    const clientId = env?.GOOGLE_OIDC_CLIENT_ID || '';
    const clientSecret = env?.GOOGLE_OIDC_CLIENT_SECRET || '';
    if (!clientId || !clientSecret) return null;
    return {
      id: 'google',
      clientId,
      clientSecret,
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userinfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      jwksUrl: getGoogleJwksUrl(),
      issuer: getGoogleIssuer(),
      issuerAliases: ['accounts.google.com'],
      scopes: env?.GOOGLE_OIDC_SCOPES || DEFAULT_GOOGLE_SCOPES,
      redirectUri: buildRedirectUri('google', env, origin),
      prompt: env?.GOOGLE_OIDC_PROMPT || 'select_account',
    };
  }

  if (normalized === 'microsoft') {
    const clientId = env?.MICROSOFT_OIDC_CLIENT_ID || '';
    const clientSecret = env?.MICROSOFT_OIDC_CLIENT_SECRET || '';
    if (!clientId || !clientSecret) return null;
    const tenant = getMicrosoftTenant(env);
    const base = `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0`;
    const issuer = getMicrosoftIssuer(env);
    return {
      id: 'microsoft',
      clientId,
      clientSecret,
      authorizeUrl: `${base}/authorize`,
      tokenUrl: `${base}/token`,
      userinfoUrl: 'https://graph.microsoft.com/oidc/userinfo',
      jwksUrl: getMicrosoftJwksUrl(env),
      issuer,
      issuerAllowTenantWildcard: ['common', 'organizations', 'consumers'].includes(tenant.toLowerCase()),
      scopes: env?.MICROSOFT_OIDC_SCOPES || DEFAULT_MICROSOFT_SCOPES,
      redirectUri: buildRedirectUri('microsoft', env, origin),
      prompt: env?.MICROSOFT_OIDC_PROMPT || 'select_account',
    };
  }

  return null;
}

export function listProviderStates(env, origin) {
  return ['google', 'microsoft'].map((provider) => {
    const config = getProviderConfig(provider, env, origin);
    return {
      id: provider,
      configured: Boolean(config),
    };
  });
}
