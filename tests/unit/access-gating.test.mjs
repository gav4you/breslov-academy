import test from 'node:test';
import assert from 'node:assert/strict';
import { getPreviewMaterial, sanitizeMaterialForAccess, shouldFetchMaterials } from '../../src/components/materials/materialsAccess.js';

test('shouldFetchMaterials only allows FULL or PREVIEW', () => {
  assert.equal(shouldFetchMaterials('FULL'), true);
  assert.equal(shouldFetchMaterials('PREVIEW'), true);
  assert.equal(shouldFetchMaterials('LOCKED'), false);
  assert.equal(shouldFetchMaterials('DRIP_LOCKED'), false);
});

test('sanitizeMaterialForAccess blocks locked content', () => {
  const material = { content_text: 'abc', duration_seconds: 120 };
  assert.equal(sanitizeMaterialForAccess(material, 'LOCKED', {}), null);
  assert.equal(sanitizeMaterialForAccess(material, 'DRIP_LOCKED', {}), null);
});

test('preview material is truncated by policy', () => {
  const material = { content_text: 'abcdefgh', duration_seconds: 120, video_url: 'v', audio_url: 'a' };
  const policy = { max_preview_chars: 4, max_preview_seconds: 45 };
  const preview = getPreviewMaterial(material, policy);
  assert.equal(preview.content_text, 'abcd...');
  assert.equal(preview.duration_seconds, 45);
  const sanitized = sanitizeMaterialForAccess(material, 'PREVIEW', policy);
  assert.equal(sanitized.content_text, 'abcd...');
});
