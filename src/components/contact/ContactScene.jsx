// ContactScene.jsx — Underline form + 3D runner + Web3Forms submission
import { useEffect, useRef, useState } from 'react';
import ContactRunner from './ContactRunner.jsx';
import { submitContact, validate } from '~/lib/contact';

const MAX_CHARS = 600;

export default function ContactScene() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [focused, setFocused] = useState(null);
  const [status, setStatus]   = useState({ state: 'idle', message: '' });
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const isSubmitting = status.state === 'sending';
  const isDone       = status.state === 'success';

  async function onSubmit(e) {
    e.preventDefault();
    if (isSubmitting || isDone) return;

    const inlineErr = validate({ name, email, message });
    if (inlineErr) {
      setStatus({ state: 'error', message: inlineErr });
      return;
    }

    if (!consent) {
      setStatus({ state: 'error', message: 'Please confirm the privacy notice before sending.' });
      return;
    }

    setStatus({ state: 'sending', message: '' });

    const result = await submitContact({
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
      message: message.trim(),
      consent,
      website,
      elapsedMs: Date.now() - mountedAt.current,
    });

    if (result.ok) {
      setStatus({ state: 'success', message: 'Message sent. I’ll reply within 48h.' });
      setName(''); setEmail(''); setCompany(''); setMessage(''); setConsent(false);
    } else {
      setStatus({ state: 'error', message: result.message });
    }
  }

  const buttonLabel =
    status.state === 'sending' ? 'SENDING…' :
    status.state === 'success' ? 'SENT →' :
    'SEND →';

  return (
    <section id="contact" style={{
      padding: '128px 40px',
      borderTop: '1px solid rgba(243,241,236,0.08)',
      background: '#050506',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>

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

        {/* Two-column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 440px',
          gap: 80,
          alignItems: 'start',
        }}>

          {/* LEFT: form */}
          <form onSubmit={onSubmit} noValidate style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '36px 40px',
          }}>
            <UnderlineField name="name" label="NAME" required value={name} onChange={setName} focused={focused} setFocused={setFocused} autoComplete="name" disabled={isSubmitting || isDone} />
            <UnderlineField name="email" label="EMAIL" type="email" required value={email} onChange={setEmail} focused={focused} setFocused={setFocused} autoComplete="email" disabled={isSubmitting || isDone} />

            <div style={{ gridColumn: '1 / -1' }}>
              <UnderlineField name="company" label="COMPANY" optional value={company} onChange={setCompany} focused={focused} setFocused={setFocused} autoComplete="organization" disabled={isSubmitting || isDone} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <UnderlineField
                name="message" label="MESSAGE" required multiline
                value={message}
                onChange={(v) => { if (v.length <= MAX_CHARS) setMessage(v); }}
                focused={focused} setFocused={setFocused}
                meta={`${message.length} / ${MAX_CHARS} CHARS`}
                disabled={isSubmitting || isDone}
              />
            </div>

            {/* Consent — DSGVO/GDPR */}
            <div style={{ gridColumn: '1 / -1' }}>
              <ConsentCheckbox checked={consent} onChange={setConsent} disabled={isSubmitting || isDone} />
            </div>

            {/* Honeypot — hidden from humans, bots fill it */}
            <div aria-hidden="true" style={{
              position: 'absolute', left: '-10000px', top: 'auto',
              width: 1, height: 1, overflow: 'hidden',
            }}>
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
            </div>

            <div style={{
              gridColumn: '1 / -1', marginTop: 24,
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 16,
            }}>
              <StatusLine status={status} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: '#6B6965', letterSpacing: '0.1em',
                }}>⏎ PRESS ENTER</span>
                <button
                  data-magnetic="0.4" data-cursor-hover type="submit"
                  disabled={isSubmitting || isDone}
                  aria-busy={isSubmitting}
                  style={{
                    background: isDone ? '#2E6BFF' : 'transparent',
                    color: isDone ? '#F3F1EC' : '#2E6BFF',
                    border: '0.5px solid #2E6BFF', padding: '14px 28px',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                    letterSpacing: '0.2em', borderRadius: 4,
                    cursor: isSubmitting || isDone ? 'default' : 'none',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'background 0.25s ease, color 0.25s ease, opacity 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (isSubmitting || isDone) return;
                    e.currentTarget.style.background = '#2E6BFF';
                    e.currentTarget.style.color = '#F3F1EC';
                  }}
                  onMouseLeave={(e) => {
                    if (isSubmitting || isDone) return;
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#2E6BFF';
                  }}
                >{buttonLabel}</button>
              </div>
            </div>
          </form>

          {/* RIGHT: runner */}
          <div style={{
            position: 'sticky', top: 120,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 24, width: '100%',
          }}>
            <div style={{ width: '100%' }}>
              <ContactRunner />
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, letterSpacing: '0.22em',
              color: '#6B6965', textAlign: 'center', lineHeight: 1.7,
            }}>
              <span style={{ color: '#F3F1EC' }}>IN MOTION</span><br/>
              ALLGÄU · CET
            </div>
          </div>

        </div>

        {/* Meta info */}
        <div style={{
          marginTop: 96,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48,
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

function ConsentCheckbox({ checked, onChange, disabled }) {
  const id = 'contact-consent';
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'Inter Tight, sans-serif',
        fontSize: 13,
        lineHeight: 1.55,
        color: '#A8A6A0',
        letterSpacing: '-0.005em',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 16, height: 16,
          marginTop: 2,
          border: `1px solid ${checked ? '#2E6BFF' : 'rgba(243,241,236,0.3)'}`,
          background: checked ? '#2E6BFF' : 'transparent',
          borderRadius: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s ease, border-color 0.2s ease',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#F3F1EC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        required
        data-cursor-hover
        style={{
          position: 'absolute',
          width: 1, height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      <span>
        I agree that my submitted data will be transmitted to{' '}
        <a
          href="https://web3forms.com/privacy-policy"
          target="_blank"
          rel="noreferrer"
          style={{ color: '#F3F1EC', textDecoration: 'underline', textDecorationColor: 'rgba(243,241,236,0.3)', textUnderlineOffset: 3 }}
        >Web3Forms</a>{' '}
        and forwarded to my Proton inbox for the sole purpose of replying to my
        message. See the{' '}
        <a
          href="/datenschutz"
          style={{ color: '#F3F1EC', textDecoration: 'underline', textDecorationColor: 'rgba(243,241,236,0.3)', textUnderlineOffset: 3 }}
        >privacy policy</a>{' '}
        for details. <span style={{ color: '#6B6965' }}>*</span>
      </span>
    </label>
  );
}

function StatusLine({ status }) {
  const base = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10, letterSpacing: '0.2em',
    transition: 'color 0.25s ease',
  };

  if (status.state === 'idle') {
    return <div role="status" aria-live="polite" style={{ ...base, color: '#6B6965' }}>REPLY &lt; 48H · CET</div>;
  }
  if (status.state === 'sending') {
    return <div role="status" aria-live="polite" style={{ ...base, color: '#A8A6A0' }}>TRANSMITTING…</div>;
  }
  if (status.state === 'success') {
    return (
      <div role="status" aria-live="polite" style={{ ...base, color: '#2E6BFF', letterSpacing: '0.14em' }}>
        ✓ {status.message.toUpperCase()}
      </div>
    );
  }
  // error
  return (
    <div role="alert" aria-live="assertive" style={{ ...base, color: '#E8A23C', letterSpacing: '0.14em', maxWidth: '44ch' }}>
      ! {status.message}
    </div>
  );
}

function UnderlineField({
  name, label, value, onChange, focused, setFocused,
  type = 'text', required = false, optional = false, multiline = false,
  meta = null, autoComplete, disabled = false,
}) {
  const isActive = focused === name;
  const hasValue = value.length > 0;
  const underlineColor = isActive ? '#2E6BFF' : hasValue ? 'rgba(243,241,236,0.4)' : 'rgba(243,241,236,0.12)';
  const labelColor = isActive ? '#2E6BFF' : '#6B6965';

  const sharedInputStyle = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `1px solid ${underlineColor}`,
    padding: '10px 0',
    fontFamily: 'Inter Tight, sans-serif', fontSize: 18,
    color: '#F3F1EC', outline: 'none',
    caretColor: '#2E6BFF',
    transition: 'border-color 0.25s ease, opacity 0.25s ease',
    fontWeight: 400, letterSpacing: '-0.005em',
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <label style={{ display: 'block' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9, letterSpacing: '0.22em', color: labelColor,
        marginBottom: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        transition: 'color 0.25s ease',
      }}>
        <span>
          {label}
          {required && <span style={{ marginLeft: 4 }}>*</span>}
          {optional && <span style={{ marginLeft: 8, color: '#3a3a3a', letterSpacing: '0.18em' }}>(OPTIONAL)</span>}
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
          name={name}
          required={required} rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused(null)}
          data-cursor-hover
          disabled={disabled}
          autoComplete={autoComplete}
          style={{ ...sharedInputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.5 }}
        />
      ) : (
        <input
          name={name}
          type={type} required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused(null)}
          data-cursor-hover
          disabled={disabled}
          autoComplete={autoComplete}
          style={sharedInputStyle}
        />
      )}
    </label>
  );
}
