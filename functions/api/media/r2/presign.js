import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../../_utils.js';
import { listEntities } from '../../_store.js';
import { getUserFromToken } from '../../_auth.js';
import { hasMembership, isGlobalAdmin } from '../../_tenancy.js';

const DEFAULT_EXPIRES = 900;

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(message) {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return toHex(hash);
}

async function hmac(key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(signature);
}

async function getSignatureKey(secret, dateStamp, region, service) {
  const kDate = await hmac(new TextEncoder().encode(`AWS4${secret}`), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function formatAmzDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function formatDateStamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function normalizeKey(key) {
  return String(key || '').replace(/^\/+/, '').trim();
}

function normalizeEmailForKey(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildStudentPrefix(schoolId, email) {
  const safeEmail = normalizeEmailForKey(email);
  if (!safeEmail) return null;
  return `schools/${schoolId}/submissions/${safeEmail}/`;
}

function getR2Config(env) {
  const accessKeyId = env?.R2_ACCESS_KEY_ID || '';
  const secretAccessKey = env?.R2_SECRET_ACCESS_KEY || '';
  const bucket = env?.R2_BUCKET || '';
  const endpoint = env?.R2_ENDPOINT || '';
  const region = env?.R2_REGION || 'auto';
  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) return null;
  return { accessKeyId, secretAccessKey, bucket, endpoint, region };
}

async function getMembershipRole(env, schoolId, email) {
  if (!schoolId || !email) return null;
  const rows = await listEntities(env, 'SchoolMembership', {
    filters: { school_id: String(schoolId), user_email: String(email) },
    limit: 1,
  });
  return rows?.[0]?.role || null;
}

function isTeacherRole(role) {
  const normalized = String(role || '').toUpperCase();
  return ['OWNER', 'ADMIN', 'INSTRUCTOR', 'TEACHER', 'TA', 'RAV', 'RABBI'].includes(normalized);
}

export async function onRequest({ request, env }) {
  const options = handleOptions(request, env);
  if (options) return options;

  if (request.method !== 'POST') {
    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
  }

  const token = getBearerToken(request);
  const user = await getUserFromToken(token, env);
  if (!user?.email) {
    return errorResponse('auth_required', 401, 'Authentication required', env);
  }

  const payload = await readJson(request);
  if (!payload) {
    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
  }

  const schoolId = payload.school_id || payload.schoolId;
  const rawKey = payload.key || '';
  const method = String(payload.method || 'PUT').toUpperCase();
  const expiresIn = Math.min(Number(payload.expires_in || DEFAULT_EXPIRES), 3600);

  if (!schoolId || !rawKey) {
    return errorResponse('missing_params', 400, 'school_id and key are required', env);
  }
  if (!['PUT', 'GET'].includes(method)) {
    return errorResponse('invalid_method', 400, 'method must be GET or PUT', env);
  }

  const config = getR2Config(env);
  if (!config) {
    return errorResponse('not_configured', 500, 'R2 credentials not configured', env);
  }

  const key = normalizeKey(rawKey);
  if (!key.startsWith(`schools/${schoolId}/`)) {
    return errorResponse('invalid_key', 400, 'Key must be prefixed with schools/{schoolId}/', env);
  }

  const globalAdmin = isGlobalAdmin(user, env);
  if (!globalAdmin) {
    const member = await hasMembership(env, schoolId, user.email);
    if (!member) {
      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    }
    const role = await getMembershipRole(env, schoolId, user.email);
    if (!isTeacherRole(role)) {
      const studentPrefix = buildStudentPrefix(schoolId, user.email);
      if (!studentPrefix || !key.startsWith(studentPrefix)) {
        return errorResponse('forbidden', 403, 'Student uploads limited to your submission folder', env);
      }
    }
  }

  const now = new Date();
  const amzDate = formatAmzDate(now);
  const dateStamp = formatDateStamp(now);
  const service = 's3';
  const scope = `${dateStamp}/${config.region}/${service}/aws4_request`;
  const credential = `${config.accessKeyId}/${scope}`;

  const endpointUrl = new URL(config.endpoint);
  const canonicalUri = `/${config.bucket}/${key}`;

  const params = new URLSearchParams();
  params.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  params.set('X-Amz-Credential', credential);
  params.set('X-Amz-Date', amzDate);
  params.set('X-Amz-Expires', String(expiresIn));
  params.set('X-Amz-SignedHeaders', 'host');

  const canonicalQuery = Array.from(params.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const canonicalHeaders = `host:${endpointUrl.host}\n`;
  const signedHeaders = 'host';
  const payloadHash = 'UNSIGNED-PAYLOAD';

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    await sha256(canonicalRequest),
  ].join('\n');

  const signingKey = await getSignatureKey(config.secretAccessKey, dateStamp, config.region, service);
  const signatureBytes = await hmac(signingKey, stringToSign);
  const signature = toHex(signatureBytes);

  const signedUrl = `${config.endpoint}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;

  return json({
    url: signedUrl,
    method,
    key,
    bucket: config.bucket,
    expires_in: expiresIn,
  }, { env });
}
