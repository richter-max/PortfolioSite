import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lab — Max Richter',
  description: 'Experimental prototypes and technical experiments.',
};

export default function LabPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-cyan)',
          fontSize: '0.85rem',
          letterSpacing: '0.15em',
          marginBottom: '1rem',
          textTransform: 'uppercase',
        }}>
          /lab
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '1.5rem',
          lineHeight: 1.1,
        }}>
          Experiments &<br />Prototypes
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          lineHeight: 1.7,
          marginBottom: '3rem',
        }}>
          This is where half-finished ideas live. Tools that work but aren&apos;t ready.
          Scripts that solve one specific problem. Experiments that might become real projects.
        </p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            {
              name: 'AEGIS Threat Model Validator',
              desc: 'Automated STRIDE coverage checker for architecture diagrams',
              status: 'WIP',
            },
            {
              name: 'LLM Guardrail Fuzzer',
              desc: 'Adversarial prompt generation to test LLM safety boundaries',
              status: 'IDEA',
            },
            {
              name: 'Network Graph Visualizer',
              desc: 'Real-time attack surface topology rendering',
              status: 'WIP',
            },
            {
              name: 'Detection Rule Linter',
              desc: 'Static analysis for Sigma rules and SIEM detection logic',
              status: 'PLANNED',
            },
          ].map((item) => (
            <div key={item.name} style={{
              background: 'var(--glass)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              transition: 'border-color 0.2s ease',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: item.status === 'WIP' ? 'var(--accent-amber)' :
                       item.status === 'IDEA' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: `1px solid ${item.status === 'WIP' ? 'var(--accent-amber)' :
                         item.status === 'IDEA' ? 'var(--accent-cyan)' : 'var(--border)'}`,
                borderRadius: '4px',
                padding: '2px 8px',
                whiteSpace: 'nowrap',
                marginTop: '2px',
              }}>
                {item.status}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {item.name}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
        <a href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '3rem',
          color: 'var(--accent-amber)',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          transition: 'opacity 0.2s',
        }}>
          ← Back to desk
        </a>
      </div>
    </div>
  );
}
