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
      // NoToneMapping mit konservativ dosiertem Licht: Summe aller Beiträge
      // bleibt unter 1.0, damit nichts zu Weiss clippt — und die Foto-
      // Textur (Haut, Haare, Sneakers) erscheint 1:1 wie im JPEG.
      // AgX hatte zwar nicht geclippt, aber sein Sättigungs-Roll-Off zog
      // Hauttöne und Sneakers-Farben merkbar Richtung grau.
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
      // RoomEnvironment liefert diffuse + specular IBL — übernimmt das
      // Ambient. Kein HemisphereLight zusätzlich, das würde doppelt-
      // belichten und Farben Richtung Weiss schieben.
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;
      pmrem.dispose();

      // ── Lighting ─────────────────────────────────────────────────────
      // Schmaler Licht-Budget: Key 0.5 + Fill 0.15 = max 0.65 direkter
      // Beitrag, plus IBL-Diffuse via envMapIntensity (0.4 unten am
      // Material gesetzt) ≈ 0.3 — Summe bleibt unter 1.0, kein Clipping.
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
      keyLight.position.set(3, 4, 3);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
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

          // Tripo exportiert metallicFactor=1 — die ORM-Textur hat zwar B≈0
          // (per-Pixel-Metalness ≈ 0), wir überschreiben den Faktor trotzdem
          // defensiv. roughness 0.6 lässt Haut + Sneakers leicht "poppen"
          // (etwas Specular-Glanz statt komplett matt). envMapIntensity 0.4
          // hält die IBL-Reflexionen unter dem Clipping-Budget.
          model.traverse((child) => {
            if (!child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const m of mats) {
              if ('metalness' in m)  m.metalness = 0;
              if ('roughness' in m)  m.roughness = 0.6;
              if ('envMapIntensity' in m) m.envMapIntensity = 0.4;
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
