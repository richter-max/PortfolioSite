// countdown.js — live countdown to race day in the On Track hero.
// The server renders the days; this fills in hours, minutes and seconds.
// With reduced motion it updates once a minute instead of every second.

import { reduceMotion } from './motion.js';

for (const el of document.querySelectorAll('[data-countdown]')) {
  const target = new Date(el.dataset.countdown).getTime();
  const parts = Object.fromEntries([...el.querySelectorAll('[data-cd]')].map((n) => [n.dataset.cd, n]));
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    let ms = Math.max(0, target - Date.now());
    const d = Math.floor(ms / 864e5);
    ms -= d * 864e5;
    const h = Math.floor(ms / 36e5);
    ms -= h * 36e5;
    const m = Math.floor(ms / 6e4);
    ms -= m * 6e4;
    parts.d.textContent = String(d);
    parts.h.textContent = pad(h);
    parts.m.textContent = pad(m);
    parts.s.textContent = pad(Math.floor(ms / 1e3));
  };
  tick();
  setInterval(tick, reduceMotion() ? 60000 : 1000);
}
