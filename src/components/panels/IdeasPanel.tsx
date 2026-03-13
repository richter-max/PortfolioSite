import styles from './panels.module.css';

const ideas = [
  {
    topic: 'Security Engineering',
    desc: 'Building security into systems from the ground up. Threat modeling, STRIDE, secure defaults.',
    icon: '🔐',
    status: 'active',
  },
  {
    topic: 'LLM Guardrails',
    desc: 'Adversarial prompt testing, safety boundary fuzzing, alignment constraints in production systems.',
    icon: '🤖',
    status: 'deep dive',
  },
  {
    topic: 'Detection Engineering',
    desc: 'Sigma rules, SIEM logic, alert quality. Building detection that actually fires at the right time.',
    icon: '🎯',
    status: 'active',
  },
  {
    topic: 'Systems Thinking',
    desc: 'Feedback loops, emergent behavior, complex adaptive systems. Mental models for hard problems.',
    icon: '🧠',
    status: 'always',
  },
];

export default function IdeasPanel() {
  return (
    <div className={styles.panelContent}>
      <p className={styles.intro}>Topics I&apos;m actively learning, thinking about, and building toward.</p>
      <div className={styles.list}>
        {ideas.map((item) => (
          <div key={item.topic} className={styles.ideaItem}>
            <div className={styles.ideaIcon}>{item.icon}</div>
            <div className={styles.ideaBody}>
              <div className={styles.ideaHeader}>
                <span className={styles.ideaTitle}>{item.topic}</span>
                <span className={styles.statusBadge}>{item.status}</span>
              </div>
              <p className={styles.ideaDesc}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
