// days.js — refreshes every [data-days-until] countdown on the client,
// so it is right even if the last daily build was yesterday.

const today = new Date();
const midnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
for (const el of document.querySelectorAll('[data-days-until]')) {
  const [y, m, d] = el.dataset.daysUntil.split('-').map(Number);
  const days = Math.max(0, Math.round((Date.UTC(y, m - 1, d) - midnight) / 864e5));
  el.textContent = (el.dataset.prefix ?? '') + days + (el.dataset.suffix ?? '');
}
