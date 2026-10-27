// reveal.js — plays a block's entrance once it scrolls into view.
// Without JS, or with reduced motion, the block is simply shown: the
// pending state is only set here, right before observing.

import { reduceMotion } from './motion.js';

if (!reduceMotion() && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        io.unobserve(el);
        // next frame, so the pending styles are painted before they change
        requestAnimationFrame(() => {
          el.classList.add('is-revealed');
          el.classList.remove('will-reveal');
        });
      }
    },
    { threshold: 0.25 },
  );
  for (const el of document.querySelectorAll('[data-reveal]')) {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.75) continue; // already on screen: show as is
    el.classList.add('will-reveal');
    io.observe(el);
  }
}
