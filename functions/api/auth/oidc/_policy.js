import { listEntities } from '../../_store.js';

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeDomain(domain) {
  return String(domain || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '');
}

export async function resolveSchool(env, schoolId, schoolSlug) {
  if (schoolId) {
    return { id: String(schoolId), slug: schoolSlug ? String(schoolSlug) : null };
  }
  if (!schoolSlug) return null;
  const schools = await listEntities(env, 'School', {
    filters: { slug: String(schoolSlug) },
    limit: 200,
  });
  const match = schools?.[0];
  if (!match?.id) return null;
  return { id: String(match.id), slug: match.slug || String(schoolSlug) };
}

export async function getSchoolAuthPolicy(env, schoolId) {
  if (!schoolId) return null;
  const policies = await listEntities(env, 'SchoolAuthPolicy', {
    filters: { school_id: String(schoolId) },
    limit: 1,
  });
  return policies?.[0] || null;
}

export function policyAllowsProvider(policy, provider, allowAll = false) {
  if (allowAll) return true;
  if (!policy) return false;
  if (policy.sso_enabled === false) return false;
  if (policy.allow_all_providers === true) return true;
  const allowed = normalizeList(policy.allowed_providers);
  if (allowed.length === 0) return false;
  return allowed.includes(String(provider || '').toLowerCase());
}

export function isDomainAllowed(policy, email, verifiedDomains = []) {
  if (!policy) return false;
  if (!email) return false;
  const domain = normalizeDomain(email.split('@')[1] || '');
  if (!domain) return false;

  const allowedDomains = normalizeList(policy.allowed_domains).map(normalizeDomain);
  if (allowedDomains.length > 0) {
    if (!allowedDomains.includes(domain)) {
      return false;
    }
  }

  if (policy.require_domain_verification === true) {
    const verifiedSet = new Set((verifiedDomains || []).map(normalizeDomain));
    if (!verifiedSet.has(domain)) {
      return false;
    }
  }

  if (policy.require_domain_match === true && allowedDomains.length === 0) {
    return false;
  }

  if (policy.allow_personal_emails === false && allowedDomains.length === 0) {
    return false;
  }

  return true;
}

export function resolveRoleForEmail(policy, email) {
  const fallback = policy?.auto_provision_role || policy?.default_role || 'STUDENT';
  if (!policy || !email) return fallback;
  const domain = normalizeDomain(email.split('@')[1] || '');
  if (!domain) return fallback;

  const map = policy.domain_role_map || policy.domainRoleMap || null;
  if (map && typeof map === 'object' && !Array.isArray(map)) {
    const direct = map[domain];
    if (direct) return direct;
  }

  if (Array.isArray(map)) {
    const match = map.find((entry) => normalizeDomain(entry?.domain) === domain);
    if (match?.role) return match.role;
  }

  return fallback;
}

export function sanitizePolicyForPublic(policy) {
  if (!policy) return null;
  return {
    id: policy.id,
    school_id: policy.school_id,
    sso_enabled: policy.sso_enabled !== false,
    allowed_providers: normalizeList(policy.allowed_providers),
    require_domain_match: policy.require_domain_match === true,
    require_domain_verification: policy.require_domain_verification === true,
    allow_personal_emails: policy.allow_personal_emails !== false,
    auto_provision: policy.auto_provision === true,
    auto_provision_role: policy.auto_provision_role || policy.default_role || 'STUDENT',
  };
}
