'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './IntroSection.module.css';

export default function IntroSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToDesk = () => {
    document.getElementById('desk')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className={styles.intro} id="intro">
      {/* Ambient grid background */}
      <div className={styles.grid} aria-hidden="true" />

      {/* Corner accents */}
      <div className={styles.cornerTL} aria-hidden="true" />
      <div className={styles.cornerBR} aria-hidden="true" />

      {/* Status bar */}
      <div className={`${styles.statusBar} ${visible ? styles.visible : ''}`}>
        <span className={styles.statusDot} />
        <span>Available · Bosch · Building</span>
      </div>

      {/* Main content */}
      <div className={`${styles.content} ${visible ? styles.visible : ''}`}>
        <div className={styles.eyebrow}>Developer · Security Engineer · Builder</div>

        <h1 className={styles.heading}>
          Hi, I&apos;m{' '}
          <span className={styles.name}>Max.</span>
        </h1>

        <div className={styles.taglines}>
          <p className={styles.tagline} style={{ animationDelay: '0.3s' }}>
            I build security tools,
          </p>
          <p className={styles.tagline} style={{ animationDelay: '0.5s' }}>
            train for Ironman,
          </p>
          <p className={styles.tagline} style={{ animationDelay: '0.7s' }}>
            and love complex systems.
          </p>
        </div>

        <button
          className={styles.ctaButton}
          onClick={scrollToDesk}
          style={{ animationDelay: '1.0s' }}
        >
          <span>Explore my desk</span>
          <span className={styles.arrow}>↓</span>
        </button>
      </div>

      {/* Scroll hint */}
      <div className={`${styles.scrollHint} ${visible ? styles.visible : ''}`}>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
