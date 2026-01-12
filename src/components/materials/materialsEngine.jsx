/**
 * Materials Retrieval Engine
 * Gated access to lesson content, videos, and resources
 */

import { base44 } from '@/api/base44Client';
import { scopedFilter } from '@/components/api/scoped';
import { getPreviewMaterial, sanitizeMaterialForAccess, shouldFetchMaterials } from '@/components/materials/materialsAccess';

/**
 * Get lesson material (scoped)
 * @param {object} params - {school_id, lesson_id, course_id}
 * @returns {Promise<object>} - Lesson content payload
 */
export async function getLessonMaterial({ school_id, lesson_id, course_id }) {
  try {
    // Fetch lesson metadata
    const lessons = await scopedFilter('Lesson', school_id, { id: lesson_id }, null, 1, {
      fields: ['id', 'school_id', 'course_id', 'content', 'video_url', 'video_stream_id', 'audio_url', 'duration_seconds']
    });
    
    if (lessons.length === 0) return null;
    
    const lesson = lessons[0];
    
    // Return material payload
    const resolvedVideo = lesson.video_url
      || (lesson.video_stream_id ? `https://videodelivery.net/${lesson.video_stream_id}/downloads/default.mp4` : null);

    return {
      content_text: lesson.content || '',
      video_url: resolvedVideo,
      audio_url: lesson.audio_url,
      duration_seconds: lesson.duration_seconds,
      lesson
    };
  } catch (error) {
    console.error('getLessonMaterial error:', error);
    return null;
  }
}

/**
 * Get preview-only material (truncated)
 * @param {object} material - Full material object
 * @param {object} policy - ContentProtectionPolicy
 * @returns {object} - Truncated material
 */
export { getPreviewMaterial, sanitizeMaterialForAccess, shouldFetchMaterials };
/**
 * Secure download URL retrieval
 * @param {object} params - {school_id, download_id, user_email, entitlements, policy}
 * @returns {Promise<object>} - {allowed, url, reason}
 */
export async function getSecureDownloadUrl({ 
  school_id, 
  download_id
}) {
  try {
    const result = await base44.request('/downloads/secure', {
      method: 'POST',
      body: { school_id, download_id }
    });

    if (!result) {
      return { allowed: false, url: null, reason: 'no_response' };
    }

    return result;
  } catch (error) {
    console.error('getSecureDownloadUrl error:', error);
    return { allowed: false, url: null, reason: 'error' };
  }
}
