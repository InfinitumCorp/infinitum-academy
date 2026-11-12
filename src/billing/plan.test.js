import test from 'node:test';
import assert from 'node:assert/strict';
import { revenueBase, findPlan, findEntitlement, isMember, formatPrice, checkoutResult, returnUrl, DEFAULT_REVENUE_URL } from './plan.js';

test('revenueBase defaults and trims slashes', () => {
  assert.equal(revenueBase(''), DEFAULT_REVENUE_URL);
  assert.equal(revenueBase('https://rev.example.test//'), 'https://rev.example.test');
});

test('findPlan picks academy_membership from the catalog', () => {
  const plan = { id: 'academy_membership', product: 'academy', priceCents: 2900, interval: 'month' };
  assert.deepEqual(findPlan({ plans: [{ id: 'other' }, plan] }), plan);
  assert.equal(findPlan({ plans: [] }), null);
  assert.equal(findPlan(null), null);
});

test('membership status', () => {
  const e = findEntitlement({ products: [{ product: 'eidetic', plan: 'x', status: 'active' }, { product: 'academy', plan: 'academy_membership', status: 'active' }] });
  assert.equal(isMember(e), true);
  assert.equal(isMember({ product: 'academy', plan: 'academy_membership', status: 'canceled' }), false);
  assert.equal(isMember(findEntitlement({ products: [] })), false);
});

test('formatPrice', () => {
  assert.equal(formatPrice({ priceCents: 2900, interval: 'month' }), '$29 / month');
  assert.equal(formatPrice({ priceCents: 2950, interval: 'year' }), '$29.50 / year');
  assert.equal(formatPrice({ priceCents: 0, interval: 'month' }), 'Free');
});

test('checkoutResult and returnUrl', () => {
  assert.equal(checkoutResult('?billing=success'), 'success');
  assert.equal(checkoutResult('?billing=cancelled'), 'cancelled');
  assert.equal(checkoutResult('?billing=oops'), null);
  assert.equal(returnUrl('https://a.test/?billing=success#membership'), 'https://a.test/');
});
