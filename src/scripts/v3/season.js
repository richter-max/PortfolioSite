// season.js — season list with a fixed image window. Hover, focus or tap
// a race: its image wipes down over the previous one. Also refreshes every
// [data-days-until] countdown on the client, so it is right even if the
// last daily build was yesterday.

for (const root of document.querySelectorAll('[data-season]')) {
  const rows = [...root.querySelectorAll('[data-season-row]')];
  const layers = [...root.querySelectorAll('[data-season-layer]')];
  const cap = root.querySelector('[data-season-cap]');
  const capR = root.querySelector('[data-season-cap-r]');
  const count = root.querySelector('[data-season-count]');
  let active = rows.findIndex((r) => r.getAttribute('aria-pressed') === 'true');

  const pick = (i) => {
    if (i === active) return;
    layers.forEach((l, n) => {
      l.classList.toggle('is-prev', n === active);
      l.classList.toggle('is-on', n === i);
      if (n !== active && n !== i) l.classList.remove('is-prev');
    });
    rows.forEach((r, n) => r.setAttribute('aria-pressed', String(n === i)));
    cap.textContent = rows[i].dataset.cap;
    capR.textContent = rows[i].dataset.capR;
    count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(rows.length).padStart(2, '0')}`;
    active = i;
  };

  rows.forEach((r, i) => {
    for (const ev of ['mouseenter', 'focus', 'click']) r.addEventListener(ev, () => pick(i));
  });
}

const today = new Date();
const midnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
for (const el of document.querySelectorAll('[data-days-until]')) {
  const [y, m, d] = el.dataset.daysUntil.split('-').map(Number);
  const days = Math.max(0, Math.round((Date.UTC(y, m - 1, d) - midnight) / 864e5));
  el.textContent = (el.dataset.prefix ?? '') + days + (el.dataset.suffix ?? '');
}
