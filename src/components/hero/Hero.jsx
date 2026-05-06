// Hero.jsx — Editorial 100vh hero.
// Full-bleed portrait/landscape photograph with an oversized name,
// positioning eyebrow, Kraichgau race countdown, and a LAST RUN
// indicator pulled from live Strava data. Replaces the previous
// 3-stage 300vh sticky progression — the wide-empty-field aesthetic
// reads stronger as a single viewport than as a scroll-driven
// sequence with no imagery. The race countdown and last-run line
// migrated as-is.
import { useEffect, useRef, useState } from 'react';

const LOADER_OUT_AT = 1600;
const LOADER_DESTROY_AT = 2200;

export default function Hero({ lastRun = null }) {
  const [mounted, setMounted]       = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const heroRef = useRef(null);
  const bgRef   = useRef(null);

  // ── Loader timing ────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 60);
    const t2 = setTimeout(() => setLoaderGone(true), LOADER_DESTROY_AT);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Subtle parallax on the background photo ─────────────────────
  // Only ever shifts within the bottom half of the bg, so even at
  // peak scroll the image fully covers. Disabled when the user
  // requested reduced motion.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (heroRef.current && bgRef.current) {
          const r = heroRef.current.getBoundingClientRect();
          // 0 when hero top is at viewport top, ramps as user scrolls past.
          const t = Math.max(0, Math.min(1, -r.top / window.innerHeight));
          bgRef.current.style.transform = `translate3d(0, ${(t * 12).toFixed(2)}vh, 0) scale(1.06)`;
        }
        raf = null;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Name char entrance — staggered drop-in ──────────────────────
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    async function initChars() {
      const { gsap } = await import('gsap');
      if (cancelled) return;

      const nameEl = document.querySelector('[data-hero-name]');
      if (!nameEl || nameEl.dataset.split) return;
      nameEl.dataset.split = 'true';

      const text = nameEl.textContent || '';
      // Wrap each character in a span with overflow:hidden parent so
      // the chars enter from below their own line-box, not from the
      // element top — gives a more refined "type setting" reveal.
      nameEl.innerHTML = text.split('').map((c) => {
        if (c === ' ') return '<span class="hero-name__space">&nbsp;</span>';
        return `<span class="hero-name__cell"><span class="hero-name__char">${c}</span></span>`;
      }).join('');

      const chars = nameEl.querySelectorAll('.hero-name__char');
      gsap.set(chars, { yPercent: 110, opacity: 0 });
      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'expo.out',
        stagger: { each: 0.022 },
        delay: LOADER_OUT_AT / 1000 + 0.2,
      });
    }

    const t = setTimeout(initChars, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [mounted]);

  return (
    <>
      {!loaderGone && <HeroLoader />}

      <section ref={heroRef} className="hero" id="top">

        {/* ── Background photograph with parallax wrapper ────────── */}
        <div className="hero__bg" ref={bgRef}>
          <picture>
            <source
              type="image/avif"
              srcSet="/img/opt/hero-path-640.avif 640w, /img/opt/hero-path-1280.avif 1280w, /img/opt/hero-path-1920.avif 1920w, /img/opt/hero-path-2560.avif 2560w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/img/opt/hero-path-640.webp 640w, /img/opt/hero-path-1280.webp 1280w, /img/opt/hero-path-1920.webp 1920w, /img/opt/hero-path-2560.webp 2560w"
              sizes="100vw"
            />
            <img
              src="/img/opt/hero-path-1920.jpg"
              srcSet="/img/opt/hero-path-640.jpg 640w, /img/opt/hero-path-1280.jpg 1280w, /img/opt/hero-path-1920.jpg 1920w, /img/opt/hero-path-2560.jpg 2560w"
              sizes="100vw"
              alt=""
              fetchpriority="high"
              decoding="async"
              loading="eager"
            />
          </picture>
          <div className="hero__veil" aria-hidden="true"></div>
        </div>

        {/* ── Top-edge meta row ─────────────────────────────────── */}
        <div className="hero__top">
          <div className="hero__crumb">
            <span>2026 · ALLGÄU</span>
            <span className="hero__crumb__sep">·</span>
            <span>SOLO PRACTICE</span>
          </div>
          <div className="hero__avail">
            <span className="hero__avail__dot"></span>
            <span>OPEN — NEW PROJECTS</span>
          </div>
        </div>

        {/* ── Foreground content ──────────────────────────────────── */}
        <div className="hero__fg">
          <h1 className="hero-name" data-hero-name>Maximilian Richter</h1>

          <div className="hero__row">
            <div className="hero__title">
              <span className="hero__title__role">SECURITY&nbsp;ENGINEER</span>
              <span className="hero__title__sep" aria-hidden="true"></span>
              <span className="hero__title__role hero__title__role--warm">ENDURANCE&nbsp;ATHLETE</span>
            </div>

            <KraichgauCountdown lastRun={lastRun} />
          </div>
        </div>

        {/* ── Scroll cue ────────────────────────────────────────── */}
        <a className="hero__cue" href="#work" aria-label="Scroll to work">
          <span className="hero__cue__txt">SCROLL</span>
          <span className="hero__cue__line"></span>
        </a>
      </section>

      <style>{`
        @keyframes loaderLineGrow {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes loaderLineCollapse {
          0%   { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(0); opacity: 0; }
        }
        @keyframes loaderTextFade {
          0%   { opacity: 0; letter-spacing: 0.45em; }
          100% { opacity: 1; letter-spacing: 0.2em; }
        }
        @keyframes heroAvailPulse {
          0%, 100% { opacity: 1;   transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.7); }
        }

        /* ── Hero frame ──────────────────────────────────────────── */
        .hero {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 640px;
          overflow: hidden;
          background: #050506;
          color: #f3f1ec;
          isolation: isolate;
        }
        .hero__bg {
          position: absolute;
          inset: -3vh -3vw;
          z-index: 0;
          will-change: transform;
        }
        .hero__bg picture, .hero__bg img {
          width: 100%;
          height: 100%;
          display: block;
        }
        .hero__bg img {
          object-fit: cover;
          object-position: center 40%;
          filter: saturate(0.78) contrast(1.04);
        }
        .hero__veil {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(5,5,6,0.32) 0%, rgba(5,5,6,0.08) 30%, rgba(5,5,6,0.45) 70%, rgba(5,5,6,0.92) 100%),
            radial-gradient(ellipse at 80% 30%, rgba(232,181,87,0.12), transparent 55%);
          mix-blend-mode: normal;
        }

        /* ── Top meta row ────────────────────────────────────────── */
        .hero__top {
          position: absolute;
          top: 96px;
          left: 0;
          right: 0;
          z-index: 3;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'JetBrains Mono Variable', monospace;
          font-size: 11px;
          letter-spacing: 0.22em;
          color: rgba(243, 241, 236, 0.85);
        }
        .hero__crumb {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .hero__crumb__sep { color: rgba(243, 241, 236, 0.35); }
        .hero__avail {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .hero__avail__dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
          animation: heroAvailPulse 2.4s ease-in-out infinite;
        }

        /* ── Foreground content ─────────────────────────────────── */
        .hero__fg {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 96px;
          z-index: 2;
          padding: 0 40px;
          max-width: 1440px;
          margin: 0 auto;
        }
        .hero-name {
          display: block;
          font-family: 'Inter Tight Variable', 'Inter Tight', sans-serif;
          font-weight: 600;
          font-size: clamp(56px, 11vw, 184px);
          line-height: 0.88;
          letter-spacing: -0.045em;
          color: #f3f1ec;
          margin: 0 0 48px;
          text-shadow: 0 1px 32px rgba(5, 5, 6, 0.5);
        }
        .hero-name__cell {
          display: inline-block;
          overflow: hidden;
          line-height: inherit;
          padding-bottom: 0.06em;
          margin-bottom: -0.06em;
        }
        .hero-name__char {
          display: inline-block;
          will-change: transform, opacity;
        }
        .hero-name__space {
          display: inline-block;
          width: 0.18em;
        }

        .hero__row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 64px;
          align-items: end;
          flex-wrap: wrap;
        }

        .hero__title {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-family: 'JetBrains Mono Variable', monospace;
          font-size: 12px;
          letter-spacing: 0.24em;
          flex-wrap: wrap;
        }
        .hero__title__role {
          color: #f3f1ec;
          text-shadow: 0 1px 18px rgba(5, 5, 6, 0.5);
        }
        .hero__title__role--warm { color: #e8b557; }
        .hero__title__sep {
          width: 28px;
          height: 1px;
          background: rgba(243, 241, 236, 0.35);
          display: inline-block;
        }

        /* ── Countdown — preserved layout, refined typography ───── */
        .kg {
          text-align: right;
          font-family: 'Inter Tight Variable', 'Inter Tight', sans-serif;
          color: #f3f1ec;
        }
        .kg__head {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: flex-end;
          font-family: 'JetBrains Mono Variable', monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(243, 241, 236, 0.85);
          margin-bottom: 12px;
        }
        .kg__head__sq {
          width: 6px;
          height: 6px;
          background: #2e6bff;
          display: inline-block;
        }
        .kg__cells {
          display: flex;
          justify-content: flex-end;
          gap: 24px;
        }
        .kg__cell {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .kg__num {
          font-weight: 300;
          font-size: clamp(28px, 3vw, 40px);
          line-height: 1;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 1px 18px rgba(5, 5, 6, 0.5);
        }
        .kg__lbl {
          font-family: 'JetBrains Mono Variable', monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          color: rgba(243, 241, 236, 0.55);
          text-transform: uppercase;
        }
        .kg__date {
          font-family: 'JetBrains Mono Variable', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          color: rgba(243, 241, 236, 0.55);
          margin-top: 12px;
        }
        .kg__last {
          margin-top: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: flex-end;
          font-family: 'JetBrains Mono Variable', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
        }
        .kg__last__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34,197,94,0.7);
        }
        .kg__last__k { color: rgba(243, 241, 236, 0.65); }
        .kg__last__sep { color: rgba(243, 241, 236, 0.2); }
        .kg__last__v { color: #f3f1ec; }

        /* ── Scroll cue ─────────────────────────────────────────── */
        .hero__cue {
          position: absolute;
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%);
          z-index: 3;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-family: 'JetBrains Mono Variable', monospace;
          font-size: 9px;
          letter-spacing: 0.3em;
          color: rgba(243, 241, 236, 0.6);
          text-decoration: none;
          opacity: 0;
          animation: loaderTextFade 800ms cubic-bezier(.22,1,.36,1) ${LOADER_OUT_AT + 600}ms forwards;
        }
        .hero__cue__line {
          width: 1px;
          height: 32px;
          background: linear-gradient(to bottom, rgba(243, 241, 236, 0.6), transparent);
          position: relative;
          overflow: hidden;
        }
        .hero__cue__line::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: -100%;
          height: 50%;
          background: linear-gradient(to bottom, transparent, #f3f1ec);
          animation: heroCueRun 2.6s cubic-bezier(.22,1,.36,1) infinite;
        }
        @keyframes heroCueRun {
          0%   { top: -50%; opacity: 0; }
          25%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* ── Responsive ─────────────────────────────────────────── */
        @media (max-width: 900px) {
          .hero { min-height: 560px; }
          .hero__top { top: 80px; padding: 0 16px; flex-wrap: wrap; gap: 12px; }
          .hero__fg  { bottom: 64px; padding: 0 16px; }
          .hero-name { margin-bottom: 32px; }
          .hero__row { grid-template-columns: 1fr; gap: 24px; }
          .kg { text-align: left; }
          .kg__head, .kg__cells, .kg__last { justify-content: flex-start; }
          .kg__cell { align-items: flex-start; }
          .hero__cue { bottom: 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero__bg { transform: none !important; }
          .hero__cue { opacity: 1; animation: none; }
          .hero__cue__line::after { animation: none; }
          .hero__avail__dot { animation: none; }
        }
      `}</style>
    </>
  );
}

