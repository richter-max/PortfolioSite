// ContactRunner.jsx — 3D runner
// Lädt ein .glb Modell, rendert es mit Three.js, langsame Y-Rotation.
// Camera wird automatisch so positioniert, dass das komplette Modell im Frame ist.
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
      // PBR materials (metallic-roughness) need something to reflect.
      // Without IBL they go flat/grey. RoomEnvironment is the standard
      // neutral studio probe — same look you'd get in Blender's default.
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTexture;

      // ── Lighting ─────────────────────────────────────────────────────
      // Soft white fills only — env map does the heavy lifting for color.
      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
      keyLight.position.set(3, 4, 3);
      scene.add(keyLight);

      // ── Load model ───────────────────────────────────────────────────
      let pivot = null;
      const clock = new THREE.Clock();

      const loader = new GLTFLoader();
      loader.load(
        MODEL_URL,
        (gltf) => {
          if (!mounted) return;

          const model = gltf.scene;

          // 1) Measure original bounding box
          const box    = new THREE.Box3().setFromObject(model);
          const size   = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // 2) Shift model so its CENTER is at origin (0,0,0)
          //    This keeps rotation around the middle of the body.
          model.position.x -= center.x;
          model.position.y -= center.y;
          model.position.z -= center.z;

          // 3) Wrap in pivot group — rotate pivot, model stays put
          pivot = new THREE.Group();
          pivot.add(model);
          scene.add(pivot);

          // 4) Auto-fit camera distance based on model size
          const maxDim  = Math.max(size.x, size.y, size.z);
          const fovRad  = camera.fov * (Math.PI / 180);
          const padding = 1.6; // 1.0 = model fills frame, higher = more space around
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
          pivot.rotation.y += delta * (Math.PI * 2) / 16; // 1 full turn per 16s
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
