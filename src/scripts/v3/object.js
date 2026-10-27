// object.js — the signature objects (race bib, ID badge).
// [data-tilt] follows the pointer a little; [data-flip] turns around on
// click and keyboard (it is a real <button>). Reduced motion: no tilt,
// the flip still works but without the animation (handled in CSS).

import { reduceMotion } from './motion.js';

for (const scene of document.querySelectorAll('[data-tilt]')) {
  const inner = scene.querySelector('[data-tilt-target]');
  if (!inner || reduceMotion()) continue;
  const max = Number(scene.dataset.tilt) || 14;
  scene.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = scene.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    inner.style.transform = `rotateX(${(-y * max).toFixed(1)}deg) rotateY(${(x * max * 1.4).toFixed(1)}deg)`;
  });
  scene.addEventListener('pointerleave', () => (inner.style.transform = ''));
}

for (const btn of document.querySelectorAll('[data-flip]')) {
  btn.addEventListener('click', () => {
    const back = btn.classList.toggle('is-back');
    const label = btn.querySelector('[data-flip-label]');
    if (label) label.textContent = back ? btn.dataset.labelBack : btn.dataset.labelFront;
  });
}

// Phones: the bib flutters a little with scroll speed, like a bib in the
// wind while running. Settles back when scrolling stops.
if (!reduceMotion() && window.matchMedia('(pointer: coarse)').matches) {
  const bibs = [...document.querySelectorAll('.bibscene [data-tilt-target]')];
  if (bibs.length) {
    let lastY = window.scrollY;
    let lastT = performance.now();
    let v = 0;
    let raf = 0;
    const settle = () => {
      v *= 0.9;
      const a = Math.max(-6, Math.min(6, v * 3));
      for (const b of bibs) b.style.transform = `skewX(${a.toFixed(2)}deg) rotate(${(a / 2).toFixed(2)}deg)`;
      raf = Math.abs(v) > 0.01 ? requestAnimationFrame(settle) : 0;
    };
    window.addEventListener(
      'scroll',
      () => {
        const now = performance.now();
        const dy = window.scrollY - lastY;
        v = dy / Math.max(16, now - lastT);
        lastY = window.scrollY;
        lastT = now;
        if (!raf) raf = requestAnimationFrame(settle);
      },
      { passive: true },
    );
  }
}
