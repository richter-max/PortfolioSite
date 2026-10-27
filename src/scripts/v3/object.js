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
