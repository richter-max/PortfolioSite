// landscape.js — the On Track hero: five ridges of night mountains,
// drifting mist, faint stars, and a line of headlamps climbing the middle
// ridge toward the summit (the KAT100 midnight start). The layers shift a
// little with the pointer. Reduced motion: one still frame.
//
// Performance: the sky, every ridge and the vignette are rendered once per
// resize into offscreen canvases. A frame only blits those layers at their
// parallax offset and draws the mist bands and the lamps. Animation starts
// after the page has loaded, so it never competes with first paint.

import { animate, rng } from './motion.js';

const LAYERS = [
  { base: 0.4, amp: 0.26, rough: 1.0, col: [58, 58, 55], par: 4 },
  { base: 0.5, amp: 0.22, rough: 0.9, col: [44, 44, 42], par: 8 },
  { base: 0.6, amp: 0.17, rough: 0.75, col: [31, 31, 30], par: 14 },
  { base: 0.72, amp: 0.12, rough: 0.6, col: [21, 21, 20], par: 22 },
  { base: 0.86, amp: 0.09, rough: 0.45, col: [12, 12, 11], par: 34 },
];
let STEP = 4;
const BLEED = 60; // extra width on each side for parallax
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

function layerCanvas(w, h, dpr) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const x = c.getContext('2d');
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [c, x];
}

function setup(canvas) {
  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let dpr = 1;
  let sky, vignette, layers, ridge3, trail, mist;
  let mx = 0;
  let target = 0;

  const build = () => {
    const r = canvas.getBoundingClientRect();
    // Phones get a lower pixel ratio: the scene is soft anyway.
    dpr = Math.min(window.devicePixelRatio || 1, r.width < 700 ? 1.5 : 2);
    W = r.width;
    H = r.height;
    STEP = W < 700 ? 6 : 4; // fewer points on phones, same shape
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const width = W + BLEED * 2;

    // sky + stars
    let x;
    [sky, x] = layerCanvas(W, H, dpr);
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#040404');
    g.addColorStop(0.5, '#121211');
    g.addColorStop(1, '#242422');
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    const srand = rng(42);
    x.fillStyle = '#edebe6';
    for (let i = 0; i < Math.round(W / 9); i++) {
      x.globalAlpha = 0.2 + srand() * 0.45;
      x.beginPath();
      x.arc(srand() * W, srand() * H * 0.42, srand() * 0.9 + 0.2, 0, 6.283);
      x.fill();
    }
    x.globalAlpha = 1;

    // ridges
    layers = LAYERS.map((L, li) => {
      const rand = rng(7919 * (li + 3));
      const oct = Array.from({ length: 5 }, () => noise1(rand, 64));
      const pts = [];
      for (let px = 0; px <= width; px += STEP) {
        let y = 0;
        let a = 1;
        let f = 1 / 260;
        let norm = 0;
        oct.forEach((n, o) => {
          const v = n(px * f + li * 13.7);
          y += (o === 0 ? v : Math.abs(v - 0.5) * 2) * a * (o === 0 ? 1 : L.rough);
          norm += a;
          a *= 0.5;
          f *= 2.1;
        });
        pts.push(H * L.base - (y / norm) * H * L.amp);
      }
      const [c, cx] = layerCanvas(width, H, dpr);
      cx.beginPath();
      cx.moveTo(0, H);
      pts.forEach((py, i) => cx.lineTo(i * STEP, py));
      cx.lineTo((pts.length - 1) * STEP, H);
      cx.closePath();
      const [cr, cg, cb] = L.col;
      const fill = cx.createLinearGradient(0, H * (L.base - L.amp), 0, H);
      fill.addColorStop(0, `rgb(${cr + 10},${cg + 10},${cb + 9})`);
      fill.addColorStop(0.35, `rgb(${cr},${cg},${cb})`);
      fill.addColorStop(1, `rgb(${Math.max(cr - 14, 6)},${Math.max(cg - 14, 6)},${Math.max(cb - 14, 5)})`);
      cx.fillStyle = fill;
      cx.fill();
      if (li === 2) ridge3 = pts;
      return c;
    });

    // mist bands, one gradient per layer, reused every frame
    mist = LAYERS.slice(0, -1).map((L, li) => {
      const y0 = H * L.base - H * 0.02;
      const m = ctx.createLinearGradient(0, y0, 0, y0 + H * 0.14);
      m.addColorStop(0, 'rgba(210,208,200,0)');
      m.addColorStop(0.5, `rgba(210,208,200,${0.05 + li * 0.01})`);
      m.addColorStop(1, 'rgba(210,208,200,0)');
      return { y0, m };
    });

    // vignette
    [vignette, x] = layerCanvas(W, H, dpr);
    const v = x.createRadialGradient(W * 0.5, H * 0.45, Math.min(W, H) * 0.2, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,.55)');
    x.fillStyle = v;
    x.fillRect(0, 0, W, H);

    // The headlamps climb the last stretch of the middle ridge to its peak.
    let peak = 20;
    for (let i = 20; i < ridge3.length - 20; i++) if (ridge3[i] < ridge3[peak]) peak = i;
    trail = { from: Math.max(0, peak - 90), to: peak };
  };

  const draw = (t) => {
    mx += (target - mx) * 0.04;
    ctx.drawImage(sky, 0, 0, W, H);
    layers.forEach((c, li) => {
      const ox = -BLEED + mx * LAYERS[li].par;
      ctx.drawImage(c, ox, 0, W + BLEED * 2, H);
      if (li < mist.length) {
        ctx.fillStyle = mist[li].m;
        ctx.fillRect(Math.sin(t / 7 + li) * 30 - 40, mist[li].y0, W + 80, H * 0.14);
      }
      if (li === 2) {
        const span = trail.to - trail.from;
        for (let k = 0; k < LAMPS; k++) {
          const prog = (t / 26 + k / LAMPS) % 1;
          const fi = trail.from + prog * span;
          const i0 = Math.floor(fi);
          const fr = fi - i0;
          const y = ridge3[i0] * (1 - fr) + ridge3[Math.min(i0 + 1, ridge3.length - 1)] * fr + 7;
          const px = ox + fi * STEP;
          const fade = Math.min(1, prog * 6, (1 - prog) * 10);
          ctx.globalAlpha = 0.28 * fade;
          ctx.fillStyle = '#fff8e6';
          ctx.beginPath();
          ctx.arc(px, y, 9, 0, 6.283);
          ctx.fill();
          ctx.globalAlpha = 0.5 * fade;
          ctx.beginPath();
          ctx.arc(px, y, 4.5, 0, 6.283);
          ctx.fill();
          ctx.globalAlpha = fade;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, y, 1.6, 0, 6.283);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    });
    ctx.drawImage(vignette, 0, 0, W, H);
  };

  const host = canvas.parentElement;
  host.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    target = ((e.clientX - r.left) / r.width - 0.5) * 2;
  });
  host.addEventListener('pointerleave', () => (target = 0));

  animate(canvas, { draw, onResize: build, stillAt: 9 });
}

const start = () => {
  for (const canvas of document.querySelectorAll('canvas[data-landscape]')) setup(canvas);
};
if (document.readyState === 'complete') start();
else
  window.addEventListener(
    'load',
    // Let the page settle first; the canvas fades in when it is ready.
    () => setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 800 }) : start()), 900),
    { once: true },
  );
