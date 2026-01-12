/**
 * Materials access helpers (pure, testable).
 */

/**
 * Determine if materials should be fetched based on access level.
 * @param {string} accessLevel - FULL | PREVIEW | LOCKED | DRIP_LOCKED
 * @returns {boolean}
 */
export function shouldFetchMaterials(accessLevel) {
  return accessLevel === 'FULL' || accessLevel === 'PREVIEW';
}

/**
 * Get preview-only material (truncated).
 * @param {object} material - Full material object
 * @param {object} policy - ContentProtectionPolicy
 * @returns {object}
 */
export function getPreviewMaterial(material, policy) {
  if (!material) return null;

  const maxChars = policy?.max_preview_chars || 1500;
  const maxSeconds = policy?.max_preview_seconds || 90;

  return {
    content_text: material.content_text
      ? material.content_text.substring(0, maxChars) + (material.content_text.length > maxChars ? '...' : '')
      : '',
    video_url: material.video_url, // Player will enforce time limit
    audio_url: material.audio_url,
    duration_seconds: Math.min(material.duration_seconds || 0, maxSeconds),
    is_preview: true,
    preview_limit_chars: maxChars,
    preview_limit_seconds: maxSeconds,
  };
}

/**
 * Sanitize material based on access level (CRITICAL SECURITY).
 * @param {object} material - Full material object
 * @param {string} accessLevel - FULL | PREVIEW | LOCKED | DRIP_LOCKED
 * @param {object} policy - ContentProtectionPolicy
 * @returns {object|null}
 */
export function sanitizeMaterialForAccess(material, accessLevel, policy) {
  if (accessLevel === 'LOCKED' || accessLevel === 'DRIP_LOCKED') {
    return null;
  }

  if (accessLevel === 'PREVIEW') {
    return getPreviewMaterial(material, policy);
  }

  return material;
}
