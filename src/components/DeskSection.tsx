'use client';

import { Suspense, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import DeskScene from './scene/DeskScene';
import ContentPanel from './ContentPanel';
import styles from './DeskSection.module.css';

export type DeskObject =
  | 'computer'
  | 'book'
  | 'stickynotes'
  | 'trophy'
  | 'flashdrive'
  | 'coffeecup'
  | 'phone'
  | null;

export default function DeskSection() {
  const [selected, setSelected] = useState<DeskObject>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x, y });
  }, []);

  const handleSelect = useCallback((obj: DeskObject) => {
    setSelected(prev => prev === obj ? null : obj);
  }, []);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <section
      id="desk"
      ref={sectionRef}
      className={styles.section}
      onMouseMove={handleMouseMove}
    >
      {/* Section label */}
      <div className={styles.label}>
        <span className={styles.labelLine} />
        <span>interactive workspace</span>
        <span className={styles.labelLine} />
      </div>

      {/* Hint */}
      <div className={`${styles.hint} ${selected ? styles.hintHidden : ''}`}>
        <span>hover & click objects to explore</span>
      </div>

      {/* 3D Canvas */}
      <div className={styles.canvasWrap}>
        <Canvas
          shadows
          camera={{ position: [0, 10, 20], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <DeskScene
              mouse={mouse}
              selected={selected}
              onSelect={handleSelect}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Content overlay */}
      <ContentPanel selected={selected} onClose={handleClose} />

      {/* Mobile nav (for small screens) */}
      <div className={styles.mobileNav}>
        {([
          { key: 'computer', label: 'Projects', icon: '💻' },
          { key: 'book', label: 'Ideas', icon: '📖' },
          { key: 'stickynotes', label: 'Now', icon: '📝' },
          { key: 'trophy', label: 'Sports', icon: '🏆' },
          { key: 'flashdrive', label: 'Lab', icon: '🔌' },
          { key: 'coffeecup', label: 'About', icon: '☕' },
          { key: 'phone', label: 'Contact', icon: '📱' },
        ] as { key: DeskObject; label: string; icon: string }[]).map(item => (
          <button
            key={item.key}
            className={`${styles.mobileBtn} ${selected === item.key ? styles.mobileBtnActive : ''}`}
            onClick={() => handleSelect(item.key)}
            aria-label={item.label}
          >
            <span className={styles.mobileBtnIcon}>{item.icon}</span>
            <span className={styles.mobileBtnLabel}>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
