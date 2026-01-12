import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
import { buildRateLimitKey, checkRateLimit } from '../_rateLimit.js';
import { createEntity, listEntities, updateEntity } from '../_store.js';
import { getUserFromToken } from '../_auth.js';

function nowIso() {
  return new Date().toISOString();
}

function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')
    || request.headers.get('X-Real-IP')
    || null;
}

function isEntitlementActive(entitlement, now) {
  if (!entitlement) return false;
  const startsAt = entitlement.starts_at ? new Date(entitlement.starts_at) : null;
  const endsAt = entitlement.ends_at ? new Date(entitlement.ends_at) : null;
  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt <= now) return false;
  return true;
}

function normalizeMoney(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
    return errorResponse('unauthorized', 401, 'Authentication required', env);
  }

  const downloadLimit = Number(env?.RATE_LIMIT_DOWNLOADS || 20);
  const downloadWindow = Number(env?.RATE_LIMIT_DOWNLOADS_WINDOW_SECONDS || 60);
  const downloadKey = buildRateLimitKey({
    prefix: 'downloads_secure',
    request,
    userEmail: user.email,
  });
  const downloadCheck = await checkRateLimit(env, {
    key: downloadKey,
    limit: downloadLimit,
    windowSeconds: downloadWindow,
  });
  if (!downloadCheck.allowed) {
    return errorResponse('rate_limited', 429, 'Too many download attempts', env);
  }

  const payload = await readJson(request);
  if (!payload) {
    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
  }

  const downloadId = payload.download_id || payload.downloadId;
  const schoolId = payload.school_id || payload.schoolId;
  if (!downloadId || !schoolId) {
    return errorResponse('missing_params', 400, 'download_id and school_id are required', env);
  }

  const downloads = await listEntities(env, 'Download', {
    filters: { id: String(downloadId), school_id: String(schoolId) },
    limit: 1
  });
  const download = downloads?.[0];
  if (!download) {
    return errorResponse('not_found', 404, 'Download not found', env);
  }

  const policies = await listEntities(env, 'ContentProtectionPolicy', {
    filters: { school_id: String(schoolId) },
    limit: 1
  });
  const policy = policies?.[0] || { download_mode: 'DISALLOW' };

  const entitlements = await listEntities(env, 'Entitlement', {
    filters: { school_id: String(schoolId), user_email: user.email },
    limit: 250
  });

  const now = new Date();
  const activeEnts = (entitlements || []).filter((ent) => isEntitlementActive(ent, now));
  const hasDownloadLicense = activeEnts.some((ent) => {
    const type = ent.type || ent.entitlement_type;
    return type === 'DOWNLOAD_LICENSE';
  });
  const hasCourseAccess = download.course_id
    ? activeEnts.some((ent) => {
        const type = ent.type || ent.entitlement_type;
        return (type === 'COURSE' && String(ent.course_id) === String(download.course_id)) || type === 'ALL_COURSES';
      })
    : true;

  const priceCents = normalizeMoney(download.price_cents || download.price);
  const isFree = !download.course_id || priceCents === 0;

  let allowed = false;
  let reason = 'downloads_disabled';
  if (isFree) {
    allowed = true;
    reason = 'free';
  } else if (policy.download_mode === 'INCLUDED_WITH_ACCESS') {
    allowed = hasCourseAccess;
    reason = allowed ? 'course_access' : 'course_required';
  } else if (policy.download_mode === 'ADDON') {
    allowed = hasCourseAccess && hasDownloadLicense;
    reason = !hasCourseAccess ? 'course_required' : !hasDownloadLicense ? 'license_required' : 'addon_access';
  }

  await createEntity(env, 'EventLog', {
    school_id: String(schoolId),
    user_email: user.email,
    event_type: allowed ? 'download_token_issued' : 'download_token_blocked',
    entity_type: 'Download',
    entity_id: String(downloadId),
    metadata: {
      reason,
      has_course: hasCourseAccess,
      has_license: hasDownloadLicense
    }
  });

  if (!allowed) {
    return json({ allowed: false, reason }, { env });
  }

  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const school = await listEntities(env, 'School', { filters: { id: String(schoolId) }, limit: 1 });
  const schoolName = school?.[0]?.name || schoolId;
  const watermarkText = `${user.email} | ${schoolName} | ${new Date().toISOString().slice(0, 10)}`;

  const existingTokens = await listEntities(env, 'DownloadToken', {
    filters: { school_id: String(schoolId), user_email: user.email, download_id: String(downloadId) },
    limit: 200
  });
  const revokeAt = nowIso();
  await Promise.all(
    (existingTokens || [])
      .filter((row) => !row.used_at && !row.revoked_at)
      .map((row) => updateEntity(env, 'DownloadToken', row.id, { revoked_at: revokeAt }))
  );

  await createEntity(env, 'DownloadToken', {
    id: tokenId,
    token: tokenId,
    school_id: String(schoolId),
    download_id: String(downloadId),
    user_email: user.email,
    issued_at: nowIso(),
    expires_at: expiresAt,
    watermark_text: watermarkText,
    status: 'ACTIVE',
    issued_ip: getClientIp(request)
  });

  return json({
    allowed: true,
    url: `/api/downloads/file?token=${tokenId}`,
    expires_at: expiresAt
  }, { env });
}
