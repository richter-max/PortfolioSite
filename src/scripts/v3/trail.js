// trail.js — the headlamp. Turns the night on for [data-trail]: a small,
// low-resolution canvas draws the darkness with an elliptical beam cut
// out; the beam follows the trail at the middle of the screen, the mouse
// turns it a little, and after the main event the night lifts. Stations
// light up when they reach the beam. Reduced motion: nothing happens and
// the section stays lit.

import { reduceMotion } from './motion.js';

const root = document.querySelector('[data-trail]');

if (root && !reduceMotion()) {
  const canvas = root.querySelector('[data-trail-beam]');
  const ctx = canvas.getContext('2d');
  const n = Number(root.dataset.n);
  const wide = window.matchMedia('(min-width: 760px)');
  const fine = window.matchMedia('(pointer: fine)').matches;
  const SCALE = 0.4; // the beam is soft; a quarter of the pixels is plenty

  // Must match Trail.astro.
  const phase = (t) => Math.PI * (t * (n + 1.6) - 0.6);
  const xAt = (t) => (wide.matches ? 0.5 + 0.16 * Math.sin(phase(t)) : 0.09 + 0.03 * Math.sin(phase(t)));
  // Where the main event sits, as a share of the section. Read from the
  // layout: fixed steps on wide screens, normal flow on phones.
  const mainEl = root.querySelector('.is-main');
  let mainT = (n - 1 + 1.1) / (n + 1.6);

  let W = 0;
  let H = 0;
  const resize = () => {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(W * SCALE));
    canvas.height = Math.max(1, Math.round(H * SCALE));
    if (mainEl && root.offsetHeight) mainT = mainEl.offsetTop / root.offsetHeight;
  };

  let mx = 0; // pointer target, -0.5..0.5
  let my = 0;
  let sx = 0; // eased head turn
  let sy = 0;
  let cx = 0;
  let cy = 0;
  let dark = 1;
  let raf = 0;
  let visible = false;

  const draw = () => {
    const r = Math.max(W, H) * (wide.matches ? 0.34 : 0.4);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (dark <= 0.002) return;
    ctx.setTransform(SCALE * 1.25, 0, 0, SCALE, 0, 0); // ellipse: wider than tall
    const x = cx / 1.25;
    const g = ctx.createRadialGradient(x, cy, 0, x, cy, r);
    const a = (v) => `rgba(6,6,5,${(v * dark).toFixed(3)})`;
    g.addColorStop(0, a(0));
    g.addColorStop(0.32, a(0.04));
    g.addColorStop(0.62, a(0.78));
    g.addColorStop(1, a(0.96));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W / 1.25 + 1, H + 1);
    // the lamp's own warm light in the middle of the beam
    const w = ctx.createRadialGradient(x, cy, 0, x, cy, r * 0.45);
    w.addColorStop(0, `rgba(255,248,230,${(0.07 * dark).toFixed(3)})`);
    w.addColorStop(1, 'rgba(255,248,230,0)');
    ctx.fillStyle = w;
    ctx.fillRect(0, 0, W / 1.25 + 1, H + 1);
  };

  // Scroll moves the beam along the trail directly; only the head turn
  // (pointer) and the sunrise ease in, so the loop stops once they settle.
  const frame = () => {
    raf = 0;
    const rect = root.getBoundingClientRect();
    const stageTop = canvas.getBoundingClientRect().top;
    const vc = window.innerHeight * 0.46;
    const t = Math.min(1, Math.max(0, (vc - rect.top) / rect.height));
    sx += (mx - sx) * 0.12;
    sy += (my - sy) * 0.12;
    // On a phone the trail runs along the left edge; aim the beam between
    // the trail and the text.
    cx = rect.width * (xAt(t) + (wide.matches ? 0 : 0.3)) + sx * W * 0.22;
    cy = vc - stageTop + sy * H * 0.18;
    const d = Math.min(1, Math.max(0, (mainT + 0.1 - t) / 0.08));
    dark += (d - dark) * 0.2;
    draw();
    const settling = Math.abs(mx - sx) > 0.001 || Math.abs(my - sy) > 0.001 || Math.abs(d - dark) > 0.002;
    if (visible && settling) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (visible && !raf) raf = requestAnimationFrame(frame);
  };

  resize();
  root.classList.add('is-night');
  new ResizeObserver(() => {
    resize();
    kick();
  }).observe(canvas);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  }).observe(root);
  window.addEventListener('scroll', kick, { passive: true });
  if (fine) {
    window.addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
        kick();
      },
      { passive: true },
    );
  }

  // Stations light up when they come into the beam.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.closest('[data-trail-st]').classList.toggle('is-lit', e.isIntersecting);
    },
    { rootMargin: '-22% 0px -30% 0px' },
  );
  for (const card of root.querySelectorAll('[data-trail-st] .trail__card')) io.observe(card);
}
