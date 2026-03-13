import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.built}>
          Built with{' '}
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js</a>
          {' · '}
          <a href="https://threejs.org" target="_blank" rel="noopener noreferrer">Three.js</a>
          {' · '}
          <a href="https://docs.pmnd.rs/react-three-fiber" target="_blank" rel="noopener noreferrer">React Three Fiber</a>
        </div>
        <div className={styles.copy}>© Max Richter</div>
      </div>
    </footer>
  );
}
