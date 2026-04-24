// Hero.jsx — bulletproof crossfade version
// Architecture:
//   outer (relative, 200vh)
//     └─ sticky inner (top: 0, 100vh, overflow hidden)
//          ├─ laptop img (absolute, always opacity 1)
//          ├─ race img (absolute, opacity driven by scroll)
//          ├─ gradients
//          └─ content (relative z-index 2)
//
// Scroll tracking: native window scroll listener, running on [mounted]
// to guarantee outerRef.current exists.
import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  const [mounted, setMounted]       = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [raceOpacity, setRaceOpacity] = useState(0);
  const [debug, setDebug]             = useState({ top: 0, progress: 0 });
  const outerRef = useRef(null);

  // Loader timing
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 60);
    const t2 = setTimeout(() => setLoaderGone(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Scroll listener — uses window scroll position, not the ref's rect,
  // so it works even if the ref is briefly null during hydration.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId = null;

    function compute() {
      const outer = outerRef.current;
      if (!outer) return;

      const rect   = outer.getBoundingClientRect();
      const height = outer.offsetHeight;
      const vh     = window.innerHeight;
      const total  = height - vh;

      if (total <= 0) return;

      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = scrolled / total;

      // Race fades in 0.2 → 0.75
      const opacity = progress < 0.2
        ? 0
        : progress > 0.75
          ? 1
          : (progress - 0.2) / 0.55;

      setRaceOpacity(opacity);
      setDebug({ top: Math.round(rect.top), progress: Number(progress.toFixed(3)) });
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        compute();
        rafId = null;
      });
    }

    // Initial computation after mount (ref is now attached)
    compute();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', compute);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Name entrance
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
      nameEl.innerHTML = text.split('').map(c =>
        c === ' '
          ? '<span style="display:inline-block;width:0.25em">&nbsp;</span>'
          : '<span style="display:inline-block;will-change:transform,opacity">' + c + '</span>'
      ).join('');

      const chars = nameEl.querySelectorAll('span');
      gsap.set(chars, { y: -40, opacity: 0 });
      gsap.to(chars, {
        y: 0, opacity: 1,
        duration: 0.9,
        ease: 'expo.out',
        stagger: { each: 0.022 },
        delay: 1.7,
      });
    }

    const t = setTimeout(initChars, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [mounted]);

  // Toggle this to see live debug overlay
  const SHOW_DEBUG = false;

  return (
    <>
      {!loaderGone && <HeroLoader mounted={mounted} />}

      <div
        id="top"
        ref={outerRef}
        style={{ position: 'relative', height: '200vh', width: '100%' }}
      >
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          background: '#050506',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 40px 80px',
        }}>

          {/* Laptop photo — blurs + scales down as race takes over */}
          <div style={{
            position: 'absolute',
            top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
            backgroundImage: 'url("/img/laptophero.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            filter: `saturate(0.5) brightness(0.65) contrast(1.05) blur(${raceOpacity * 12}px)`,
            transform: `scale(${1 - raceOpacity * 0.06})`,
            transformOrigin: 'center center',
            willChange: 'filter, transform',
            zIndex: 0,
          }} />

          {/* Race photo — starts blurred + zoomed, comes into focus as it fades in */}
          <div style={{
            position: 'absolute',
            top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
            backgroundImage: 'url("/img/halbmarathon.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            filter: `saturate(0.55) brightness(0.6) contrast(1.08) blur(${(1 - raceOpacity) * 16}px)`,
            transform: `scale(${1.08 - raceOpacity * 0.08})`,
            transformOrigin: 'center center',
            opacity: raceOpacity,
            willChange: 'filter, transform, opacity',
            zIndex: 1,
          }} />

          {/* Gradient overlays */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(to top, #050506 0%, rgba(5,5,6,0.55) 45%, transparent 100%)',
            zIndex: 2,
          }} />
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(5,5,6,0.45) 0%, transparent 30%)',
            zIndex: 2,
          }} />

          {/* DEBUG overlay — remove once working */}
          {SHOW_DEBUG && (
            <div style={{
              position: 'absolute', top: 20, left: 20,
              fontFamily: 'monospace', fontSize: 11,
              color: '#00ff88',
              background: 'rgba(0,0,0,0.75)',
              padding: '8px 12px',
              borderRadius: 4,
              zIndex: 100,
              lineHeight: 1.5,
            }}>
              rect.top: {debug.top}px<br/>
              progress: {debug.progress}<br/>
              raceOpacity: {raceOpacity.toFixed(3)}
            </div>
          )}

          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 800ms ease 1500ms',
          }}>
            <h1
              data-hero-name
              style={{
                fontFamily: 'Inter Tight, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(52px, 9.5vw, 152px)',
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                color: '#F3F1EC',
                margin: '0 0 36px',
              }}
            >
              Maximilian Richter
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 32,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.22em',
                color: '#A8A6A0',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <span style={{ color: '#F3F1EC' }}>SECURITY ENGINEER</span>
                <span style={{
                  width: 24, height: 1,
                  background: 'rgba(243,241,236,0.2)',
                  display: 'inline-block',
                }} />
                <span>ENDURANCE ATHLETE</span>
              </div>
              <KraichgauCountdown />
            </div>
          </div>

          {/* Scroll cue */}
          <div style={{
            position: 'absolute',
            bottom: 40, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 12,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9, letterSpacing: '0.3em',
            color: '#A8A6A0', pointerEvents: 'none',
            opacity: mounted ? (raceOpacity > 0.5 ? 0 : 0.7) : 0,
            transition: 'opacity 600ms ease',
            zIndex: 3,
          }}>
            <span>SCROLL</span>
            <span style={{
              width: 1, height: 40,
              background: 'linear-gradient(to bottom, #F3F1EC, transparent)',
              animation: 'heroScrollCue 2400ms cubic-bezier(.22,1,.36,1) infinite',
              transformOrigin: 'top',
            }} />
          </div>

        </div>
      </div>

      <style>{`
        @keyframes heroScrollCue {
          0%   { transform: scaleY(0); transform-origin: top; }
          50%  { transform: scaleY(1); transform-origin: top; }
          51%  { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
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
      `}</style>
    </>
  );
}

