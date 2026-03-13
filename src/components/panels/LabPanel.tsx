import styles from './panels.module.css';

const experiments = [
  { name: 'AEGIS Threat Model Validator', status: 'WIP', color: '#f0a832' },
  { name: 'LLM Guardrail Fuzzer', status: 'IDEA', color: '#00d4aa' },
  { name: 'Network Graph Visualizer', status: 'WIP', color: '#4a9eff' },
  { name: 'Detection Rule Linter', status: 'PLANNED', color: '#7a7a9a' },
];

export default function LabPanel() {
  return (
    <div className={styles.panelContent}>
      <p className={styles.intro}>Half-finished ideas. Scripts that solve one problem. Things that might become real.</p>
      <div className={styles.list}>
        {experiments.map((exp) => (
          <div key={exp.name} className={styles.labItem}>
            <span
              className={styles.labBadge}
              style={{ color: exp.color, borderColor: `${exp.color}44` }}
            >
              {exp.status}
            </span>
            <span className={styles.labName}>{exp.name}</span>
          </div>
        ))}
      </div>
      <a href="/lab" className={styles.labLink}>
        Open full Lab →
      </a>
    </div>
  );
}
