import styles from './panels.module.css';

const traits = [
  { label: 'Role', value: 'Developer at Bosch' },
  { label: 'Focus', value: 'Security engineering, systems building' },
  { label: 'Next', value: 'Master\'s in Cybersecurity' },
  { label: 'Trains', value: 'Triathlon, marathon, table tennis' },
  { label: 'Ethos', value: 'Build things that work. Understand why.' },
];

export default function AboutPanel() {
  return (
    <div className={styles.panelContent}>
      <div className={styles.aboutHeader}>
        <div className={styles.aboutAvatar}>MR</div>
        <div>
          <div className={styles.aboutName}>Max Richter</div>
          <div className={styles.aboutTitle}>builder · security enthusiast · developer</div>
        </div>
      </div>

      <p className={styles.aboutBio}>
        I write code that finds problems before attackers do, train for endurance events that
        test what I&apos;m made of, and build tools that make complex systems easier to understand.
      </p>

      <div className={styles.traitList}>
        {traits.map((t) => (
          <div key={t.label} className={styles.traitRow}>
            <span className={styles.traitLabel}>{t.label}</span>
            <span className={styles.traitValue}>{t.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
