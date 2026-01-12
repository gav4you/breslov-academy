const baseUrl = process.env.AI_INDEX_BASE_URL || '';
const token = process.env.AI_INDEX_TOKEN || '';
const schoolId = process.env.AI_INDEX_SCHOOL_ID || '';
const courseId = process.env.AI_INDEX_COURSE_ID || '';
const lessonId = process.env.AI_INDEX_LESSON_ID || '';

if (!baseUrl || !token || !schoolId) {
  console.log('AI index skipped: set AI_INDEX_BASE_URL, AI_INDEX_TOKEN, and AI_INDEX_SCHOOL_ID.');
  process.exit(0);
}

const target = new URL('/api/ai/index', baseUrl).toString();
const payload = {
  school_id: schoolId,
  ...(courseId ? { course_id: courseId } : {}),
  ...(lessonId ? { lesson_id: lessonId } : {}),
};

const response = await fetch(target, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const text = await response.text();
  console.error(`AI index failed (${response.status}): ${text}`);
  process.exit(1);
}

const result = await response.json();
console.log(`AI index complete. Indexed: ${result?.indexed?.length ?? 0}`);
