// Academy membership, paid through Stripe via the central Infinitum revenue API.
//
// The site never holds a Stripe key. It sends the signed-in person's Cumulus ID access token
// (from /cumulus-id.js, window.CumulusID) to the revenue API, which returns a Stripe Checkout or
// customer-portal URL to open. After Checkout, Stripe returns here with ?billing=success|cancelled.
//
// The revenue API origin comes from VITE_REVENUE_URL at build time, then data-revenue-url on the
// section, then the production Worker.
import { revenueBase, findPlan, findEntitlement, isMember, formatPrice, checkoutResult, returnUrl } from './plan.js';

const root = document.getElementById('membership');
if (root) {
  const REVENUE = revenueBase(import.meta.env.VITE_REVENUE_URL || root.dataset.revenueUrl);
  const $ = s => root.querySelector(s);
  const el = {
    name: $('[data-m="name"]'), price: $('[data-m="price"]'), status: $('[data-m="status"]'),
    signedOut: $('[data-m="signed-out"]'), signedIn: $('[data-m="signed-in"]'),
    join: $('[data-m="join"]'), manage: $('[data-m="manage"]'),
    notice: $('[data-m="notice"]'), error: $('[data-m="error"]'),
  };
  const token = () => (window.CumulusID && window.CumulusID.token()) || null;
  let plan = null, ent = null, busy = false, loadedFor = null;

  const show = (node, text) => { node.textContent = text || ''; node.hidden = !text; };

  async function api(path, init = {}) {
    const res = await fetch(REVENUE + path, {
      ...init,
      headers: { authorization: `Bearer ${token() || ''}`, ...(init.body ? { 'content-type': 'application/json' } : {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((body && body.error && body.error.message) || `Billing request failed (${res.status})`);
    return body;
  }

  function render() {
    const t = token();
    const member = isMember(ent);
    el.signedOut.hidden = !!t;
    el.signedIn.hidden = !t;
    if (plan) { el.name.textContent = plan.name; el.price.textContent = formatPrice(plan); }
    el.status.textContent = !t ? 'Sign in to see your membership.'
      : loadedFor !== t ? 'Checking your membership…'
      : member ? `You are a member (${ent.status.replace('_', ' ')}).`
      : ent ? `Not a member. Last status: ${ent.status.replace('_', ' ')}.`
      : 'Not a member yet.';
    el.join.hidden = member;
    el.join.disabled = busy || !plan || loadedFor !== t;
    el.manage.hidden = !member && !ent;
    el.manage.disabled = busy;
  }

  async function loadEntitlements() {
    const t = token();
    if (!t) { ent = null; loadedFor = null; return render(); }
    if (loadedFor === t) return render();
    render();
    try {
      ent = findEntitlement(await api('/v1/me/entitlements'));
      loadedFor = t;
      show(el.error, '');
    } catch (e) { show(el.error, e.message); }
    render();
  }

  async function go(path, payload) {
    busy = true; render(); show(el.error, '');
    try {
      const { url } = await api(path, { method: 'POST', body: JSON.stringify({ ...payload, returnUrl: returnUrl(location.href) }) });
      location.assign(url);
    } catch (e) { busy = false; show(el.error, e.message); render(); }
  }

  el.join.addEventListener('click', () => go('/v1/subscriptions/checkout', { planId: plan.id }));
  el.manage.addEventListener('click', () => go('/v1/billing/portal', {}));

  const result = checkoutResult(location.search);
  if (result) {
    show(el.notice, result === 'success' ? 'Payment complete. Welcome to the Academy membership.' : 'Checkout cancelled. No charge was made.');
    const u = new URL(location.href); u.searchParams.delete('billing'); history.replaceState(null, '', u.toString());
    requestAnimationFrame(() => root.scrollIntoView());
  }

  fetch(REVENUE + '/v1/catalog')
    .then(r => r.json())
    .then(c => { plan = findPlan(c); if (!plan) show(el.error, 'Membership is not available right now.'); render(); })
    .catch(() => show(el.error, 'The membership plan could not be loaded.'));

  window.addEventListener('cumulus-id', loadEntitlements);
  loadEntitlements();
}
