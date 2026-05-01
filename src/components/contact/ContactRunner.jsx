// ContactRunner.jsx — 3D runner
// Lädt das Draco-komprimierte richter.opt.glb (~6 MB statt 55 MB),
// rendert mit Three.js + RoomEnvironment IBL für korrekte PBR-Farben,
// langsame Y-Rotation. Camera fitted automatisch ans Modell.
import { useEffect, useRef } from 'react';

const MODEL_URL  = '/models/richter.opt.glb';
const DRACO_PATH = '/draco/';

export default function ContactRunner() {
  const containerRef = useRef(null);
  const cleanupRef   = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const THREE = await import('three');
      const { GLTFLoader }  = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');

      if (!mounted || !containerRef.current) return;

      const container = containerRef.current;
      const width  = container.clientWidth;
      const height = container.clientHeight;

      // ── Scene ────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = null;

      // ── Camera (temp values, repositioned after model loads) ─────────
      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);

      // ── Renderer ─────────────────────────────────────────────────────
      // NoToneMapping bewahrt die GLB-Farben 1:1 — kein ACES-Roll-Off, der
      // gesättigte Farben Richtung grau zieht.
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      container.appendChild(renderer.domElement);

      // ── Environment (IBL) ────────────────────────────────────────────
      // PBR-Materialien (metallic-roughness) brauchen ein Env-Map zum
      // Reflektieren — sonst werden sie flach/grau. fromScene() geht den
      // Cubemap-Pfad. Equirect-Shader NICHT precompilen — auf manchen
      // Mac/Chrome-ANGLE-GPUs rendert das die Probe grau.
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;
      pmrem.dispose();

      // ── Lighting ─────────────────────────────────────────────────────
      // Hemisphere-Light als farb-sicherer Fallback, falls eine GPU die
      // Env-Probe schwach gewichtet — Materialien bleiben so nie komplett
      // grau. Key + Fill geben Form, kein blauer Rim mehr (verfälscht).
      const hemi = new THREE.HemisphereLight(0xffffff, 0xb8b6b0, 0.55);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
      keyLight.position.set(3, 4, 3);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-2, 1, -2);
      scene.add(fillLight);

      // ── Loader: GLTF + Draco decoder (lokal in /public/draco) ────────
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(DRACO_PATH);
      dracoLoader.setDecoderConfig({ type: 'js' });

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      // ── Load model ───────────────────────────────────────────────────
      let pivot = null;
      const clock = new THREE.Clock();

      loader.load(
        MODEL_URL,
        (gltf) => {
          if (!mounted) return;

          const model = gltf.scene;

          // sRGB für Color-Maps + Env-Beitrag forcieren — verhindert den
          // "grey on desktop, fine on mobile"-Drift, wo manche GPUs die
          // Env-Probe unter-gewichten.
          model.traverse((child) => {
            if (!child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const m of mats) {
              if ('envMapIntensity' in m) m.envMapIntensity = 1.2;
              if (m.map)         m.map.colorSpace         = THREE.SRGBColorSpace;
              if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
              m.needsUpdate = true;
            }
          });

          // 1) Bounding Box messen
          const box    = new THREE.Box3().setFromObject(model);
          const size   = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // 2) Modell zentrieren — Rotation läuft um den Körpermittelpunkt
          model.position.x -= center.x;
          model.position.y -= center.y;
          model.position.z -= center.z;

          // 3) Pivot-Group für Rotation
          pivot = new THREE.Group();
          pivot.add(model);
          scene.add(pivot);

          // 4) Camera auto-fit — Distanz aus Bounding-Box + FOV
          const maxDim   = Math.max(size.x, size.y, size.z);
          const fovRad   = camera.fov * (Math.PI / 180);
          const padding  = 1.6;
          const distance = (maxDim / 2) / Math.tan(fovRad / 2) * padding;

          camera.position.set(0, 0, distance);
          camera.lookAt(0, 0, 0);
          camera.near = distance / 100;
          camera.far  = distance * 100;
          camera.updateProjectionMatrix();
        },
        undefined,
        (err) => {
          console.error('ContactRunner: failed to load model', err);
        }
      );

      // ── Animation loop ───────────────────────────────────────────────
      let rafId;
      function animate() {
        rafId = requestAnimationFrame(animate);
        const delta = clock.getDelta();

        if (pivot) {
          pivot.rotation.y += delta * (Math.PI * 2) / 16; // 1 Umdrehung / 16 s
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
        dracoLoader.dispose();
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
