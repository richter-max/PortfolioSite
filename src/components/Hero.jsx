// Hero.jsx — React island: loader + ken-burns + live countdown
import { useEffect, useState } from 'react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 60);
    const t2 = setTimeout(() => setLoaderGone(true), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <>
      {!loaderGone && <HeroLoader mounted={mounted} />}

      <section id="top" style={{
        position: 'relative', minHeight: '100vh', width: '100%',
        background: '#050506',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 40px 96px',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("/img/fjord-night.jpg")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'saturate(0.55) brightness(0.72) contrast(1.05)',
          animation: 'heroKenBurns 48s ease-in-out infinite alternate',
        }} />

        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              position: 'absolute',
              top: `${15 + i * 18}%`,
              left: '-30%',
              width: '55%',
              height: '35%',
              background: 'radial-gradient(ellipse at center, rgba(230,235,240,0.08) 0%, transparent 60%)',
              filter: 'blur(30px)',
              mixBlendMode: 'screen',
              animation: `heroFogDrift ${60 + i * 12}s linear infinite`,
              animationDelay: `${-i * 14}s`,
            }} />
          ))}
        </div>

        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04, mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '30%',
          background: 'linear-gradient(to top, transparent 0%, rgba(5,5,6,0.65) 100%)',
          pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '80%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(5,5,6,0.7) 55%, #050506 100%)',
          pointerEvents: 'none' }} />

        <div style={{
          position: 'relative', maxWidth: 1440, width: '100%', margin: '0 auto',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 1200ms cubic-bezier(.22,1,.36,1) 1600ms, transform 1200ms cubic-bezier(.22,1,.36,1) 1600ms',
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.2em',
            color: '#A8A6A0', marginBottom: 32,
          }}>
            <span style={{ color: '#F3F1EC' }}>MAXIMILIAN RICHTER</span> &nbsp;/&nbsp; SECURITY ENGINEER · ENDURANCE ATHLETE
          </div>

          <h1 style={{
            fontFamily: 'Inter Tight, sans-serif', fontWeight: 500,
            fontSize: 'clamp(64px, 11vw, 180px)', lineHeight: 0.95, letterSpacing: '-0.04em',
            color: '#F3F1EC', margin: 0, maxWidth: '14ch',
          }}>
            Built under<br/>pressure.
          </h1>

          <div style={{
            marginTop: 56, display: 'flex', gap: 48, alignItems: 'flex-end',
            justifyContent: 'space-between', flexWrap: 'wrap',
          }}>
            <p style={{
              fontFamily: 'Inter Tight, sans-serif', fontSize: 17, lineHeight: 1.55,
              color: '#D9D7D2', maxWidth: '42ch', margin: 0, letterSpacing: '-0.005em',
            }}>
              Systems that perform when they cannot fail. Hardened against adversaries. Tested in the cold.
            </p>
            <KraichgauCountdown />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes heroKenBurns {
          0%   { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.06) translate(-1.5%, -1%); }
        }
        @keyframes heroFogDrift {
          0%   { transform: translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(260%); opacity: 0; }
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

function HeroLoader({ mounted }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#050506',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: exiting ? 0 : 1,
      pointerEvents: exiting ? 'none' : 'auto',
      transition: 'opacity 700ms cubic-bezier(.22,1,.36,1)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{
          width: 280, height: 1, background: '#F3F1EC',
          transformOrigin: 'left center',
          animation: exiting
            ? 'loaderLineCollapse 700ms cubic-bezier(.22,1,.36,1) forwards'
            : 'loaderLineGrow 1100ms cubic-bezier(.22,1,.36,1) forwards',
        }} />
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em',
          color: '#A8A6A0',
          opacity: 0,
          animation: mounted
            ? 'loaderTextFade 1000ms cubic-bezier(.22,1,.36,1) 500ms forwards'
            : 'none',
        }}>
          MAXIMILIAN RICHTER
        </div>
      </div>
    </div>
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

  const cell = {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4,
  };
  const num = {
    fontFamily: 'Inter Tight, sans-serif', fontWeight: 300,
    fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1, letterSpacing: '-0.03em',
    color: '#F3F1EC', fontVariantNumeric: 'tabular-nums',
  };
  const lbl = {
    fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: '#6B6965',
  };

  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.22em',
        color: '#A8A6A0', marginBottom: 14, display: 'flex', alignItems: 'center',
        gap: 10, justifyContent: 'flex-end',
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
      }}>
        31 MAY 2026 · 07:00 CET
      </div>
    </div>
  );
}