function KraichgauCountdown() {
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

  const cell = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 };
  const num = {
    fontFamily: 'Inter Tight, sans-serif', fontWeight: 300,
    fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1, letterSpacing: '-0.03em',
    color: '#F3F1EC', fontVariantNumeric: 'tabular-nums',
  };
  const lbl = {
    fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
    letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B6965',
  };

  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.22em',
        color: '#A8A6A0', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end',
      }}>
        <span style={{ width: 6, height: 6, background: '#2E6BFF', display: 'inline-block' }} />
        IRONMAN 70.3 · KRAICHGAU
      </div>
      <div style={{ display: 'flex', gap: 28, justifyContent: 'flex-end' }}>
        <div style={cell}><div style={num}>{d}</div><div style={lbl}>DAYS</div></div>
        <div style={cell}><div style={num}>{pad(h)}</div><div style={lbl}>HRS</div></div>
        <div style={cell}><div style={num}>{pad(m)}</div><div style={lbl}>MIN</div></div>
        <div style={cell}><div style={num}>{pad(s)}</div><div style={lbl}>SEC</div></div>
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em',
        color: '#6B6965', marginTop: 12,
      }}>31 MAY 2026 · 07:00 CET</div>
    </div>
  );
}

function HeroLoader({ mounted }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 1600);
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
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: '0.2em', color: '#A8A6A0',
          opacity: 0,
          animation: mounted
            ? 'loaderTextFade 800ms cubic-bezier(.22,1,.36,1) 400ms forwards'
            : 'none',
        }}>
          MAXIMILIAN RICHTER
        </div>
      </div>
    </div>
  );
}
