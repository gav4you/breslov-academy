import { errorResponse, getBearerToken, handleOptions, json, readJson } from '../_utils.js';
import { createEntity, listEntities } from '../_store.js';
import { getUserFromToken } from '../_auth.js';
import { hasMembership, isGlobalAdmin } from '../_tenancy.js';
import { applyLessonAccess } from '../_access.js';

const MAX_LESSONS = 200;
const MAX_SOURCES = 4;
const MAX_SNIPPET_CHARS = 420;
const MAX_CONTEXT_CHARS = 2400;

function nowIso() {
  return new Date().toISOString();
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 12);
}

function buildSearchText(lesson) {
  const parts = [
    lesson?.title,
    lesson?.title_hebrew,
    lesson?.content,
    lesson?.content_text,
    lesson?.text,
    lesson?.body,
  ];

  if (lesson?.content_json) {
    try {
      parts.push(typeof lesson.content_json === 'string' ? lesson.content_json : JSON.stringify(lesson.content_json));
    } catch {
      // ignore content_json errors
    }
  }

  return parts.filter(Boolean).join(' ');
}

function buildSnippet(text, tokens) {
  if (!text) return '';
  const normalized = String(text);
  const lower = normalized.toLowerCase();
  let idx = -1;

  for (const token of tokens) {
    const found = lower.indexOf(token);
    if (found !== -1) {
      idx = found;
      break;
    }
  }

  const start = idx === -1 ? 0 : Math.max(0, idx - 80);
  const end = Math.min(normalized.length, idx === -1 ? MAX_SNIPPET_CHARS : idx + 240);
  const snippet = normalized.slice(start, end).trim();
  return snippet.length > MAX_SNIPPET_CHARS ? `${snippet.slice(0, MAX_SNIPPET_CHARS)}...` : snippet;
}

function lessonLooksLocked(lesson) {
  const hasText = ['content', 'content_text', 'text', 'body']
    .some((key) => typeof lesson?.[key] === 'string' && lesson[key].trim().length > 0);
  const hasMedia = Boolean(lesson?.video_url || lesson?.audio_url);
  return !hasText && !hasMedia;
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((msg) => msg?.content)
    .slice(-8)
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: String(msg.content || ''),
    }));
}

async function buildLessonSources({ env, schoolId, userEmail, prompt, courseId, lessonId }) {
  const tokens = tokenize(prompt);
  const filters = { school_id: String(schoolId) };
  if (lessonId) {
    filters.id = String(lessonId);
  } else if (courseId) {
    filters.course_id = String(courseId);
  }

  let candidateLessons = [];

  if (!lessonId) {
    const indexFilters = { school_id: String(schoolId) };
    if (courseId) indexFilters.course_id = String(courseId);
    const indexRows = await listEntities(env, 'AiRagIndex', {
      filters: indexFilters,
      limit: 800,
    });

    if (indexRows?.length) {
      const scoredIndex = indexRows.map((row) => {
        const rowTokens = Array.isArray(row.tokens) ? row.tokens : [];
        const score = tokens.reduce((sum, token) => sum + (rowTokens.includes(token) ? 1 : 0), 0);
        return { row, score };
      });

      const topIndex = scoredIndex
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SOURCES);

      for (const entry of topIndex) {
        const rows = await listEntities(env, 'Lesson', {
          filters: { school_id: String(schoolId), id: String(entry.row.lesson_id) },
          limit: 1,
        });
        if (rows?.[0]) candidateLessons.push(rows[0]);
      }
    }
  }

  if (candidateLessons.length === 0) {
    const rows = await listEntities(env, 'Lesson', {
      filters,
      limit: lessonId ? 1 : MAX_LESSONS,
    });
    candidateLessons = rows || [];
  }

  const gated = await applyLessonAccess({
    env,
    schoolId,
    userEmail,
    lessons: candidateLessons,
    previewChars: 1200,
  });

  if (lessonId && lessonLooksLocked(gated?.[0])) {
    return { blocked: true, sources: [] };
  }

  const scored = gated.map((lesson) => {
    const text = buildSearchText(lesson);
    const lower = text.toLowerCase();
    const score = tokens.reduce((sum, token) => sum + (lower.includes(token) ? 1 : 0), 0);
    return { lesson, score, text };
  });

  const top = scored
    .filter((entry) => entry.score > 0 || lessonId)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SOURCES);

  const sources = top.map((entry) => ({
    source_type: 'lesson',
    lesson_id: entry.lesson.id,
    course_id: entry.lesson.course_id,
    title: entry.lesson.title || entry.lesson.title_hebrew || 'Lesson',
    snippet: buildSnippet(entry.text, tokens),
  }));

  return { blocked: false, sources };
}

