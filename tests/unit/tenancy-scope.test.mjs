import test from 'node:test';
import assert from 'node:assert/strict';
import { GLOBAL_ENTITIES, SCHOOL_SCOPED_ENTITIES, requiresSchoolScope } from '../../src/components/api/scopedEntities.js';

test('requiresSchoolScope returns true for school-scoped entities', () => {
  assert.equal(requiresSchoolScope('Course'), true);
  assert.ok(SCHOOL_SCOPED_ENTITIES.includes('Lesson'));
});

test('requiresSchoolScope returns false for global entities', () => {
  assert.equal(requiresSchoolScope('School'), false);
  assert.ok(GLOBAL_ENTITIES.includes('School'));
});
