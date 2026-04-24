// Hero.jsx — Photo background + 3D runner approaching from vanishing point
// Architecture:
//   outer (200vh relative)
//     └─ sticky inner (100vh)
//          ├─ photo background (CSS filter for mood)
//          ├─ atmospheric overlays
//          ├─ 3D canvas (runner runs from background → foreground)
//          └─ content (name, role, countdown)
import { useEffect, useRef, useState } from 'react';

const MODEL_URL = '/models/richter.glb';
const PHOTO_URL = '/img/hero-path.jpg';

export default function Hero() {
  const [mounted, setMounted]       = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const outerRef  = useRef(null);
  const canvasRef = useRef(null);
  const stateRef  = useRef({ scrollProgress: 0 });

  // ── Loader timing ─────────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 60);
    const t2 = setTimeout(() => setLoaderGone(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Scroll tracking ───────────────────────────────────────────────────
  useEffect(() => {
    let rafId = null;

    function compute() {
      const outer = outerRef.current;
      if (!outer) return;
      const rect  = outer.getBoundingClientRect();
      const total = outer.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      stateRef.current.scrollProgress = scrolled / total;
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { compute(); rafId = null; });
    }

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', compute);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Name entrance ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    async function init() {
      const { gsap } = await import('gsap');
      if (cancelled) return;

      const nameEl = document.querySelector('[data-hero-name]');
      if (!nameEl || nameEl.dataset.split) return;
      nameEl.dataset.split = 'true';

      const text = nameEl.textContent || '';
      nameEl.innerHTML = text.split('').map(c =>
        c === ' '
          ? '<span style="display:inline-block;width:0.25em">&nbsp;</span>'
          : '<span style="display:inline-block;will-change:transform,opacity">' + c + '</span>'
      ).join('');

      const chars = nameEl.querySelectorAll('span');
      gsap.set(chars, { y: -40, opacity: 0 });
      gsap.to(chars, {
        y: 0, opacity: 1,
        duration: 0.9,
        ease: 'expo.out',
        stagger: { each: 0.022 },
        delay: 1.7,
      });
    }

    const t = setTimeout(init, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [mounted]);

  // ── 3D Runner ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cleanup = () => {};
    let mountedFlag = true;

    async function initWebGL() {
      const THREE          = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      if (!mountedFlag || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const width  = window.innerWidth;
      const height = window.innerHeight;

      // ── Scene ──────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = null; // transparent — photo shows through

      // ── Camera ─────────────────────────────────────────────────────
      // We align 3D world with photo perspective.
      // Photo's vanishing point is roughly at (50% x, 50% y) → center of screen.
      // Camera looks along +Z. Runner starts at -Z (far) and moves to +Z (close).
      const camera = new THREE.PerspectiveCamera(
        35, width / height, 0.1, 200
      );
      // Camera at ground eye level, looking slightly down (matches photo angle)
      camera.position.set(0, 1.4, 0);
      camera.lookAt(0, 1.2, -10);

      // ── Renderer ───────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;

      // ── Lighting (warm key + cool fill for silhouette separation) ──
      const ambient = new THREE.AmbientLight(0xffffff, 0.25);
      scene.add(ambient);

      // Key light: from front-top-right (the open sky direction in the photo)
      const keyLight = new THREE.DirectionalLight(0xE8EEF5, 1.8);
      keyLight.position.set(4, 8, 3);
      scene.add(keyLight);

      // Rim light: blue, from behind — creates edge glow
      const rimLight = new THREE.DirectionalLight(0x2E6BFF, 1.4);
      rimLight.position.set(-2, 3, -6);
      scene.add(rimLight);

      // Fill: subtle, from below
      const fill = new THREE.DirectionalLight(0xffffff, 0.3);
      fill.position.set(-2, -1, 2);
      scene.add(fill);

      // ── Load runner ────────────────────────────────────────────────
      let runner = null;
      let runnerBaseY = 0;

      const loader = new GLTFLoader();
      loader.load(
        MODEL_URL,
        (gltf) => {
          if (!mountedFlag) return;
          runner = gltf.scene;

          // Normalize size: model's height → 1.8 units (human scale in meters)
          const box    = new THREE.Box3().setFromObject(runner);
          const size   = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const scale  = 1.8 / size.y;
          runner.scale.setScalar(scale);

          // Ground feet at y=0, center horizontally
          runner.position.x = -(center.x * scale);
          runner.position.y = -(box.min.y * scale);
          runnerBaseY = runner.position.y;

          // Face camera (runs TOWARDS viewer)
          runner.rotation.y = 0;

          scene.add(runner);
        },
        undefined,
        (err) => console.error('Hero: runner load failed', err)
      );

      // ── Animation loop ─────────────────────────────────────────────
      const clock = new THREE.Clock();
      let rafId;

      function animate() {
        rafId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        const p = stateRef.current.scrollProgress; // 0 → 1

        if (runner) {
          // Z position: -20 (far, at vanishing point) → -2 (close, near camera)
          // At p=0: runner is tiny dot at horizon
          // At p=1: runner is large in foreground
          const startZ = -22;
          const endZ   = -2.5;
          runner.position.z = startZ + p * (endZ - startZ);

          // Stay centered on the road (X=0 in our world)
          // But add a tiny sway to make it feel alive
          runner.position.x = Math.sin(t * 1.5) * 0.08;

          // Subtle up/down bob (stride simulation)
          runner.position.y = runnerBaseY + Math.abs(Math.sin(t * 3)) * 0.08;

          // Fade in during first 5% of scroll (so runner doesn't just pop in)
          const opacity = Math.min(p * 20, 1);
          runner.traverse((c) => {
            if (c.isMesh && c.material) {
              c.material.transparent = true;
              c.material.opacity = opacity;
            }
          });
        }

        renderer.render(scene, camera);
      }
      animate();

      // ── Resize ─────────────────────────────────────────────────────
      function onResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
      window.addEventListener('resize', onResize);

      cleanup = () => {
        mountedFlag = false;
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
      };
    }

    initWebGL();
    return () => cleanup();
  }, []);

  return (
    <>
      {!loaderGone && <HeroLoader mounted={mounted} />}

      {/* Outer 200vh — scroll room for runner approach */}
      <div
        id="top"
        ref={outerRef}
        style={{ position: 'relative', height: '200vh', width: '100%' }}
      >
        {/* Sticky 100vh container */}
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: '#050506',
        }}>

          {/* Photo background — moody, desaturated */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("${PHOTO_URL}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'saturate(0.35) brightness(0.55) contrast(1.1) hue-rotate(10deg)',
            zIndex: 0,
          }} />

          {/* Cool color overlay — pushes photo toward blue/moody */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(10,15,30,0.35) 0%, rgba(10,15,30,0.15) 50%, rgba(5,5,6,0.6) 100%)',
            mixBlendMode: 'multiply',
            zIndex: 1,
          }} />

          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,5,6,0.6) 100%)',
            zIndex: 2,
          }} />

          {/* 3D canvas — runner */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              display: 'block',
              zIndex: 3,
            }}
          />

          {/* Bottom gradient for text legibility */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to top, rgba(5,5,6,0.9) 0%, rgba(5,5,6,0.4) 30%, transparent 55%)',
            zIndex: 4,
          }} />

          {/* Content */}
          <div style={{
            position: 'absolute',
            bottom: 80,
            left: 40, right: 40,
            zIndex: 5,
            maxWidth: 1440,
            margin: '0 auto',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 800ms ease 1500ms',
          }}>
            <h1
              data-hero-name
              style={{
                fontFamily: 'Inter Tight, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(52px, 9.5vw, 152px)',
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                color: '#F3F1EC',
                margin: '0 0 36px',
              }}
            >
              Maximilian Richter
            </h1>

            <div style={{
              display: 'flex', alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 32,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, letterSpacing: '0.22em',
                color: '#A8A6A0',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <span style={{ color: '#F3F1EC' }}>SECURITY ENGINEER</span>
                <span style={{ width: 24, height: 1, background: 'rgba(243,241,236,0.2)', display: 'inline-block' }} />
                <span>ENDURANCE ATHLETE</span>
              </div>
              <KraichgauCountdown />
            </div>
          </div>

          {/* Scroll cue */}
          <div style={{
            position: 'absolute',
            bottom: 20, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 12,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9, letterSpacing: '0.3em',
            color: '#A8A6A0', pointerEvents: 'none',
            opacity: mounted ? 0.5 : 0,
            transition: 'opacity 1000ms ease 2600ms',
            zIndex: 5,
          }}>
            <span>SCROLL</span>
            <span style={{
              width: 1, height: 30,
              background: 'linear-gradient(to bottom, #F3F1EC, transparent)',
              animation: 'heroScrollCue 2400ms cubic-bezier(.22,1,.36,1) infinite',
              transformOrigin: 'top',
            }} />
          </div>

        </div>
      </div>

      <style>{`
        @keyframes heroScrollCue {
          0%   { transform: scaleY(0); transform-origin: top; }
          50%  { transform: scaleY(1); transform-origin: top; }
          51%  { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        @keyframes loaderLineGrow {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes loaderLineCollapse {
          0%   { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(0); opacity: 0; }
        }
        @keyframes loaderTextFade {
          0%   { opacity: 0; letter-spacing: 0.45em; }
          100% { opacity: 1; letter-spacing: 0.2em; }
        }
      `}</style>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════
function KraichgauCountdown() {
  const target = new Date('2026-05-31T07:00:00+02:00').getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const delta = Math.max(0, target - now);
  const d = Math.floor(delta / 86400000);
  const h = Math.floor((delta % 86400000) / 3600000);
  const m = Math.floor((delta % 3600000) / 60000);
  const s = Math.floor((delta % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');

  const cell = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 };
  const num = {
    fontFamily: 'Inter Tight, sans-serif', fontWeight: 300,
    fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1, letterSpacing: '-0.03em',
    color: '#F3F1EC', fontVariantNumeric: 'tabular-nums',
  };
  const lbl = {
    fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
    letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B6965',
  };

  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.22em',
        color: '#A8A6A0', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end',
      }}>
        <span style={{ width: 6, height: 6, background: '#2E6BFF', display: 'inline-block' }} />
        IRONMAN 70.3 · KRAICHGAU
      </div>
      <div style={{ display: 'flex', gap: 28, justifyContent: 'flex-end' }}>
        <div style={cell}><div style={num}>{d}</div><div style={lbl}>DAYS</div></div>
        <div style={cell}><div style={num}>{pad(h)}</div><div style={lbl}>HRS</div></div>
        <div style={cell}><div style={num}>{pad(m)}</div><div style={lbl}>MIN</div></div>
        <div style={cell}><div style={num}>{pad(s)}</div><div style={lbl}>SEC</div></div>
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em',
        color: '#6B6965', marginTop: 12,
      }}>31 MAY 2026 · 07:00 CET</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
function HeroLoader({ mounted }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#050506',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: exiting ? 0 : 1,
      pointerEvents: exiting ? 'none' : 'auto',
      transition: 'opacity 600ms cubic-bezier(.22,1,.36,1)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{
          width: 240, height: 1, background: '#F3F1EC',
          transformOrigin: 'left center',
          animation: exiting
            ? 'loaderLineCollapse 600ms cubic-bezier(.22,1,.36,1) forwards'
            : 'loaderLineGrow 1000ms cubic-bezier(.22,1,.36,1) forwards',
        }} />
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: '0.2em', color: '#A8A6A0',
          opacity: 0,
          animation: mounted
            ? 'loaderTextFade 800ms cubic-bezier(.22,1,.36,1) 400ms forwards'
            : 'none',
        }}>
          MAXIMILIAN RICHTER
        </div>
      </div>
    </div>
  );
}
