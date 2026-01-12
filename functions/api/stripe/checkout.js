import { errorResponse, handleOptions, json, readJson } from '../_utils.js';
import { createEntity, listEntities, updateEntity } from '../_store.js';
import { stripeRequest } from './_stripe.js';
import { createEntitlementsForOffer, recordCouponRedemption } from '../_billing.js';
import { isSchoolPublic } from '../_tenancy.js';
import { buildRateLimitKey, checkRateLimit } from '../_rateLimit.js';

function nowIso() {
  return new Date().toISOString();
}

function normalizeInterval(interval) {
  const value = String(interval || '').toLowerCase();
  if (value === 'year' || value === 'annual') return 'year';
  return 'month';
}

function getFeePercent(env, school) {
  const raw = school?.platform_fee_percent ?? env?.PLATFORM_FEE_PERCENT ?? env?.PLATFORM_FEE_RATE;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, 100);
}

function hasExpired(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return false;
  return date <= new Date();
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

async function resolveStripeAccount(env, schoolId) {
  const rows = await listEntities(env, 'StripeAccount', {
    filters: { school_id: String(schoolId) },
    limit: 1,
  });
  return rows?.[0] || null;
}

async function findExistingTransaction(env, schoolId, idempotencyKey) {
  if (!idempotencyKey) return null;
  const rows = await listEntities(env, 'Transaction', {
    filters: { school_id: String(schoolId), idempotency_key: String(idempotencyKey) },
    limit: 1,
  });
  return rows?.[0] || null;
}

function buildCheckoutParams({ offer, amountCents, email, metadata, mode, feePercent, stripeAccountId, successUrl, cancelUrl, clientReferenceId }) {
  const params = {
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
    client_reference_id: clientReferenceId,
    'line_items[0][quantity]': 1,
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][product_data][name]': offer.name || 'Course Access',
    'line_items[0][price_data][product_data][description]': offer.description || '',
    'line_items[0][price_data][unit_amount]': amountCents,
  };

  if (mode === 'subscription') {
    params['line_items[0][price_data][recurring][interval]'] = normalizeInterval(offer.billing_interval);
    params['subscription_data[application_fee_percent]'] = feePercent;
    params['subscription_data[transfer_data][destination]'] = stripeAccountId;
  } else {
    params['payment_intent_data[application_fee_percent]'] = feePercent;
    params['payment_intent_data[transfer_data][destination]'] = stripeAccountId;
  }

  Object.entries(metadata || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params[`metadata[${key}]`] = value;
  });

  return params;
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
    prefix: 'stripe_checkout',
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

  const stripeAccount = await resolveStripeAccount(env, schoolId);
  if (!stripeAccount?.stripe_account_id || stripeAccount.charges_enabled === false) {
    return errorResponse('stripe_unavailable', 409, 'Stripe is not connected for this school', env);
  }

  const existing = await findExistingTransaction(env, schoolId, idempotencyKey);
  if (existing?.stripe_session_id && existing?.checkout_url) {
    return json({ url: existing.checkout_url, transaction_id: existing.id }, { env });
  }

  const transaction = existing || await createEntity(env, 'Transaction', {
    school_id: String(schoolId),
    user_email: email,
    offer_id: String(offerId),
    amount_cents: amountCents,
    discount_cents: discountCents,
    coupon_code: couponCode || null,
    provider: 'STRIPE',
    status: amountCents === 0 ? 'paid' : 'pending',
    idempotency_key: idempotencyKey || null,
    metadata: {
      referral_code: payload.referral_code || payload.refCode || null,
    },
    created_date: nowIso(),
  });

  if (amountCents === 0) {
    await updateEntity(env, 'Transaction', transaction.id, {
      paid_at: nowIso(),
      updated_date: nowIso(),
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
    return json({
      url: payload.success_url || `${new URL(request.url).origin}/s/${school.slug || 'demo'}/thank-you?transactionId=${transaction.id}`,
      transaction_id: transaction.id,
      free: true,
    }, { env });
  }

  const origin = new URL(request.url).origin;
  const successUrl = payload.success_url
    || `${origin}/s/${school.slug || 'demo'}/thank-you?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = payload.cancel_url
    || `${origin}/s/${school.slug || 'demo'}/pricing`;

  const feePercent = getFeePercent(env, school);
  const mode = offer.offer_type === 'SUBSCRIPTION' ? 'subscription' : 'payment';
  const metadata = {
    school_id: String(schoolId),
    offer_id: String(offerId),
    transaction_id: transaction.id,
    user_email: email,
    coupon_code: couponCode || '',
    referral_code: payload.referral_code || payload.refCode || '',
  };

  let session = null;
  try {
    session = await stripeRequest(env, 'POST', '/v1/checkout/sessions', buildCheckoutParams({
      offer,
      amountCents,
      email,
      metadata,
      mode,
      feePercent,
      stripeAccountId: stripeAccount.stripe_account_id,
      successUrl,
      cancelUrl,
      clientReferenceId: transaction.id,
    }));
  } catch (error) {
    return errorResponse('stripe_error', error.status || 500, error.message, env);
  }

  await updateEntity(env, 'Transaction', transaction.id, {
    stripe_session_id: session.id,
    checkout_url: session.url,
    updated_date: nowIso(),
  });

  return json({ url: session.url, transaction_id: transaction.id }, { env });
}
