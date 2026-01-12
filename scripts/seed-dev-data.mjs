const baseUrl = process.env.SEED_BASE_URL || 'http://localhost:8788';
const token = process.env.SEED_TOKEN || 'dev';
const schoolId = process.env.SEED_SCHOOL_ID || 'school_123';
const schoolSlug = process.env.SEED_SCHOOL_SLUG || 'demo-school';
const schoolName = process.env.SEED_SCHOOL_NAME || 'Demo School';
const userEmail = process.env.SEED_USER_EMAIL || 'dev@breslov.academy';
const role = process.env.SEED_ROLE || 'ADMIN';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};

async function post(path, payload) {
  const response = await fetch(new URL(path, baseUrl).toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Seed failed (${response.status}) ${path}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function seed() {
  await post('/api/entities/School', {
    id: schoolId,
    name: schoolName,
    slug: schoolSlug,
    status: 'active',
    is_public: true,
  });

  await post('/api/entities/SchoolMembership', {
    school_id: schoolId,
    user_email: userEmail,
    role,
    status: 'active',
  });
}

try {
  await seed();
  console.log(`Seeded school ${schoolId} and membership for ${userEmail}.`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
