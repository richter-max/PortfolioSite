// Hero.jsx — Three-stage portrait morph
// Stage 1 (0–30%):  portrait-1 — clean chest-up head + name + countdown
// Stage 2 (40–65%): portrait-2 — laptop side-profile + "Building."
// Stage 3 (75–100%): portrait-3 — runner silhouette on topo + "Running."
// Background flips from dark → dark → cream for stage 3.
import { useEffect, useRef, useState } from 'react';

// Returns 0..1 opacity for a stage, given scroll progress.
// in/peak/out are the cross-fade keyframes per stage.
function stageOpacity(p, ranges) {
  const [a, b, c, d] = ranges; // fade-in start, fade-in end, fade-out start, fade-out end
  if (p <= a || p >= d) return 0;
  if (p < b) return (p - a) / (b - a);
  if (p < c) return 1;
  return 1 - (p - c) / (d - c);
}

export default function Hero() {
  const [mounted, setMounted]       = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [progress, setProgress]     = useState(0);
  const outerRef = useRef(null);

  // Loader timing
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 60);
    const t2 = setTimeout(() => setLoaderGone(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Scroll listener
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
      setProgress(scrolled / total);
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        compute();
        rafId = null;
      });
    }

    compute();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', compute);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Name char entrance
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

  // Stage opacity ranges  (fade-in start, in end, out start, out end)
  const op1 = stageOpacity(progress, [0.00, 0.05, 0.30, 0.42]);
  const op2 = stageOpacity(progress, [0.32, 0.44, 0.62, 0.74]);
  const op3 = stageOpacity(progress, [0.66, 0.78, 1.00, 1.10]);

  // Background fades from dark to cream for stage 3
  const creamMix = stageOpacity(progress, [0.66, 0.80, 1.00, 1.10]);
  const bgR = Math.round(5   + (243 - 5)   * creamMix);
  const bgG = Math.round(5   + (241 - 5)   * creamMix);
  const bgB = Math.round(6   + (236 - 6)   * creamMix);
  const bgColor = `rgb(${bgR}, ${bgG}, ${bgB})`;

  // Foreground text colors flip with bg
  const textColor = creamMix > 0.5
    ? `rgb(${Math.round(243 + (26  - 243) * creamMix)}, ${Math.round(241 + (26  - 241) * creamMix)}, ${Math.round(236 + (26  - 236) * creamMix)})`
    : '#F3F1EC';
  const subColor = creamMix > 0.5 ? 'rgba(26,26,26,0.6)' : '#A8A6A0';

  // Eyebrow per stage (active = highest opacity)
  const stage1Visible = op1;
  const stage2Visible = op2;
  const stage3Visible = op3;

  return (
    <>
      {!loaderGone && <HeroLoader mounted={mounted} />}

      <div
        id="top"
        ref={outerRef}
        style={{ position: 'relative', height: '300vh', width: '100%' }}
      >
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          background: bgColor,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 40px 80px',
          transition: 'background 200ms linear',
        }}>

          {/* Hero imagery temporarily removed — pending redesign. Stage
              opacity logic + bg-color flip is preserved so the eyebrow
              text + countdown still react to scroll progress. */}

          {/* Foreground */}
          <div style={{
            position: 'relative',
            zIndex: 5,
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
                color: textColor,
                margin: '0 0 36px',
                transition: 'color 200ms linear',
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
              minHeight: 100,
            }}>
              {/* Eyebrow stack — three states layered, opacity-driven */}
              <div style={{
                position: 'relative',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.22em',
                minHeight: 16,
                minWidth: 320,
              }}>
                <Eyebrow visible={stage1Visible} textColor={textColor} subColor={subColor}>
                  <span style={{ color: textColor }}>SECURITY ENGINEER</span>
                  <Divider color={subColor} />
                  <span style={{ color: subColor }}>ENDURANCE ATHLETE</span>
                </Eyebrow>
                <Eyebrow visible={stage2Visible} textColor={textColor} subColor={subColor}>
                  <span style={{ color: textColor }}>BUILDING.</span>
                  <Divider color={subColor} />
                  <span style={{ color: subColor }}>4 PROJECTS · 1 IN BETA</span>
                </Eyebrow>
                <Eyebrow visible={stage3Visible} textColor={textColor} subColor={subColor}>
                  <span style={{ color: textColor }}>RUNNING.</span>
                  <Divider color={subColor} />
                  <span style={{ color: subColor }}>TRAINING FOR KRAICHGAU</span>
                </Eyebrow>
              </div>

              {/* Countdown only in stage 1 */}
              <div style={{ opacity: stage1Visible, transition: 'opacity 100ms linear' }}>
                <KraichgauCountdown />
              </div>
            </div>
          </div>

        </div>
      </div>

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
      `}</style>
    </>
  );
}

function Eyebrow({ visible, children }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      opacity: visible,
      transform: `translateY(${(1 - visible) * 8}px)`,
      transition: 'opacity 100ms linear, transform 100ms linear',
      pointerEvents: visible > 0.5 ? 'auto' : 'none',
    }}>
      {children}
    </div>
  );
}

function Divider({ color }) {
  return (
    <span style={{
      width: 24, height: 1,
      background: color,
      opacity: 0.4,
      display: 'inline-block',
    }} />
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
