import test from 'node:test';
import assert from 'node:assert/strict';
import { createEntitlementsForOffer } from '../../functions/api/_billing.js';

test('createEntitlementsForOffer is idempotent for the same source id', async () => {
  const env = {};
  const schoolId = 'school-idempotency';
  const userEmail = 'student@example.com';
  const offer = { id: 'offer-subscription', offer_type: 'SUBSCRIPTION', access_scope: 'ALL_COURSES' };

  const first = await createEntitlementsForOffer({
    env,
    schoolId,
    offer,
    userEmail,
    source: 'PURCHASE',
    sourceId: 'txn-001',
  });

  assert.equal(first.created.length, 1);
  assert.equal(first.skipped.length, 0);

  const second = await createEntitlementsForOffer({
    env,
    schoolId,
    offer,
    userEmail,
    source: 'PURCHASE',
    sourceId: 'txn-001',
  });

  assert.equal(second.created.length, 0);
  assert.equal(second.skipped.length, 1);
  assert.equal(second.skipped[0].reason, 'already_exists');
});
