// grid.js — the Off Track hero: a dot grid swept by a slow scan line.
// Under the pointer the dots thicken and a frame asks "IN SCOPE?" (the
// scope check of the attack surface scanner). Reduced motion: still grid.

import { animate, fit } from './motion.js';

const STEP = 24;

for (const canvas of document.querySelectorAll('canvas[data-grid]')) {
  let ctx, W, H;
  let mouse = null;

  const host = canvas.parentElement;
  host.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  host.addEventListener('pointerleave', () => (mouse = null));

  // The still grid and the fade are drawn once per size into offscreen
  // canvases; each frame only redraws the dots under the scan line and the
  // pointer. (Drawing every dot every frame cost ~100 ms on a slow phone.)
  let base, veil, ink = '#000';
  const layer = () => {
    const c = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.max(1, Math.round(W * dpr));
    c.height = Math.max(1, Math.round(H * dpr));
    const x = c.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [c, x];
  };
  const prepare = () => {
    ink = getComputedStyle(canvas).color;
    const g = getComputedStyle(document.body).backgroundColor;
    let x;
    [base, x] = layer();
    x.fillStyle = ink;
    x.globalAlpha = 0.13;
    x.beginPath();
    for (let y = STEP; y < H; y += STEP) {
      for (let xx = STEP; xx < W; xx += STEP) {
        x.moveTo(xx + 1, y);
        x.arc(xx, y, 1, 0, 6.283);
      }
    }
    x.fill();
    [veil, x] = layer();
    // Fade the grid out behind the headline so the text stays readable.
    const fade = x.createLinearGradient(0, 0, W, 0);
    fade.addColorStop(0, g);
    fade.addColorStop(0.55, g.replace('rgb(', 'rgba(').replace(')', ', 0.55)'));
    fade.addColorStop(1, g.replace('rgb(', 'rgba(').replace(')', ', 0)'));
    x.fillStyle = fade;
    x.fillRect(0, 0, W, H);
  };

  const dot = (x, y, r, a) => {
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.283);
    ctx.fill();
  };

  const draw = (t) => {
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(base, 0, 0, W, H);
    ctx.fillStyle = ink;
    const sweep = ((t * 90) % (W + 400)) - 200;
    const x0 = Math.max(STEP, Math.ceil((sweep - 120) / STEP) * STEP);
    for (let x = x0; x < Math.min(W, sweep + 120); x += STEP) {
      const a = 0.25 * (1 - Math.abs(x - sweep) / 120);
      for (let y = STEP; y < H; y += STEP) dot(x, y, 1, a);
    }
    if (mouse) {
      const gx0 = Math.max(STEP, Math.ceil((mouse.x - 150) / STEP) * STEP);
      const gy0 = Math.max(STEP, Math.ceil((mouse.y - 150) / STEP) * STEP);
      for (let y = gy0; y < Math.min(H, mouse.y + 150); y += STEP) {
        for (let x = gx0; x < Math.min(W, mouse.x + 150); x += STEP) {
          const d = Math.hypot(x - mouse.x, y - mouse.y);
          if (d < 150) {
            const k = 1 - d / 150;
            dot(x, y, 1 + 1.4 * k, 0.55 * k);
          }
        }
      }
      const gx = Math.round(mouse.x / STEP) * STEP;
      const gy = Math.round(mouse.y / STEP) * STEP;
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.strokeRect(gx - 36, gy - 36, 72, 72);
      ctx.globalAlpha = 0.75;
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.textBaseline = 'top';
      ctx.fillText('IN SCOPE?', gx - 36, gy + 42);
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(veil, 0, 0, W, H);
  };

  animate(canvas, {
    draw,
    onResize: () => {
      ({ ctx, W, H } = fit(canvas));
      prepare();
    },
    stillAt: 0,
  });
}
