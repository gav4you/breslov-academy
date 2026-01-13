import { appParams, clearStoredToken, getStoredToken } from '@/lib/app-params';

const DEFAULT_API_BASE_URL = '/api';

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return DEFAULT_API_BASE_URL;
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function joinPaths(basePath, nextPath) {
  const left = String(basePath || '').replace(/\/+$/, '');
  const right = String(nextPath || '').replace(/^\/+/, '');
  if (!left) return `/${right}`;
  if (!right) return left || '/';
  return `${left}/${right}`;
}

function resolveOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost';
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'object') {
      try {
        query.set(key, JSON.stringify(value));
      } catch {
        query.set(key, String(value));
      }
      return;
    }
    query.set(key, String(value));
  });
  return query.toString();
}

function buildTurnstileLoginUrl(nextUrl) {
  const origin = resolveOrigin();
  const target = new URL('/login', origin);
  if (!nextUrl) return target.toString();
  try {
    const returnUrl = new URL(nextUrl, origin);
    const path = returnUrl.pathname || '/';
    if (path.startsWith('/teacher')) {
      target.pathname = '/login/teacher';
    } else if (path.startsWith('/admin')) {
      target.pathname = '/login/admin';
    } else if (path.startsWith('/student')) {
      target.pathname = '/login/student';
    }
    target.searchParams.set('returnTo', `${returnUrl.pathname}${returnUrl.search}`);
  } catch {
    // ignore malformed return targets
  }
  return target.toString();
}

export function buildApiUrl(path, params, baseUrlOverride) {
  const baseUrl = normalizeBaseUrl(baseUrlOverride || appParams.apiBaseUrl || DEFAULT_API_BASE_URL);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const isAbsolute = /^https?:\/\//i.test(baseUrl);
  const url = isAbsolute
    ? new URL(baseUrl)
    : new URL(baseUrl, resolveOrigin());
  url.pathname = joinPaths(url.pathname, normalizedPath);

  const query = buildQuery(params);
  if (query) {
    url.search = query;
  }

  return url.toString();
}

export async function requestJson(path, options = {}) {
  const {
    method = 'GET',
    params,
    body,
    headers,
    token,
    baseUrl,
    expectJson = true,
  } = options;

  const url = buildApiUrl(path, params, baseUrl);
  const resolvedToken = token || getStoredToken() || appParams.token;

  const requestHeaders = new Headers(headers || {});
  requestHeaders.set('Accept', 'application/json');
  if (body !== undefined && method !== 'GET') {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (appParams.appId) {
    requestHeaders.set('X-App-Id', appParams.appId);
  }
  if (appParams.apiVersion) {
    requestHeaders.set('X-Api-Version', appParams.apiVersion);
  }
  if (resolvedToken) {
    requestHeaders.set('Authorization', `Bearer ${resolvedToken}`);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined && method !== 'GET' ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  const isJson = contentType.includes('application/json');

  if (!isJson && expectJson && text) {
    const error = new Error('Expected JSON response from API');
    error.status = response.status;
    error.data = text;
    throw error;
  }

  const data = isJson
    ? (text ? JSON.parse(text) : null)
    : (text || null);

  if (!response.ok) {
    const error = new Error((data && data.message) || response.statusText);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function createEntityClient(entityName) {
  const encoded = encodeURIComponent(entityName);
  return {
    filter: (filters = {}, sort, limit, options = {}) => requestJson(`/entities/${encoded}`, {
      params: {
        filter: filters,
        sort,
        limit,
        fields: options?.fields,
        previewChars: options?.previewChars,
      },
    }),
    list: (sort, limit) => requestJson(`/entities/${encoded}`, {
      params: {
        sort,
        limit,
      },
    }),
    create: (payload) => requestJson(`/entities/${encoded}`, {
      method: 'POST',
      body: payload,
    }),
    update: (id, payload) => requestJson(`/entities/${encoded}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: payload,
    }),
    delete: (id) => requestJson(`/entities/${encoded}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  };
}

function getAuthRedirectUrl(kind, nextUrl) {
  const urlValue = kind === 'login' ? appParams.authLoginUrl : appParams.authLogoutUrl;
  if (!urlValue) return null;

  const url = new URL(urlValue, resolveOrigin());
  if (nextUrl) {
    url.searchParams.set('next', nextUrl);
  }
  return url.toString();
}

export function createAppClient() {
  const entities = new Proxy({}, {
    get(target, prop) {
      if (typeof prop !== 'string') return target[prop];
      if (!target[prop]) {
        target[prop] = createEntityClient(prop);
      }
      return target[prop];
    },
  });

  return {
    request: requestJson,
    auth: {
      me: () => requestJson('/auth/me'),
      redirectToLogin: (nextUrl, params = {}) => {
        const resolvedNext = nextUrl || (typeof window !== 'undefined' ? window.location.href : '/');
        const url = getAuthRedirectUrl('login', resolvedNext);
        if (url) {
          window.location.assign(url);
          return;
        }
        const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
        const safeParams = params && typeof params === 'object' ? params : {};
        const hasTurnstileToken = Boolean(safeParams.turnstileToken || safeParams.turnstile_token);
        if (turnstileSiteKey && !hasTurnstileToken) {
          window.location.assign(buildTurnstileLoginUrl(resolvedNext));
          return;
        }
        const target = buildApiUrl('/auth/login', { next: resolvedNext, ...safeParams });
        window.location.assign(target);
      },
      logout: async (nextUrl) => {
        clearStoredToken();
        const url = getAuthRedirectUrl('logout', nextUrl);
        if (url) {
          window.location.assign(url);
          return;
        }
        try {
          await requestJson('/auth/logout', {
            method: 'POST',
            params: nextUrl ? { next: nextUrl } : undefined,
            expectJson: false,
          });
        } catch {
          // ignore logout failures
        }
        if (nextUrl) {
          window.location.assign(nextUrl);
        }
      },
    },
    entities,
    integrations: {
      Core: {
        InvokeLLM: (payload) => requestJson('/integrations/core/invoke-llm', {
          method: 'POST',
          body: payload,
          expectJson: false,
        }),
      },
    },
    appLogs: {
      logUserInApp: async (pageName) => {
        try {
          await requestJson('/app-logs/user', {
            method: 'POST',
            body: { page: pageName },
          });
        } catch {
          // best-effort
        }
      },
    },
  };
}
