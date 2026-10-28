// scoreboard.js — the table tennis flip counter.
// Countdown mode: the days to the first match are recomputed here, so the
// number is right even if the last build was days ago. When the board
// scrolls into view, the flaps count up from 00 to their value, one flip
// per step; in record mode a ball of light rolls along the top edge after.
// Without JS or with reduced motion the server-rendered numbers just stand.

import { reduceMotion } from './motion.js';

const DAY = 864e5;

for (const board of document.querySelectorAll('[data-scoreboard]')) {
  // live countdown
  const days = board.querySelector('[data-days-flaps]');
  if (days) {
    const [y, m, d] = days.dataset.daysFlaps.split('-').map(Number);
    const t = new Date();
    const n = Math.max(0, Math.round((Date.UTC(y, m - 1, d) - Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())) / DAY));
    const digits = String(Math.min(99, n)).padStart(2, '0').split('');
    days.querySelectorAll('[data-flap]').forEach((f, i) => {
      f.dataset.to = digits[i];
      f.textContent = digits[i];
    });
    const img = board.querySelector('[role="img"]');
    if (img) img.setAttribute('aria-label', `${n} ${n === 1 ? 'day' : 'days'} to the first match`);
  }

  if (reduceMotion() || !('IntersectionObserver' in window)) continue;

  // the Q-TTR tag only swings while the board is on screen
  new IntersectionObserver(([e]) => board.classList.toggle('is-live', e.isIntersecting)).observe(board);

  // Count up per pair (two digits = one number), so 07 runs 00 → 01 → … → 07.
  const pairs = [...board.querySelectorAll('.board__pair')].map((p) => {
    const flaps = [...p.querySelectorAll('[data-flap]')];
    return { flaps, to: Number(flaps.map((f) => f.dataset.to).join('')) };
  });
  const show = (flaps, n) => {
    String(n).padStart(2, '0').split('').forEach((ch, i) => {
      const f = flaps[i];
      if (f.textContent === ch) return;
      f.textContent = ch;
      f.classList.remove('is-flip');
      void f.offsetWidth; // restart the animation
      f.classList.add('is-flip');
    });
  };

  const r = board.getBoundingClientRect();
  if (r.top < window.innerHeight * 0.8) continue; // already on screen at load: leave it
  for (const p of pairs) show(p.flaps, 0);
  for (const f of board.querySelectorAll('[data-flap]')) f.classList.remove('is-flip');

  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const steps = Math.max(...pairs.map((p) => p.to), 0);
      const dt = Math.max(70, Math.min(260, 1800 / Math.max(1, steps)));
      let i = 0;
      const tick = () => {
        i++;
        for (const p of pairs) if (i <= p.to) show(p.flaps, i);
        if (i < steps) setTimeout(tick, dt);
        else if (board.dataset.mode === 'record') board.querySelector('.board__ball')?.classList.add('is-rolling');
      };
      setTimeout(tick, 250);
    },
    { threshold: 0.4 },
  );
  io.observe(board);
}
