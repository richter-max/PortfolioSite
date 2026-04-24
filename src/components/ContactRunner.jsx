// ContactRunner.jsx — 3D runner
// Lädt ein .glb Modell, rendert es mit Three.js, langsame Y-Rotation.
//
// USAGE: <ContactRunner />  (eingebunden in ContactScene.jsx)
//
// MODEL:
// Lädt dein eigenes Modell aus public/models/richter.glb
// Wenn du das Modell anders nennen willst, hier den Pfad ändern.
import { useEffect, useRef } from 'react';

const MODEL_URL = '/models/richter.glb';

export default function ContactRunner() {
  const containerRef = useRef(null);
  const cleanupRef   = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

      if (!mounted || !containerRef.current) return;

      const container = containerRef.current;
      const width  = container.clientWidth;
      const height = container.clientHeight;

      // ── Scene ────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = null; // transparent

      // ── Camera ───────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
      camera.position.set(0, 1.5, 4);
      camera.lookAt(0, 1, 0);

      // ── Renderer ─────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;
      container.appendChild(renderer.domElement);

      // ── Lighting ─────────────────────────────────────────────────────
      // Ambient: soft base fill
      const ambient = new THREE.AmbientLight(0xffffff, 0.35);
      scene.add(ambient);

      // Key light: main directional from front-right
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
      keyLight.position.set(3, 4, 3);
      scene.add(keyLight);

      // Rim light: blue accent from behind (matches your #2E6BFF brand)
      const rimLight = new THREE.DirectionalLight(0x2E6BFF, 1.2);
      rimLight.position.set(-3, 2, -3);
      scene.add(rimLight);

      // Fill: subtle back-bottom bounce
      const fill = new THREE.DirectionalLight(0xffffff, 0.4);
      fill.position.set(-2, -1, 2);
      scene.add(fill);

      // ── Load model ───────────────────────────────────────────────────
      let model = null;
      const clock = new THREE.Clock();

      const loader = new GLTFLoader();
      loader.load(
        MODEL_URL,
        (gltf) => {
          if (!mounted) return;

          model = gltf.scene;

          // Auto-center + scale to fit nicely in view
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2.6 / maxDim; // taller fit for human figure
          model.scale.setScalar(scale);
          model.position.sub(center.multiplyScalar(scale));
          model.position.y = -1.2; // anchor feet near bottom

          scene.add(model);
        },
        undefined,
        (err) => {
          console.error('ContactRunner: failed to load model', err);
        }
      );

      // ── Animation loop: slow Y-rotation like a product showcase ──────
      let rafId;
      function animate() {
        rafId = requestAnimationFrame(animate);
        const delta = clock.getDelta();

        // Slow rotation — ~1 full turn per 16 seconds
        if (model) {
          model.rotation.y += delta * (Math.PI * 2) / 16;
        }

        renderer.render(scene, camera);
      }
      animate();

      // ── Resize ───────────────────────────────────────────────────────
      function onResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onResize);

      // ── Cleanup ──────────────────────────────────────────────────────
      cleanupRef.current = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      };
    }

    init();

    return () => {
      mounted = false;
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 500,
        position: 'relative',
      }}
      aria-hidden="true"
    />
  );
}
