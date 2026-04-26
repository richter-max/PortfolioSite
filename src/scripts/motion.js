// motion.js — site-wide motion system
// Lenis smooth scroll + GSAP ScrollTrigger sync + reduce-motion guard
// Load this ONCE in BaseLayout, it sets up the whole document.

import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
  if (typeof window === 'undefined') return;

  // reduce-motion path: no Lenis, no ScrollTrigger-driven animations,
  // but we still let IntersectionObservers fire for simple fades.
  if (prefersReduced) {
    document.documentElement.dataset.reducedMotion = 'true';
    return;
  }

  // Tear down any existing instance before re-initialising (View Transitions).
  if (window.__lenis) {
    try { window.__lenis.destroy(); } catch {}
    window.__lenis = null;
  }
  if (window.__motionRaf) {
    cancelAnimationFrame(window.__motionRaf);
    window.__motionRaf = null;
  }

  // Lenis smooth scroll — tuned slow-ish for editorial feel
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Expose for debugging and for components that want to pause scroll (modals)
  window.__lenis = lenis;

  // Velocity tracker for velocity-blur effects
  let lastScroll = 0;
  let velocity = 0;
  let velTicker;
  const readVel = () => {
    const y = window.scrollY;
    const raw = y - lastScroll;
    velocity = velocity * 0.85 + raw * 0.15;
    lastScroll = y;
    document.documentElement.style.setProperty(
      '--scroll-vel',
      `${Math.min(20, Math.abs(velocity)).toFixed(2)}`
    );
    velTicker = requestAnimationFrame(readVel);
  };
  velTicker = requestAnimationFrame(readVel);
  window.__motionRaf = velTicker;

  // ── REVEAL PRIMITIVES ────────────────────────────────────────────────────

  // [data-reveal="fade-up"] — classic fade + translateY
  document.querySelectorAll('[data-reveal="fade-up"]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // [data-reveal="lines"] — line-by-line mask reveal (headlines)
  document.querySelectorAll('[data-reveal="lines"]').forEach(async (el) => {
    const { default: SplitType } = await import('split-type');
    const split = new SplitType(el, { types: 'lines', lineClass: '__line' });
    // Wrap each line in a mask div
    split.lines.forEach((line) => {
      const wrap = document.createElement('span');
      wrap.className = '__line-mask';
      wrap.style.display = 'block';
      wrap.style.overflow = 'hidden';
      wrap.style.paddingBottom = '0.08em';
      wrap.style.marginBottom = '-0.08em';
      line.parentNode.insertBefore(wrap, line);
      wrap.appendChild(line);
    });

    gsap.fromTo(
      split.lines,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.09,
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // [data-reveal="chars"] — character-by-character with tracking collapse
  document.querySelectorAll('[data-reveal="chars"]').forEach(async (el) => {
    const { default: SplitType } = await import('split-type');
    const split = new SplitType(el, { types: 'chars', charClass: '__char' });

    gsap.fromTo(
      split.chars,
      { opacity: 0, yPercent: 60, letterSpacing: '0.3em' },
      {
        opacity: 1,
        yPercent: 0,
        letterSpacing: '-0.04em',
        duration: 1.5,
        ease: 'expo.out',
        stagger: 0.018,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // [data-reveal="clip"] — image clip-path reveal (bottom → top)
  document.querySelectorAll('[data-reveal="clip"]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // [data-parallax="0.3"] — translateY parallax (relative to container)
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const depth = parseFloat(el.dataset.parallax) || 0.2;
    gsap.fromTo(
      el,
      { yPercent: -depth * 30 },
      {
        yPercent: depth * 30,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });

  // [data-count] — count-up numbers (respects formatting)
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.countDecimals || '0', 10);
    const suffix = el.dataset.countSuffix || '';
    const prefix = el.dataset.countPrefix || '';
    const obj = { n: 0 };
    gsap.to(obj, {
      n: target,
      duration: 2.2,
      ease: 'expo.out',
      onUpdate: () => {
        el.textContent = prefix + obj.n.toFixed(decimals) + suffix;
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // [data-stagger-children] — container that staggers its children in
  document.querySelectorAll('[data-stagger-children]').forEach((el) => {
    const children = el.children;
    gsap.fromTo(
      children,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // ── MAGNETIC BUTTONS ─────────────────────────────────────────────────────
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.3;
    let rx = 0, ry = 0;

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      rx = (e.clientX - cx) * strength;
      ry = (e.clientY - cy) * strength;
      gsap.to(el, { x: rx, y: ry, duration: 0.6, ease: 'expo.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // After images load, re-measure
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// Auto-init on DOM ready + after every Astro view transition.
// View Transitions swap the document body without firing DOMContentLoaded,
// so we re-bind motion on `astro:page-load` and tear down on `astro:before-swap`.
if (typeof window !== 'undefined') {
  // Take scroll restoration out of the browser's hands. With a smooth-scroll
  // wrapper (Lenis) in front of native scroll, the browser's "remember where
  // you were on reload" produces a half-scrolled, broken-feeling start.
  // We always start at the top — same as Stripe / Linear / Vercel.
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  // Belt-and-braces: some browsers still restore before this line runs.
  window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
  window.scrollTo(0, 0);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }

  document.addEventListener('astro:before-swap', () => {
    // Kill all ScrollTriggers so the next page starts clean.
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    }
  });

  // After the new DOM is in place but before page-load fires: hard-snap to
  // the top (or to the #hash target). View Transitions does not do this for
  // us, and Lenis's internal scroll position would otherwise carry over.
  document.addEventListener('astro:after-swap', () => {
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) {
      document.querySelector(hash).scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
  });

  document.addEventListener('astro:page-load', () => {
    initMotion();
    // Lenis was just (re)created in initMotion — sync it to the real scroll
    // position so it doesn't animate from the old page's offset.
    if (window.__lenis) {
      try { window.__lenis.scrollTo(window.scrollY, { immediate: true, force: true }); } catch {}
    }
  });
}
