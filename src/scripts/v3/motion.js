// motion.js — shared helpers for the canvas scenes.

export const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Size a canvas to its CSS box at device pixel ratio (max 2). */
export function fit(canvas) {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(r.width * dpr));
  canvas.height = Math.max(1, Math.round(r.height * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W: r.width, H: r.height };
}

/** Deterministic random numbers, so the scene looks the same on every load. */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Run `draw(seconds)` every frame while the canvas is on screen.
 * With reduced motion, draws one still frame at `stillAt` instead.
 * Redraws on resize after `onResize()`.
 */
export function animate(canvas, { draw, onResize, stillAt = 0 }) {
  let raf = 0;
  let visible = true;
  const t0 = performance.now();
  const still = reduceMotion();

  const loop = (now) => {
    draw((now - t0) / 1000);
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  const start = () => {
    if (still) draw(stillAt);
    else if (!raf) raf = requestAnimationFrame(loop);
  };

  onResize();
  start();
  canvas.classList.add('is-ready');

  let w = canvas.clientWidth;
  let h = canvas.clientHeight;
  new ResizeObserver(() => {
    // The observer also fires once on start; only rebuild on a real change.
    if (canvas.clientWidth === w && canvas.clientHeight === h) return;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    onResize();
    if (still) draw(stillAt);
  }).observe(canvas);

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start();
  }).observe(canvas);
}
