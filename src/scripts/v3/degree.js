// degree.js — marks the block of the degree that is running today and
// fills its progress bar ("Day 27 of 92"). The build does the same, this
// keeps it right between daily builds.

const today = new Date();
const iso = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);
const DAY = 864e5;

for (const el of document.querySelectorAll('[data-blk]')) {
  const { start, end, name } = el.dataset;
  const now = iso >= start && iso < end;
  el.classList.toggle('is-now', now);
  el.querySelector('[data-blk-name]').textContent = now ? `Now · ${name}` : name;
  const prog = el.querySelector('[data-blk-prog]');
  prog.hidden = !now;
  if (!now) continue;
  const days = Math.round((Date.parse(end) - Date.parse(start)) / DAY);
  const day = Math.floor((Date.parse(iso) - Date.parse(start)) / DAY) + 1;
  el.querySelector('[data-blk-fill]').style.width = `${((day / days) * 100).toFixed(1)}%`;
  el.querySelector('[data-blk-day]').textContent = `Day ${day} of ${days}`;
}
