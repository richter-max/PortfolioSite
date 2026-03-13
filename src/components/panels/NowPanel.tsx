import styles from './panels.module.css';

const items = [
  {
    icon: '🏢',
    label: 'Working at Bosch',
    detail: 'Developer building internal tools and security infrastructure.',
  },
  {
    icon: '🔧',
    label: 'Building security tools',
    detail: 'AEGIS, attack surface scanning, detection engineering scripts.',
  },
  {
    icon: '🏊',
    label: 'Training for Ironman 70.3',
    detail: '3-sport endurance athlete in progress. Swim, bike, run.',
  },
  {
    icon: '📚',
    label: 'Learning cybersecurity',
    detail: 'Studying for future master\'s in cybersecurity. Going deep on the technical side.',
  },
];

export default function NowPanel() {
  return (
    <div className={styles.panelContent}>
      <p className={styles.intro}>What I&apos;m doing right now — March 2026.</p>
      <div className={styles.nowGrid}>
        {items.map((item) => (
          <div key={item.label} className={styles.nowItem}>
            <div className={styles.nowIcon}>{item.icon}</div>
            <div>
              <div className={styles.nowLabel}>{item.label}</div>
              <div className={styles.nowDetail}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
