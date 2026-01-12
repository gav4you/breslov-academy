import { errorResponse, handleOptions, json, readJson } from '../_utils.js';
import { createEntity, listEntities } from '../_store.js';
import { createEntitlementsForOffer, recordCouponRedemption } from '../_billing.js';
import { isSchoolPublic } from '../_tenancy.js';
import { buildRateLimitKey, checkRateLimit } from '../_rateLimit.js';

function nowIso() {
  return new Date().toISOString();
}

function hasExpired(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return false;
  return date <= new Date();
}

async function resolveSchool(env, schoolId) {
  if (!schoolId) return null;
  const rows = await listEntities(env, 'School', {
    filters: { id: String(schoolId) },
    limit: 1,
  });
  return rows?.[0] || null;
}

async function resolveOffer(env, schoolId, offerId) {
  if (!schoolId || !offerId) return null;
  const rows = await listEntities(env, 'Offer', {
    filters: { school_id: String(schoolId), id: String(offerId) },
    limit: 1,
  });
  return rows?.[0] || null;
}

async function resolveCoupon(env, schoolId, code) {
  if (!schoolId || !code) return null;
  const rows = await listEntities(env, 'Coupon', {
    filters: { school_id: String(schoolId), code: String(code).toUpperCase() },
    limit: 1,
  });
  return rows?.[0] || null;
}

function computeDiscount(offer, coupon) {
  if (!offer || !coupon) return 0;
  if (coupon.is_active === false) return 0;
  if (coupon.expires_at && hasExpired(coupon.expires_at)) return 0;
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return 0;

  if (coupon.discount_type === 'PERCENTAGE') {
    return Math.round((offer.price_cents || 0) * (coupon.discount_value || 0) / 100);
  }
  if (coupon.discount_type === 'AMOUNT') {
    return Math.round((coupon.discount_value || 0) * 100);
  }
  return 0;
}

async function findExistingTransaction(env, schoolId, idempotencyKey) {
  if (!idempotencyKey) return null;
  const rows = await listEntities(env, 'Transaction', {
    filters: { school_id: String(schoolId), idempotency_key: String(idempotencyKey) },
    limit: 1,
  });
  return rows?.[0] || null;
}

export async function onRequest({ request, env }) {
  const options = handleOptions(request, env);
  if (options) return options;

  if (request.method !== 'POST') {
    return errorResponse('method_not_allowed', 405, 'Method not allowed', env);
  }

  const payload = await readJson(request);
  if (!payload) {
    return errorResponse('invalid_payload', 400, 'Expected JSON body', env);
  }

  const schoolId = payload.school_id || payload.schoolId;
  const offerId = payload.offer_id || payload.offerId;
  const email = payload.email || payload.user_email || payload.userEmail;
  const couponCode = payload.coupon_code || payload.couponCode || null;
  const idempotencyKey = payload.idempotency_key || null;

  if (!schoolId || !offerId || !email) {
    return errorResponse('missing_params', 400, 'school_id, offer_id, and email are required', env);
  }

  const checkoutLimit = Number(env?.RATE_LIMIT_CHECKOUT || 10);
  const checkoutWindow = Number(env?.RATE_LIMIT_CHECKOUT_WINDOW_SECONDS || 60);
  const checkoutKey = buildRateLimitKey({
    prefix: 'checkout_create',
    request,
    userEmail: email,
    schoolId,
  });
  const checkoutCheck = await checkRateLimit(env, {
    key: checkoutKey,
    limit: checkoutLimit,
    windowSeconds: checkoutWindow,
  });
  if (!checkoutCheck.allowed) {
    return errorResponse('rate_limited', 429, 'Too many checkout attempts', env);
  }

  const school = await resolveSchool(env, schoolId);
  if (!school) {
    return errorResponse('school_not_found', 404, 'School not found', env);
  }

  const offer = await resolveOffer(env, schoolId, offerId);
  if (!offer || offer.is_active === false) {
    return errorResponse('offer_unavailable', 404, 'Offer not available', env);
  }

  const isPublic = await isSchoolPublic(env, schoolId);
  if (!isPublic && !payload.allow_private) {
    return errorResponse('forbidden', 403, 'School is not public', env);
  }

  const coupon = couponCode ? await resolveCoupon(env, schoolId, couponCode) : null;
  const basePrice = Number(offer.price_cents || 0);
  const discountCents = coupon ? computeDiscount({ ...offer, price_cents: basePrice }, coupon) : 0;
  const amountCents = Math.max(0, Math.round(basePrice) - discountCents);

  const existing = await findExistingTransaction(env, schoolId, idempotencyKey);
  if (existing) {
    return json({ transaction_id: existing.id }, { env });
  }

  const transaction = await createEntity(env, 'Transaction', {
    school_id: String(schoolId),
    user_email: email,
    offer_id: String(offerId),
    amount_cents: amountCents,
    discount_cents: discountCents,
    coupon_code: couponCode || null,
    provider: 'MANUAL',
    status: amountCents === 0 ? 'paid' : 'pending',
    paid_at: amountCents === 0 ? nowIso() : null,
    updated_date: nowIso(),
    idempotency_key: idempotencyKey || null,
    metadata: {
      referral_code: payload.referral_code || payload.refCode || null,
    },
    created_date: nowIso(),
  });

  if (amountCents === 0) {
    await createEntity(env, 'AuditLog', {
      school_id: String(schoolId),
      user_email: email,
      action: 'TRANSACTION_PAID',
      entity_type: 'Transaction',
      entity_id: transaction.id,
      metadata: { amount_cents: amountCents },
    });
    await createEntitlementsForOffer({
      env,
      schoolId,
      offer,
      userEmail: email,
      source: 'PURCHASE',
      sourceId: transaction.id,
    });
    if (coupon) {
      await recordCouponRedemption({
        env,
        schoolId,
        coupon,
        transactionId: transaction.id,
        userEmail: email,
        discountCents,
      });
    }
  }

  return json({ transaction_id: transaction.id }, { env });
}
