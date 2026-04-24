// HeroScene.jsx — Hero WebGL landscape
// - Allgäu-inspired layered mountain silhouettes (5 parallax ridges)
// - Dark night sky with subtle stars
// - Drifting fog between ridges
// - Runner silhouette (your .glb) — walks across mid-ground on scroll
// - Camera dolly-in as user scrolls (200vh outer → 100vh sticky inner)
// - Name + role text overlay (no scroll scatter, stays visible)
// - Countdown preserved
import { useEffect, useRef, useState } from 'react';

const MODEL_URL = '/models/richter.glb';

export default function HeroScene() {
  const [mounted, setMounted]       = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const outerRef  = useRef(null);
  const canvasRef = useRef(null);
  const stateRef  = useRef({ scrollProgress: 0 }); // shared with render loop

  // ── Loader timing ─────────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 60);
    const t2 = setTimeout(() => setLoaderGone(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Scroll tracking (drives camera + runner position) ────────────────
  useEffect(() => {
    let rafId = null;

    function compute() {
      const outer = outerRef.current;
      if (!outer) return;
      const rect   = outer.getBoundingClientRect();
      const total  = outer.offsetHeight - window.innerHeight;
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

  // ── Name entrance (chars stagger) ─────────────────────────────────────
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

  // ── WebGL Scene ───────────────────────────────────────────────────────
  useEffect(() => {
    let cleanup = () => {};
    let mountedFlag = true;

    async function initWebGL() {
      const THREE         = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      if (!mountedFlag || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const width  = window.innerWidth;
      const height = window.innerHeight;

      // ── Scene + Fog ────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#050506');
      scene.fog = new THREE.FogExp2('#060610', 0.003);

      // ── Camera ─────────────────────────────────────────────────────
      // Slight downward tilt, positioned at "standing" eye height
      const camera = new THREE.PerspectiveCamera(
        45, width / height, 0.1, 2000
      );
      camera.position.set(0, 22, 80);
      camera.lookAt(0, 28, 0);

      // ── Renderer ───────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.8;

      // ── Sky: subtle gradient via large sphere ──────────────────────
      const skyGeo = new THREE.SphereGeometry(1000, 32, 16);
      const skyMat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          topColor:    { value: new THREE.Color('#0a0d18') },
          bottomColor: { value: new THREE.Color('#020204') },
          offset:      { value: 100 },
          exponent:    { value: 0.6 },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
          }
        `,
      });
      const sky = new THREE.Mesh(skyGeo, skyMat);
      scene.add(sky);

      // ── Stars ──────────────────────────────────────────────────────
      const starCount = 800;
      const starGeo   = new THREE.BufferGeometry();
      const starPos   = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        // Distribute in upper hemisphere
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.random() * Math.PI * 0.5;
        const r     = 600 + Math.random() * 200;
        starPos[i*3]     = r * Math.sin(phi) * Math.cos(theta);
        starPos[i*3 + 1] = r * Math.cos(phi);
        starPos[i*3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: '#E8E5DC',
        size: 2.2,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.85,
        fog: false,
      });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      // ── Mountain ridges (Allgäu silhouettes) ───────────────────────
      // Generate several flat "planes" at increasing distances, each
      // with a displaced top edge — like a layered paper cutout.
      function makeRidge({ distance, height, variation, color, segments = 80 }) {
        const geo = new THREE.BufferGeometry();
        const positions = [];
        const indices   = [];

        const width = distance * 2.5; // ridge spans wider than camera view
        const halfW = width / 2;

        // Top vertices (displaced) + bottom vertices (flat)
        // We'll build a strip that covers screen width
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const x = -halfW + t * width;

          // Multi-octave noise-ish height
          const y1 = Math.sin(t * Math.PI * 3.2 + distance * 0.5) * variation;
          const y2 = Math.sin(t * Math.PI * 7.5 + distance * 1.1) * variation * 0.4;
          const y3 = Math.sin(t * Math.PI * 13  + distance * 2.3) * variation * 0.2;
          const topY = height + y1 + y2 + y3;

          positions.push(x, topY, -distance);        // top vertex
          positions.push(x, -40,  -distance);        // bottom vertex
        }

        // Build triangle strip as index pairs
        for (let i = 0; i < segments; i++) {
          const a = i * 2;
          const b = i * 2 + 1;
          const c = i * 2 + 2;
          const d = i * 2 + 3;
          indices.push(a, b, c);
          indices.push(b, d, c);
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();

        const mat = new THREE.MeshBasicMaterial({
          color,
          fog: true,
        });
        return new THREE.Mesh(geo, mat);
      }

      // Five ridges from far to near, each darker toward camera
      const ridges = [
        makeRidge({ distance: 320, height: 58, variation: 22, color: '#2a3350' }),
        makeRidge({ distance: 240, height: 48, variation: 20, color: '#1e2540' }),
        makeRidge({ distance: 170, height: 38, variation: 18, color: '#141a30' }),
        makeRidge({ distance: 110, height: 28, variation: 14, color: '#0b0f20' }),
        makeRidge({ distance: 60,  height: 18, variation: 10, color: '#05070f' }),
      ];
      ridges.forEach(r => scene.add(r));

      // ── Ground plane (dark) ────────────────────────────────────────
      const groundGeo = new THREE.PlaneGeometry(1000, 1000);
      const groundMat = new THREE.MeshBasicMaterial({
        color: '#03030a',
        fog: true,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -1;
      scene.add(ground);

      // ── Fog particles (drifting mist between ridges) ───────────────
      const mistCount = 120;
      const mistGeo = new THREE.BufferGeometry();
      const mistPos = new Float32Array(mistCount * 3);
      const mistPhase = new Float32Array(mistCount);
      for (let i = 0; i < mistCount; i++) {
        mistPos[i*3]     = (Math.random() - 0.5) * 400;
        mistPos[i*3 + 1] = Math.random() * 30 + 4;
        mistPos[i*3 + 2] = -Math.random() * 250 - 40;
        mistPhase[i]     = Math.random() * Math.PI * 2;
      }
      mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
      const mistMat = new THREE.PointsMaterial({
        color: '#2a3048',
        size: 24,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      });
      const mist = new THREE.Points(mistGeo, mistMat);
      scene.add(mist);

      // ── Runner silhouette (from .glb) ──────────────────────────────
      // Loads in background, appears once ready.
      let runner = null;
      let runnerStartZ = -50;   // where runner spawns (in front of closest ridge)
      let runnerEndZ   = -30;   // where runner ends
      let runnerBaseY  = 0;

      const loader = new GLTFLoader();
      loader.load(
        MODEL_URL,
        (gltf) => {
          if (!mountedFlag) return;
          runner = gltf.scene;

          // Make it a pure silhouette (flat black material)
          runner.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshBasicMaterial({
                color: '#000000',
                fog: true,
              });
            }
          });

          // Scale + position
          const box    = new THREE.Box3().setFromObject(runner);
          const size   = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const scale  = 22 / size.y; // 22 units tall in world space
          runner.scale.setScalar(scale);

          // Center horizontally, ground feet
          runner.position.x = -(center.x * scale);
          runner.position.y = -(box.min.y * scale); // feet on ground
          runner.position.z = runnerStartZ;
          runnerBaseY = runner.position.y;

          // Face "into" the scene (runner runs to the right visually)
          runner.rotation.y = Math.PI / 2;

          scene.add(runner);
        },
        undefined,
        (err) => console.error('HeroScene: model load failed', err)
      );

      // ── Animation loop ─────────────────────────────────────────────
      const clock = new THREE.Clock();
      let rafId;

      function animate() {
        rafId = requestAnimationFrame(animate);
        const t     = clock.getElapsedTime();
        const delta = clock.getDelta();
        const p     = stateRef.current.scrollProgress; // 0 → 1

        // Camera dolly — moves forward + slightly up on scroll
        camera.position.z = 80 - p * 40;  // 80 → 40
        camera.position.y = 22 + p * 8;   // 22 → 30
        camera.lookAt(0, 28 + p * 4, -20);

        // Fog thickens slightly on scroll
        scene.fog.density = 0.003 + p * 0.003;

        // Stars: slow drift
        stars.rotation.y = t * 0.003;

        // Mist: gentle horizontal drift + vertical bob
        const mistPositions = mist.geometry.attributes.position.array;
        for (let i = 0; i < mistCount; i++) {
          mistPositions[i*3]     += Math.sin(t * 0.1 + mistPhase[i]) * 0.04;
          mistPositions[i*3 + 1] += Math.sin(t * 0.3 + mistPhase[i] * 1.7) * 0.03;
          // wrap horizontally
          if (mistPositions[i*3] > 200)  mistPositions[i*3] = -200;
          if (mistPositions[i*3] < -200) mistPositions[i*3] = 200;
        }
        mist.geometry.attributes.position.needsUpdate = true;

        // Runner: walks left → right across mid-ground based on scroll
        if (runner) {
          // X position: enters from left, walks across
          // Scroll 0.1 → 0.7 is the "active walk" window
          const walkP = Math.min(Math.max((p - 0.1) / 0.6, 0), 1);
          runner.position.x = -40 + walkP * 80; // -40 → 40
          runner.position.z = runnerStartZ + walkP * (runnerEndZ - runnerStartZ);

          // Subtle bob to simulate stride (since model is static)
          runner.position.y = runnerBaseY + Math.sin(t * 4) * 0.25;

          // Face direction of travel (runs to the right = rotate Y to +π/2)
          runner.rotation.y = Math.PI / 2;

          // Fade in / out at edges
          const opacity =
            walkP < 0.1 ? walkP / 0.1 :
            walkP > 0.9 ? (1 - walkP) / 0.1 : 1;
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

      {/* Outer 200vh — gives scroll room for dolly + runner walk */}
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
        }}>

          {/* WebGL canvas — fills everything */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              display: 'block',
            }}
          />

          {/* Bottom gradient for text legibility */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to top, rgba(5,5,6,0.8) 0%, rgba(5,5,6,0.3) 35%, transparent 55%)',
            zIndex: 2,
          }} />

          {/* Content */}
          <div style={{
            position: 'absolute',
            bottom: 80,
            left: 40, right: 40,
            zIndex: 3,
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
            zIndex: 3,
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
