// landscape.js — the On Track hero: five ridges of night mountains,
// drifting mist, faint stars, and a line of headlamps climbing the middle
// ridge toward the summit (the KAT100 midnight start). The layers shift a
// little with the pointer. Reduced motion: one still frame.

import { animate, fit, rng } from './motion.js';

const LAYERS = [
  { base: 0.4, amp: 0.26, rough: 1.0, col: [58, 58, 55], par: 4 },
  { base: 0.5, amp: 0.22, rough: 0.9, col: [44, 44, 42], par: 8 },
  { base: 0.6, amp: 0.17, rough: 0.75, col: [31, 31, 30], par: 14 },
  { base: 0.72, amp: 0.12, rough: 0.6, col: [21, 21, 20], par: 22 },
  { base: 0.86, amp: 0.09, rough: 0.45, col: [12, 12, 11], par: 34 },
];
const STEP = 4;
const LAMPS = 11;

function noise1(rand, n) {
  const v = Array.from({ length: n + 2 }, rand);
  return (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const t = (1 - Math.cos(f * Math.PI)) / 2;
    return v[i % (n + 1)] * (1 - t) + v[(i + 1) % (n + 1)] * t;
  };
}

for (const canvas of document.querySelectorAll('canvas[data-landscape]')) {
  let ctx, W, H, ridges, stars, trail;
  let mx = 0;
  let target = 0;

  const build = () => {
    ({ ctx, W, H } = fit(canvas));
    const width = W + 120;
    ridges = LAYERS.map((L, li) => {
      const rand = rng(7919 * (li + 3));
      const oct = Array.from({ length: 5 }, () => noise1(rand, 64));
      const pts = [];
      for (let x = 0; x <= width; x += STEP) {
        let y = 0;
        let a = 1;
        let f = 1 / 260;
        let norm = 0;
        oct.forEach((n, o) => {
          const v = n(x * f + li * 13.7);
          y += (o === 0 ? v : Math.abs(v - 0.5) * 2) * a * (o === 0 ? 1 : L.rough);
          norm += a;
          a *= 0.5;
          f *= 2.1;
        });
        pts.push(H * L.base - (y / norm) * H * L.amp);
      }
      return pts;
    });
    const srand = rng(42);
    stars = Array.from({ length: Math.round(W / 9) }, () => ({
      x: srand() * W,
      y: srand() * H * 0.42,
      r: srand() * 0.9 + 0.2,
      p: srand() * 6.28,
    }));
    // The headlamps climb the last stretch of the middle ridge up to its peak.
    const R = ridges[2];
    let peak = 20;
    for (let i = 20; i < R.length - 20; i++) if (R[i] < R[peak]) peak = i;
    trail = { from: Math.max(0, peak - 90), to: peak };
  };

  const draw = (t) => {
    mx += (target - mx) * 0.04;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#040404');
    sky.addColorStop(0.5, '#121211');
    sky.addColorStop(1, '#242422');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#edebe6';
    for (const s of stars) {
      ctx.globalAlpha = 0.25 + 0.35 * (Math.sin(t / 0.9 + s.p) * 0.5 + 0.5);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    LAYERS.forEach((L, li) => {
      const pts = ridges[li];
      const ox = -60 + mx * L.par;
      ctx.beginPath();
      ctx.moveTo(ox, H);
      pts.forEach((y, i) => ctx.lineTo(ox + i * STEP, y));
      ctx.lineTo(ox + (pts.length - 1) * STEP, H);
      ctx.closePath();
      const [r, g, b] = L.col;
      const fill = ctx.createLinearGradient(0, H * (L.base - L.amp), 0, H);
      fill.addColorStop(0, `rgb(${r + 10},${g + 10},${b + 9})`);
      fill.addColorStop(0.35, `rgb(${r},${g},${b})`);
      fill.addColorStop(1, `rgb(${Math.max(r - 14, 6)},${Math.max(g - 14, 6)},${Math.max(b - 14, 5)})`);
      ctx.fillStyle = fill;
      ctx.fill();

      if (li < LAYERS.length - 1) {
        const drift = Math.sin(t / 7 + li) * 30;
        const y0 = H * L.base - H * 0.02;
        const mist = ctx.createLinearGradient(0, y0, 0, y0 + H * 0.14);
        mist.addColorStop(0, 'rgba(210,208,200,0)');
        mist.addColorStop(0.5, `rgba(210,208,200,${0.05 + li * 0.01})`);
        mist.addColorStop(1, 'rgba(210,208,200,0)');
        ctx.fillStyle = mist;
        ctx.fillRect(drift - 40, y0, W + 80, H * 0.14);
      }

      if (li === 2) {
        const span = trail.to - trail.from;
        for (let k = 0; k < LAMPS; k++) {
          const prog = (t / 26 + k / LAMPS) % 1;
          const fi = trail.from + prog * span;
          const i0 = Math.floor(fi);
          const fr = fi - i0;
          const y = pts[i0] * (1 - fr) + pts[Math.min(i0 + 1, pts.length - 1)] * fr + 7;
          const x = ox + fi * STEP;
          const fade = Math.min(1, prog * 6, (1 - prog) * 10);
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
          glow.addColorStop(0, `rgba(255,248,230,${0.55 * fade})`);
          glow.addColorStop(1, 'rgba(255,248,230,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, 6.283);
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${fade})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, 6.283);
          ctx.fill();
        }
      }
    });

    const vig = ctx.createRadialGradient(W * 0.5, H * 0.45, Math.min(W, H) * 0.2, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  };

  const host = canvas.parentElement;
  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    target = ((e.clientX - r.left) / r.width - 0.5) * 2;
  });
  host.addEventListener('pointerleave', () => (target = 0));

  animate(canvas, { draw, onResize: build, stillAt: 9 });
}
