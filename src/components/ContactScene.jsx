// ContactScene.jsx — Underline-style contact form
// - No input boxes, just underlines (like a paper script)
// - Label jumps to mono-caps on focus
// - Blue accent only on active field
// - Live character counter on message
// - Grid: Name + Email side by side, Company full width, Message full width
import { useState } from 'react';

const MAX_CHARS = 600;

export default function ContactScene() {
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(null); // 'name' | 'email' | 'company' | 'message'
  const [sent, setSent]     = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSent(true);

    const body =
      `${message}\n\n` +
      `—\n` +
      `From: ${name}\n` +
      `Email: ${email}` +
      (company ? `\nCompany: ${company}` : '');

    window.location.href = `mailto:max.richter.dev@proton.me?subject=${encodeURIComponent(`Contact · ${name}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" style={{
      padding: '128px 40px',
      borderTop: '1px solid rgba(243,241,236,0.08)',
      background: '#050506',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>

        {/* ── Section label ── */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: '0.2em',
          color: '#6B6965', marginBottom: 40,
          display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <span style={{ color: '#F3F1EC' }}>04</span>
          <span style={{ width: 32, height: 1, background: 'rgba(243,241,236,0.16)' }} />
          <span style={{ color: '#F3F1EC' }}>CONTACT</span>
        </div>

        {/* ── Headline ── */}
        <h2 data-reveal="lines" style={{
          fontFamily: 'Inter Tight, sans-serif', fontWeight: 500,
          fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.98,
          letterSpacing: '-0.04em', color: '#F3F1EC',
          margin: 0, maxWidth: '14ch',
        }}>Get in touch.</h2>

        <p data-reveal="fade-up" style={{
          fontFamily: 'Inter Tight, sans-serif',
          fontSize: 19, lineHeight: 1.5,
          color: '#A8A6A0', maxWidth: '52ch',
          marginTop: 32, marginBottom: 72,
          letterSpacing: '-0.005em',
        }}>Security engagements, speaking, collaborations. Replies within two working days.</p>

        {/* ── Form ── */}
        <form onSubmit={submit} style={{
          maxWidth: 900,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '36px 40px',
        }}>

          <UnderlineField
            name="name"
            label="NAME"
            required
            value={name}
            onChange={setName}
            focused={focused}
            setFocused={setFocused}
          />

          <UnderlineField
            name="email"
            label="EMAIL"
            type="email"
            required
            value={email}
            onChange={setEmail}
            focused={focused}
            setFocused={setFocused}
          />

          <div style={{ gridColumn: '1 / -1' }}>
            <UnderlineField
              name="company"
              label="COMPANY"
              optional
              value={company}
              onChange={setCompany}
              focused={focused}
              setFocused={setFocused}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <UnderlineField
              name="message"
              label="MESSAGE"
              required
              multiline
              value={message}
              onChange={(v) => {
                if (v.length <= MAX_CHARS) setMessage(v);
              }}
              focused={focused}
              setFocused={setFocused}
              meta={`${message.length} / ${MAX_CHARS} CHARS`}
            />
          </div>

          {/* ── Submit row ── */}
          <div style={{
            gridColumn: '1 / -1',
            marginTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, letterSpacing: '0.2em', color: '#6B6965',
            }}>
              REPLY &lt; 48H · CET
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, color: '#6B6965',
                letterSpacing: '0.1em',
              }}>
                ⏎ PRESS ENTER
              </span>
              <button
                data-magnetic="0.4"
                data-cursor-hover
                type="submit"
                style={{
                  background: 'transparent',
                  color: '#2E6BFF',
                  border: '0.5px solid #2E6BFF',
                  padding: '14px 28px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, letterSpacing: '0.2em',
                  borderRadius: 4,
                  cursor: 'none',
                  transition: 'background 0.25s ease, color 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2E6BFF';
                  e.currentTarget.style.color = '#F3F1EC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#2E6BFF';
                }}
              >{sent ? 'OPENED IN CLIENT →' : 'SEND →'}</button>
            </div>
          </div>
        </form>

        {/* ── Meta info grid ── */}
        <div style={{
          marginTop: 96,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 48,
          paddingTop: 48,
          borderTop: '1px solid rgba(243,241,236,0.08)',
        }}>
          {[
            ['EMAIL',    'max.richter.dev@proton.me'],
            ['BASE',     'Allgäu · CET'],
            ['RESPONSE', '< 48 hours'],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, letterSpacing: '0.22em',
                color: '#6B6965', marginBottom: 8,
              }}>{k}</div>
              <div style={{
                fontFamily: 'Inter Tight, sans-serif',
                fontSize: 20, letterSpacing: '-0.015em', color: '#F3F1EC',
              }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Underline-style input field ───────────────────────────────────────────
function UnderlineField({
  name, label, value, onChange,
  focused, setFocused,
  type = 'text',
  required = false,
  optional = false,
  multiline = false,
  meta = null,
}) {
  const isActive = focused === name;
  const hasValue = value.length > 0;

  // Color logic:
  // - Active (focused): blue accent everywhere
  // - Has value but not focused: white underline
  // - Empty + not focused: faint gray underline
  const underlineColor = isActive
    ? '#2E6BFF'
    : hasValue
      ? 'rgba(243,241,236,0.4)'
      : 'rgba(243,241,236,0.12)';

  const labelColor = isActive ? '#2E6BFF' : '#6B6965';

  const sharedInputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${underlineColor}`,
    padding: '10px 0',
    fontFamily: 'Inter Tight, sans-serif',
    fontSize: 18,
    color: '#F3F1EC',
    outline: 'none',
    caretColor: '#2E6BFF',
    transition: 'border-color 0.25s ease',
    fontWeight: 400,
    letterSpacing: '-0.005em',
  };

  return (
    <label style={{ display: 'block' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9, letterSpacing: '0.22em',
        color: labelColor,
        marginBottom: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        transition: 'color 0.25s ease',
      }}>
        <span>
          {label}
          {required && <span style={{ marginLeft: 4 }}>*</span>}
          {optional && (
            <span style={{
              marginLeft: 8,
              color: '#3a3a3a',
              letterSpacing: '0.18em',
            }}>(OPTIONAL)</span>
          )}
        </span>
        {meta && (
          <span style={{
            fontSize: 9, letterSpacing: '0.18em',
            color: isActive ? '#2E6BFF' : '#6B6965',
            transition: 'color 0.25s ease',
          }}>{meta}</span>
        )}
      </div>

      {multiline ? (
        <textarea
          required={required}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused(null)}
          data-cursor-hover
          style={{
            ...sharedInputStyle,
            resize: 'vertical',
            minHeight: 80,
            lineHeight: 1.5,
          }}
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused(null)}
          data-cursor-hover
          style={sharedInputStyle}
        />
      )}
    </label>
  );
}
