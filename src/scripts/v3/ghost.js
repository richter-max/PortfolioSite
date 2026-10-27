// ghost.js — replay of a race against an even-pace ghost. The page
// renders the end state; this script adds play/pause and the scrubber.
// It autoplays once when the section comes into view, unless the
// reader prefers reduced motion.

import { reduceMotion } from './motion.js';

const KM = 42.195;
const REPLAY_SECONDS = 36; // the whole race in about half a minute

const fmt = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

for (const root of document.querySelectorAll('[data-ghost]')) {
  const data = JSON.parse(root.querySelector('[data-ghost-data]').textContent);
  const pts = data.points; // [km, seconds], time never decreases
  const end = data.official;
  const $ = (s) => root.querySelector(s);
  const clock = $('[data-g-clock]');
  const meEl = $('[data-g-me]');
  const ghostEl = $('[data-g-ghost]');
  const gapEl = $('[data-g-gap]');
  const meDot = $('[data-g-medot]');
  const ghostDot = $('[data-g-ghostdot]');
  const play = $('[data-g-play]');
  const scrub = $('[data-g-scrub]');
  const bars = [...root.querySelectorAll('[data-g-bar]')];

  const kmAt = (t) => {
    if (t <= 0) return 0;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i][1] >= t) {
        const [k0, t0] = pts[i - 1];
        const [k1, t1] = pts[i];
        return t1 === t0 ? k1 : k0 + ((t - t0) / (t1 - t0)) * (k1 - k0);
      }
    }
    return KM;
  };
  const show = (t) => {
    const me = kmAt(t);
    const ghost = Math.min(KM, (t / data.goal) * KM);
    clock.textContent = fmt(t);
    meEl.textContent = `${me.toFixed(1)} km`;
    ghostEl.textContent = ghost >= KM ? 'Finished' : `${ghost.toFixed(1)} km`;
    // Gap = how much later I reach the ghost's position (or the finish).
    const ghostTimeAtMe = (me / KM) * data.goal;
    const gap = Math.max(0, t - ghostTimeAtMe);
    gapEl.textContent = gap < 1 ? '0:00:00' : `+${fmt(gap)}`;
    meDot.style.setProperty('--x', `${(me / KM) * 100}%`);
    ghostDot.style.setProperty('--x', `${(ghost / KM) * 100}%`);
    for (const b of bars) b.classList.toggle('is-future', Number(b.dataset.gBar) > me + 0.001);
    scrub.value = String(Math.round(t));
    scrub.setAttribute('aria-valuetext', fmt(t));
  };

  let t = end;
  let raf = 0;
  let last = 0;
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    play.setAttribute('aria-pressed', 'false');
    play.textContent = t >= end ? 'Replay' : 'Play';
  };
  const tick = (now) => {
    const dt = (now - last) / 1000;
    last = now;
    t = Math.min(end, t + (dt * end) / REPLAY_SECONDS);
    show(t);
    if (t >= end) return stop();
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (t >= end) t = 0;
    play.setAttribute('aria-pressed', 'true');
    play.textContent = 'Pause';
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  play.addEventListener('click', () => (raf ? stop() : start()));
  scrub.addEventListener('input', () => {
    if (raf) stop();
    t = Number(scrub.value);
    show(t);
    play.textContent = t >= end ? 'Replay' : 'Play';
  });

  show(t);

  if (!reduceMotion()) {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        t = 0;
        start();
      },
      { threshold: 0.5 },
    );
    io.observe(root);
  }
}
