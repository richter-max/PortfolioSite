// FieldTape.jsx — React island: pinned horizontal scroll through endurance chapters
// Upgrades vs original:
//   - Card entrance: each panel fades + slides in as it scrolls into view
//   - Progress bars: fill on card enter, show training progress
//   - Velocity blur: retained from original
//   - All existing layout, images, stats: unchanged
import { useEffect, useRef, useState } from 'react';

export default function FieldTape({ entries }) {
  const pinRef   = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress]     = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const velRef     = useRef(0);
  const lastProgRef = useRef(0);

  useEffect(() => {
    const pin = pinRef.current; if (!pin) return;
    let raf;

    const onScroll = () => {
      const rect  = pin.getBoundingClientRect();
      const vh    = window.innerHeight;
      const total = pin.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;

      setProgress(p);

      // Active card index — used to trigger progress bar fill
      const idx = Math.min(
        Math.floor(p * entries.length),
        entries.length - 1
      );
      setActiveIndex(idx);

      const v = Math.abs(p - lastProgRef.current);
      velRef.current = velRef.current * 0.8 + v * 300;
      lastProgRef.current = p;

      if (trackRef.current) {
        const maxShift = trackRef.current.scrollWidth - window.innerWidth;
        trackRef.current.style.transform = `translateX(${-p * maxShift}px)`;
        const blur = Math.min(8, velRef.current * 0.4);
        trackRef.current.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : '';
      }
    };

    const tick = () => { onScroll(); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [entries.length]);

  return (
    <section id="field" style={{ borderTop: '1px solid rgba(243,241,236,0.08)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '128px 40px 64px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.2em',
          color: '#6B6965', marginBottom: 40, display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <span style={{ color: '#F3F1EC' }}>02</span>
          <span style={{ width: 32, height: 1, background: 'rgba(243,241,236,0.16)' }} />
          <span style={{ color: '#F3F1EC' }}>FIELD</span>
        </div>
        <h2 style={{
          fontFamily: 'Inter Tight, sans-serif', fontWeight: 500,
          fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.98, letterSpacing: '-0.04em',
          color: '#F3F1EC', margin: 0, maxWidth: '14ch',
        }} data-reveal="lines">Endurance.</h2>
        <p data-reveal="fade-up" style={{
          fontFamily: 'Inter Tight, sans-serif', fontSize: 19, lineHeight: 1.5,
          color: '#A8A6A0', maxWidth: '52ch', marginTop: 32, letterSpacing: '-0.005em',
        }}>Triathlon, marathon, table tennis. Selected races and ongoing training.</p>
      </div>

      <div ref={pinRef} style={{ height: `${entries.length * 100}vh`, position: 'relative' }}>
        <div style={{
          position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
          background: '#050506',
        }}>
          {/* ── Progress rail ── */}
          <div style={{
            position: 'absolute', top: 40, left: 40, right: 40, height: 1,
            background: 'rgba(243,241,236,0.1)', zIndex: 5,
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: 1,
              width: `${progress * 100}%`, background: '#2E6BFF',
              transition: 'width 120ms linear',
            }} />
            <div style={{
              position: 'absolute', left: 0, top: -4, height: 9, width: 1,
              background: 'rgba(243,241,236,0.3)',
            }} />
            {entries.map((_, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${((i + 1) / entries.length) * 100}%`,
                top: -4, height: 9, width: 1,
                background: 'rgba(243,241,236,0.2)',
              }} />
            ))}
            <div style={{
              position: 'absolute', right: 0, top: -18,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              letterSpacing: '0.22em', color: '#A8A6A0',
            }}>
              {String(Math.min(entries.length, Math.floor(progress * entries.length) + 1)).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}
            </div>
          </div>

          {/* ── Scrolling track ── */}
          <div ref={trackRef} style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            display: 'flex', willChange: 'transform',
          }}>
            {entries.map((e, i) => (
              <FieldPanel
                key={i}
                {...e}
                panelIndex={i}
                activeIndex={activeIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Progress fill percentages per entry id — adjust to taste
const PROGRESS_FILLS = {
  'ironman-kraichgau': '62%',
  'berlin-marathon':   '45%',
  'table-tennis':      '78%',
};

// Fallback by position if no id matches
const PROGRESS_BY_INDEX = ['62%', '45%', '78%'];

function FieldPanel({
  index, title, location, date, stats = [], conditions,
  image, imagePosition = 'center 35%',
  panelIndex, activeIndex,
}) {
  const isActive  = panelIndex <= activeIndex;
  const isEntering = panelIndex === activeIndex;

  const progressFill = PROGRESS_BY_INDEX[panelIndex] ?? '50%';

  return (
    <article style={{
      width: '100vw', height: '100vh', flex: '0 0 100vw',
      position: 'relative', overflow: 'hidden',
      // Card entrance: panel slides in from right as it becomes active
      opacity:    isActive ? 1 : 0,
      transform:  isActive ? 'translateX(0)' : 'translateX(32px)',
      transition: 'opacity 700ms cubic-bezier(.22,1,.36,1), transform 700ms cubic-bezier(.22,1,.36,1)',
    }}>
      {image && (
        <>
          <div data-field-parallax style={{
            position: 'absolute', inset: '-8% -4%',
            backgroundImage: `url("${image}")`,
            backgroundSize: 'cover', backgroundPosition: imagePosition,
            filter: 'saturate(0.45) brightness(0.55) contrast(1.05)',
            willChange: 'transform',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(5,5,6,0.45) 0%, rgba(5,5,6,0.25) 35%, rgba(5,5,6,0.9) 100%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay',
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
            pointerEvents: 'none',
          }} />
        </>
      )}

      <div style={{
        position: 'absolute', inset: 0, padding: '140px 80px 80px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* Top: index + location */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.22em',
          color: '#A8A6A0', display: 'flex', alignItems: 'center', gap: 16,
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 600ms cubic-bezier(.22,1,.36,1) 100ms, transform 600ms cubic-bezier(.22,1,.36,1) 100ms',
        }}>
          <span style={{ color: '#F3F1EC' }}>{index}</span>
          <span style={{ width: 32, height: 1, background: 'rgba(243,241,236,0.16)' }} />
          <span>{location}</span>
          <span>·</span>
          <span>{date}</span>
        </div>

        {/* Bottom: title + stats */}
        <div style={{
          maxWidth: 1440, margin: '0 auto', width: '100%',
          display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'end',
        }}>
          <div>
            <h3 style={{
              fontFamily: 'Inter Tight, sans-serif', fontWeight: 500,
              fontSize: 'clamp(56px, 8vw, 128px)', lineHeight: 0.95, letterSpacing: '-0.04em',
              color: '#F3F1EC', margin: 0, maxWidth: '14ch',
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 700ms cubic-bezier(.22,1,.36,1) 150ms, transform 700ms cubic-bezier(.22,1,.36,1) 150ms',
            }}>{title}</h3>

            <p style={{
              fontFamily: 'Inter Tight, sans-serif', fontSize: 17, lineHeight: 1.55,
              color: '#D9D7D2', margin: 0, marginTop: 32, maxWidth: '50ch',
              letterSpacing: '-0.005em',
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 700ms cubic-bezier(.22,1,.36,1) 250ms, transform 700ms cubic-bezier(.22,1,.36,1) 250ms',
            }}>{conditions}</p>

            {/* ── Progress bar ── */}
            <div style={{
              marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10,
              opacity: isActive ? 1 : 0,
              transition: 'opacity 500ms ease 400ms',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                  letterSpacing: '0.22em', color: '#6B6965', textTransform: 'uppercase',
                }}>TRAINING PROGRESS</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                  letterSpacing: '0.16em', color: '#A8A6A0',
                }}>{isActive ? progressFill : '0%'}</span>
              </div>
              <div style={{
                width: '100%', height: 1,
                background: 'rgba(243,241,236,0.1)', borderRadius: 1, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: isActive ? progressFill : '0%',
                  background: 'rgba(243,241,236,0.7)',
                  borderRadius: 1,
                  transition: isActive
                    ? 'width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 500ms'
                    : 'none',
                }} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'flex-end',
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 700ms cubic-bezier(.22,1,.36,1) 200ms, transform 700ms cubic-bezier(.22,1,.36,1) 200ms',
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'Inter Tight, sans-serif', fontWeight: 300,
                  fontSize: 'clamp(48px, 5.5vw, 88px)', lineHeight: 0.95,
                  letterSpacing: '-0.04em', color: '#F3F1EC',
                  fontVariantNumeric: 'tabular-nums',
                }}>{s.value}</div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: '#A8A6A0', marginTop: 8,
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
