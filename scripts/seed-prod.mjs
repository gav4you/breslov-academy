const BASE_URL = 'https://yesod.uk';
const TOKEN = 'dev'; // Default dev token

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function post(entity, payload) {
  const url = `${BASE_URL}/api/entities/${entity}`;
  console.log(`POST ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`Failed to create ${entity}:`, text);
    // Don't throw, just log, so we can continue with others
  } else {
    console.log(`Created ${entity}:`, payload.id || 'ok');
  }
}

async function seed() {
  console.log('Seeding production data to ' + BASE_URL);

  // 1. Create a School
  const schoolId = 'school_demo';
  await post('School', {
    id: schoolId,
    name: 'Breslov Academy Demo',
    slug: 'demo',
    tagline: 'Illuminating the path of wisdom',
    description: 'A demonstration school showcasing the power of the Breslov Academy LMS platform.',
    logo_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=200&fit=crop&q=80',
    hero_image_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&h=400&fit=crop&q=80',
    brand_primary: '#3b82f6',
    status: 'active',
    is_public: true,
  });

  // 2. Create a Course
  const courseId = 'course_intro';
  await post('Course', {
    id: courseId,
    school_id: schoolId,
    title: 'Introduction to Hasidut',
    title_hebrew: 'הקדמה לחסידות',
    subtitle: 'The fundamental concepts of joy and faith.',
    description: 'Explore the core teachings of Rebbe Nachman through this introductory course.',
    category: 'Philosophy',
    level: 'Beginner',
    cover_image_url: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=800&h=600&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=400&h=300&fit=crop&q=80',
    instructor: 'Rabbi Cohen',
    is_published: true,
  });

  // 3. Create Lessons
  await post('Lesson', {
    id: 'lesson_1',
    school_id: schoolId,
    course_id: courseId,
    title: 'The Power of Joy',
    title_hebrew: 'כוח השמחה',
    order: 1,
    status: 'published',
    is_preview: true,
    content: 'Joy is not merely an emotion, but a spiritual state of being...',
  });

  await post('Lesson', {
    id: 'lesson_2',
    school_id: schoolId,
    course_id: courseId,
    title: 'Simple Faith',
    title_hebrew: 'אמונה פשוטה',
    order: 2,
    status: 'published',
    is_preview: false,
    content: 'Faith transcends reason and connects us to the infinite...',
  });

  // 4. Create Admin User (Membership)
  await post('SchoolMembership', {
    school_id: schoolId,
    user_email: 'dev@breslov.academy',
    role: 'OWNER',
    status: 'active',
  });

  console.log('Seeding complete! Visit https://yesod.uk/s/demo');
}

seed();
