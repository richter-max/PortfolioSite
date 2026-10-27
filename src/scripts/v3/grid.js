// grid.js — the Off Track hero: a dot grid swept by a slow scan line.
// Under the pointer the dots thicken and a frame asks "IN SCOPE?" (the
// scope check of the attack surface scanner). Reduced motion: still grid.

import { animate, fit } from './motion.js';

const STEP = 24;

for (const canvas of document.querySelectorAll('canvas[data-grid]')) {
  let ctx, W, H;
  let mouse = null;
  const ink = () => getComputedStyle(canvas).color;
  const ground = () => getComputedStyle(document.body).backgroundColor;

  const host = canvas.parentElement;
  host.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  host.addEventListener('pointerleave', () => (mouse = null));

  const draw = (t) => {
    const c = ink();
    ctx.clearRect(0, 0, W, H);
    const sweep = ((t * 90) % (W + 400)) - 200;
    ctx.fillStyle = c;
    for (let y = STEP; y < H; y += STEP) {
      for (let x = STEP; x < W; x += STEP) {
        let a = 0.13;
        let r = 1;
        const ds = Math.abs(x - sweep);
        if (ds < 120) a += 0.25 * (1 - ds / 120);
        if (mouse) {
          const d = Math.hypot(x - mouse.x, y - mouse.y);
          if (d < 150) {
            const k = 1 - d / 150;
            a += 0.55 * k;
            r += 1.4 * k;
          }
        }
        ctx.globalAlpha = Math.min(a, 0.85);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.283);
        ctx.fill();
      }
    }
    if (mouse) {
      const gx = Math.round(mouse.x / STEP) * STEP;
      const gy = Math.round(mouse.y / STEP) * STEP;
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = c;
      ctx.lineWidth = 1;
      ctx.strokeRect(gx - 36, gy - 36, 72, 72);
      ctx.globalAlpha = 0.75;
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.textBaseline = 'top';
      ctx.fillText('IN SCOPE?', gx - 36, gy + 42);
    }
    // Fade the grid out behind the headline so the text stays readable.
    ctx.globalAlpha = 1;
    const fade = ctx.createLinearGradient(0, 0, W, 0);
    const g = ground();
    fade.addColorStop(0, g);
    fade.addColorStop(0.55, g.replace('rgb(', 'rgba(').replace(')', ', 0.55)'));
    fade.addColorStop(1, g.replace('rgb(', 'rgba(').replace(')', ', 0)'));
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);
  };

  animate(canvas, { draw, onResize: () => ({ ctx, W, H } = fit(canvas)), stillAt: 0 });
}