async function callOpenAI({ env, prompt, contextText, messages }) {
  const apiKey = env?.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = env?.OPENAI_MODEL || 'gpt-4o-mini';
  const systemPrompt = [
    'You are the Breslov Academy AI tutor.',
    'Use ONLY the provided context to answer.',
    'If the context is insufficient, say so and suggest asking a teacher.',
    contextText ? `Context:\n${contextText}` : 'Context: (none provided)',
  ].join('\n\n');

  const body = {
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
      { role: 'user', content: prompt },
    ],
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
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

  const prompt = String(payload.prompt || '').trim();
  if (!prompt) {
    return errorResponse('missing_prompt', 400, 'prompt is required', env);
  }

  const schoolId = payload.school_id || payload.schoolId;
  if (!schoolId) {
    return errorResponse('missing_school', 400, 'school_id is required', env);
  }

  const globalAdmin = isGlobalAdmin(user, env);
  if (!globalAdmin) {
    const isMember = await hasMembership(env, schoolId, user.email);
    if (!isMember) {
      return errorResponse('forbidden', 403, 'Not authorized for this school', env);
    }
  }

  const contextType = payload.context_type || payload.contextType || 'GENERAL';
  const contextId = payload.context_id || payload.contextId || null;
  const courseId = payload.course_id || payload.courseId || null;
  const lessonId = payload.lesson_id || payload.lessonId || (contextType === 'LESSON' ? contextId : null);
  const contextLocked = payload.context_locked === true || payload.contextLocked === true;
  const contextTitle = payload.context_title || payload.contextTitle || null;
  const contextContent = payload.context_content || payload.contextContent || null;

  if (contextLocked) {
    await createEntity(env, 'AiTutorPolicyLog', {
      school_id: String(schoolId),
      user_email: user.email,
      action: 'BLOCKED',
      reason: 'context_locked',
      context_type: contextType,
      context_id: contextId,
      created_date: nowIso(),
    });
    return errorResponse('content_locked', 403, 'Content is locked', env);
  }

  const sources = [];

  if (contextContent) {
    sources.push({
      source_type: 'context',
      lesson_id: lessonId || null,
      course_id: courseId || null,
      title: contextTitle || 'Provided context',
      snippet: buildSnippet(String(contextContent), tokenize(prompt)),
    });
  }

  if (lessonId || courseId) {
    const lessonResults = await buildLessonSources({
      env,
      schoolId,
      userEmail: user.email,
      prompt,
      courseId,
      lessonId,
    });
    if (lessonResults.blocked) {
      await createEntity(env, 'AiTutorPolicyLog', {
        school_id: String(schoolId),
        user_email: user.email,
        action: 'BLOCKED',
        reason: 'lesson_locked',
        context_type: contextType,
        context_id: contextId,
        created_date: nowIso(),
      });
      return errorResponse('content_locked', 403, 'Content is locked', env);
    }
    sources.push(...lessonResults.sources);
  }

  const contextText = sources
    .slice(0, MAX_SOURCES)
    .map((source, idx) => `Source ${idx + 1}: ${source.title}\n${source.snippet}`)
    .join('\n\n')
    .slice(0, MAX_CONTEXT_CHARS);

  const messages = normalizeMessages(payload.messages);
  const responseText = await callOpenAI({
    env,
    prompt,
    contextText,
    messages,
  });

  const fallback = env?.LLM_FALLBACK || 'AI service is not configured.';
  const response = responseText || (contextText
    ? `Based on the available lesson context, here is a summary:\n\n${contextText}`
    : fallback);

  await createEntity(env, 'AiTutorPolicyLog', {
    school_id: String(schoolId),
    user_email: user.email,
    action: 'ALLOWED',
    reason: payload.action || 'ai_chat',
    context_type: contextType,
    context_id: contextId,
    metadata: { sources: sources.length },
    created_date: nowIso(),
  });

  return json({ response, sources }, { env });
}
