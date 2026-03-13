import styles from './panels.module.css';

const sports = [
  {
    icon: '🏊🚲🏃',
    name: 'Ironman 70.3',
    desc: '1.9km swim · 90km bike · 21km run. Middle distance triathlon in training.',
    status: 'in training',
    color: '#4a9eff',
  },
  {
    icon: '🏅',
    name: 'Berlin Marathon',
    desc: '42.195km goal race. Training for a sub-4-hour finish through the city center.',
    status: 'goal',
    color: '#f0a832',
  },
  {
    icon: '🏓',
    name: 'Table Tennis',
    desc: 'Competitive club player. Fast, technical, strategic — the chess of racket sports.',
    status: 'active',
    color: '#00d4aa',
  },
  {
    icon: '💪',
    name: 'Endurance Training',
    desc: 'Daily training blocks: zone 2 base, brick sessions, strength work. Consistency over intensity.',
    status: 'daily',
    color: '#ff8833',
  },
];

export default function SportsPanel() {
  return (
    <div className={styles.panelContent}>
      <p className={styles.intro}>Same discipline as engineering. Show up, do the work, get better.</p>
      <div className={styles.sportGrid}>
        {sports.map((sport) => (
          <div key={sport.name} className={styles.sportCard} style={{ borderColor: `${sport.color}22` }}>
            <div className={styles.sportEmoji}>{sport.icon}</div>
            <div className={styles.sportHeader}>
              <span className={styles.sportName}>{sport.name}</span>
              <span className={styles.statusBadge} style={{ color: sport.color, borderColor: `${sport.color}44` }}>
                {sport.status}
              </span>
            </div>
            <p className={styles.sportDesc}>{sport.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
