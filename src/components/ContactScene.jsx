// ContactScene.jsx — minimal email form
import { useState } from 'react';

export default function ContactScene() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    window.location.href = `mailto:max.richter.dev@proton.me?subject=${encodeURIComponent('Contact via richtermax.com')}&body=${encodeURIComponent(msg + '\n\n—\n' + email)}`;
  };

  return (
    <section id="contact" style={{
      padding: '128px 40px', borderTop: '1px solid rgba(243,241,236,0.08)',
      background: '#050506',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.2em',
          color: '#6B6965', marginBottom: 40, display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <span style={{ color: '#F3F1EC' }}>04</span>
          <span style={{ width: 32, height: 1, background: 'rgba(243,241,236,0.16)' }} />
          <span style={{ color: '#F3F1EC' }}>CONTACT</span>
        </div>
        <h2 data-reveal="lines" style={{
          fontFamily: 'Inter Tight, sans-serif', fontWeight: 500,
          fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.98, letterSpacing: '-0.04em',
          color: '#F3F1EC', margin: 0, maxWidth: '14ch',
        }}>Get in touch.</h2>
        <p data-reveal="fade-up" style={{
          fontFamily: 'Inter Tight, sans-serif', fontSize: 19, lineHeight: 1.5,
          color: '#A8A6A0', maxWidth: '52ch', marginTop: 32, marginBottom: 64,
          letterSpacing: '-0.005em',
        }}>Security engagements, speaking, collaborations. Replies within two working days.</p>

        <form onSubmit={submit} style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 900,
        }}>
          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.22em',
              color: '#6B6965', marginBottom: 10,
            }}>EMAIL</div>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: '1px solid rgba(243,241,236,0.2)',
                padding: '12px 0', fontFamily: 'Inter Tight, sans-serif', fontSize: 20,
                color: '#F3F1EC', outline: 'none',
              }} />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.22em',
              color: '#6B6965', marginBottom: 10,
            }}>MESSAGE</div>
            <textarea required rows={4} value={msg} onChange={e => setMsg(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: '1px solid rgba(243,241,236,0.2)',
                padding: '12px 0', fontFamily: 'Inter Tight, sans-serif', fontSize: 20,
                color: '#F3F1EC', outline: 'none', resize: 'vertical',
              }} />
          </label>
          <button data-magnetic="0.4" type="submit" style={{
            gridColumn: '1 / -1', justifySelf: 'start',
            background: '#F3F1EC', color: '#050506', border: 'none',
            padding: '18px 40px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            letterSpacing: '0.22em', cursor: 'pointer', marginTop: 16,
          }}>{sent ? 'OPENED IN CLIENT →' : 'SEND →'}</button>
        </form>

        <div style={{
          marginTop: 96, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48,
          paddingTop: 48, borderTop: '1px solid rgba(243,241,236,0.08)',
        }}>
          {[
            ['EMAIL', 'max.richter.dev@proton.me'],
            ['BASE', 'Allgäu · CET'],
            ['RESPONSE', '< 48 hours'],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.22em',
                color: '#6B6965', marginBottom: 8,
              }}>{k}</div>
              <div style={{
                fontFamily: 'Inter Tight, sans-serif', fontSize: 20, letterSpacing: '-0.015em',
                color: '#F3F1EC',
              }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
