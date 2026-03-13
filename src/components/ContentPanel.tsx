'use client';

import { useEffect } from 'react';
import { DeskObject } from './DeskSection';
import ProjectsPanel from './panels/ProjectsPanel';
import IdeasPanel from './panels/IdeasPanel';
import NowPanel from './panels/NowPanel';
import SportsPanel from './panels/SportsPanel';
import LabPanel from './panels/LabPanel';
import AboutPanel from './panels/AboutPanel';
import ContactPanel from './panels/ContactPanel';
import styles from './ContentPanel.module.css';

interface ContentPanelProps {
  selected: DeskObject;
  onClose: () => void;
}

const PANEL_TITLES: Record<Exclude<DeskObject, null>, string> = {
  computer: 'Projects',
  book: 'Ideas & Learning',
  stickynotes: 'Now',
  trophy: 'Sports',
  flashdrive: 'Lab',
  coffeecup: 'About',
  phone: 'Contact',
};

export default function ContentPanel({ selected, onClose }: ContentPanelProps) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${selected ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`${styles.panel} ${selected ? styles.panelVisible : ''}`}
        role="complementary"
        aria-label={selected ? PANEL_TITLES[selected] : 'Content panel'}
      >
        <div className={styles.panelInner}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerLabel}>
                {selected ? PANEL_TITLES[selected] : ''}
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close panel"
            >
              <span>✕</span>
            </button>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Content */}
          <div className={styles.content}>
            {selected === 'computer' && <ProjectsPanel />}
            {selected === 'book' && <IdeasPanel />}
            {selected === 'stickynotes' && <NowPanel />}
            {selected === 'trophy' && <SportsPanel />}
            {selected === 'flashdrive' && <LabPanel />}
            {selected === 'coffeecup' && <AboutPanel />}
            {selected === 'phone' && <ContactPanel />}
          </div>
        </div>
      </aside>
    </>
  );
}
