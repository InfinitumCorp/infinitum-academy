// Pure helpers for the membership section, kept apart from the DOM so they can be tested with node --test.

export const PRODUCT = 'academy';
export const PLAN_ID = 'academy_membership';
export const DEFAULT_REVENUE_URL = 'https://infinitum-revenue.infinitumcorp.workers.dev';

/** The revenue API origin without a trailing slash. */
export const revenueBase = url => String(url || DEFAULT_REVENUE_URL).replace(/\/+$/, '');

/** The membership plan from GET /v1/catalog, or null when it is not listed. */
export const findPlan = catalog => (catalog && Array.isArray(catalog.plans) ? catalog.plans : []).find(p => p.id === PLAN_ID) || null;

/** The Academy entitlement from GET /v1/me/entitlements, or null. */
export const findEntitlement = ent => (ent && Array.isArray(ent.products) ? ent.products : []).find(p => p.product === PRODUCT) || null;

const LIVE = new Set(['active', 'trialing', 'past_due']);
/** True when the entitlement is the membership plan in a status that still grants access. */
export const isMember = e => !!e && e.plan === PLAN_ID && LIVE.has(e.status);

export const formatPrice = p =>
  !p ? '' : p.priceCents === 0 ? 'Free'
    : `$${(p.priceCents / 100).toLocaleString('en-US', { minimumFractionDigits: p.priceCents % 100 ? 2 : 0 })} / ${p.interval}`;

/** "success" or "cancelled" when Stripe Checkout just sent the person back here, otherwise null. */
export const checkoutResult = search => {
  const v = new URLSearchParams(search).get('billing');
  return v === 'success' || v === 'cancelled' ? v : null;
};

/** The page to come back to after Checkout or the portal: this page, no query or fragment. */
export const returnUrl = href => { const u = new URL(href); u.search = ''; u.hash = ''; return u.toString(); };