function KraichgauCountdown({ lastRun = null }) {
  const target = new Date('2026-05-31T07:00:00+02:00').getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const delta = Math.max(0, target - now);
  const d = Math.floor(delta / 86400000);
  const h = Math.floor((delta % 86400000) / 3600000);
  const m = Math.floor((delta % 3600000) / 60000);
  const s = Math.floor((delta % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="kg">
      <div className="kg__head">
        <span className="kg__head__sq" aria-hidden="true"></span>
        IRONMAN 70.3 · KRAICHGAU
      </div>
      <div className="kg__cells">
        <div className="kg__cell"><div className="kg__num">{d}</div><div className="kg__lbl">DAYS</div></div>
        <div className="kg__cell"><div className="kg__num">{pad(h)}</div><div className="kg__lbl">HRS</div></div>
        <div className="kg__cell"><div className="kg__num">{pad(m)}</div><div className="kg__lbl">MIN</div></div>
        <div className="kg__cell"><div className="kg__num">{pad(s)}</div><div className="kg__lbl">SEC</div></div>
      </div>
      <div className="kg__date">31 MAY 2026 · 07:00 CET</div>

      {lastRun && (
        <div className="kg__last">
          <span className="kg__last__dot" aria-hidden="true"></span>
          <span className="kg__last__k">LAST RUN</span>
          <span className="kg__last__sep">·</span>
          <span className="kg__last__v">{lastRun.weekday.toUpperCase()}</span>
          <span className="kg__last__sep">·</span>
          <span className="kg__last__v">{lastRun.km} KM</span>
        </div>
      )}
    </div>
  );
}

function HeroLoader() {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setExiting(true), LOADER_OUT_AT);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#050506',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: exiting ? 0 : 1,
      pointerEvents: exiting ? 'none' : 'auto',
      transition: 'opacity 600ms cubic-bezier(.22,1,.36,1)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{
          width: 240, height: 1, background: '#F3F1EC',
          transformOrigin: 'left center',
          animation: exiting
            ? 'loaderLineCollapse 600ms cubic-bezier(.22,1,.36,1) forwards'
            : 'loaderLineGrow 1000ms cubic-bezier(.22,1,.36,1) forwards',
        }} />
        <div style={{
          fontFamily: 'JetBrains Mono Variable, monospace',
          fontSize: 10, letterSpacing: '0.2em', color: '#A8A6A0',
          opacity: 0,
          animation: 'loaderTextFade 800ms cubic-bezier(.22,1,.36,1) 400ms forwards',
        }}>
          MAXIMILIAN RICHTER
        </div>
      </div>
    </div>
  );
}
