import styles from './panels.module.css';

const projects = [
  {
    name: 'AEGIS',
    desc: 'Automated security evaluation framework for threat modeling and coverage analysis.',
    url: 'https://github.com/cleamax/AEGIS',
    tags: ['Python', 'Security', 'CLI'],
  },
  {
    name: 'Cloud Signal Engine',
    desc: 'Real-time signal processing pipeline for cloud infrastructure events and anomaly detection.',
    url: 'https://github.com/cleamax',
    tags: ['Cloud', 'Detection', 'Go'],
  },
  {
    name: 'Attack Surface Scanner',
    desc: 'Automated reconnaissance tool mapping exposed assets, services and potential entry points.',
    url: 'https://github.com/cleamax',
    tags: ['Python', 'Recon', 'CLI'],
  },
  {
    name: 'VendorQ',
    desc: 'Third-party vendor security questionnaire automation and risk scoring system.',
    url: 'https://github.com/cleamax',
    tags: ['Security', 'Risk', 'Python'],
  },
  {
    name: 'Seclo',
    desc: 'Security-focused developer workflow tooling — linting, scanning, and policy enforcement.',
    url: 'https://github.com/cleamax',
    tags: ['DevSecOps', 'Tooling'],
  },
  {
    name: 'Sublr',
    desc: 'Subdomain enumeration and live detection tool with smart filtering and output formatting.',
    url: 'https://github.com/cleamax',
    tags: ['Recon', 'Python', 'CLI'],
  },
];

const tagColors: Record<string, string> = {
  Python: '#4a9eff',
  Security: '#f0a832',
  CLI: '#00d4aa',
  Cloud: '#aaddff',
  Detection: '#ff8833',
  Go: '#aaccff',
  Recon: '#c8841a',
  DevSecOps: '#9b59b6',
  Tooling: '#5a5a7a',
  Risk: '#e74c3c',
};

export default function ProjectsPanel() {
  return (
    <div className={styles.panelContent}>
      <p className={styles.intro}>Things I&apos;ve built. Tools, systems, experiments.</p>
      <div className={styles.projectGrid}>
        {projects.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.projectCard}
          >
            <div className={styles.projectHeader}>
              <span className={styles.projectName}>{p.name}</span>
              <span className={styles.projectArrow}>↗</span>
            </div>
            <p className={styles.projectDesc}>{p.desc}</p>
            <div className={styles.tags}>
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className={styles.tag}
                  style={{ borderColor: tagColors[tag] || 'var(--border)', color: tagColors[tag] || 'var(--text-muted)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
