'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { DeskObject } from '../DeskSection';
import DeskObjectMesh from './DeskObjectMesh';

interface DeskSceneProps {
  mouse: { x: number; y: number };
  selected: DeskObject;
  onSelect: (obj: DeskObject) => void;
}

// Desk object layout configuration
const OBJECTS: {
  id: DeskObject;
  model: string;
  fallback: 'box' | 'cylinder' | 'sphere' | 'torus';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  fallbackColor: string;
  fallbackSize: [number, number, number];
}[] = [
  {
    id: 'computer',
    model: '/assets/computer.glb',
    fallback: 'box',
    position: [0.3, 1.1, 0],
    rotation: [0, -0.2, 0],
    scale: 1.0,
    fallbackColor: '#4a9eff',
    fallbackSize: [1.5, 0.12, 1.0],
  },
  {
    id: 'book',
    model: '/assets/thin-book.glb',
    fallback: 'box',
    position: [-2.2, 0.95, 0.5],
    rotation: [0, 0.3, 0],
    scale: 0.9,
    fallbackColor: '#8b6b3d',
    fallbackSize: [0.8, 0.12, 1.1],
  },
  {
    id: 'stickynotes',
    model: '/assets/sticky-notes.glb',
    fallback: 'box',
    position: [2.2, 0.95, -0.2],
    rotation: [0, -0.25, 0],
    scale: 0.85,
    fallbackColor: '#f5e642',
    fallbackSize: [0.7, 0.08, 0.7],
  },
  {
    id: 'trophy',
    model: '/assets/trophy.glb',
    fallback: 'cylinder',
    position: [-2.0, 0.95, -1.6],
    rotation: [0, 0.5, 0],
    scale: 0.75,
    fallbackColor: '#f0a832',
    fallbackSize: [0.35, 0.35, 0.9],
  },
  {
    id: 'flashdrive',
    model: '/assets/flash-drive.glb',
    fallback: 'box',
    position: [2.5, 0.95, -1.5],
    rotation: [0, -0.6, 0],
    scale: 0.8,
    fallbackColor: '#00d4aa',
    fallbackSize: [0.5, 0.25, 0.18],
  },
  {
    id: 'coffeecup',
    model: '/assets/coffee-cup.glb',
    fallback: 'cylinder',
    position: [-1.0, 0.95, -2.0],
    rotation: [0, 0.1, 0],
    scale: 0.8,
    fallbackColor: '#c8841a',
    fallbackSize: [0.22, 0.22, 0.45],
  },
  {
    id: 'phone',
    model: '/assets/phone.glb',
    fallback: 'box',
    position: [1.8, 0.95, 1.6],
    rotation: [0, -0.8, 0],
    scale: 0.85,
    fallbackColor: '#1a1a2e',
    fallbackSize: [0.38, 0.08, 0.75],
  },
];

export default function DeskScene({ mouse, selected, onSelect }: DeskSceneProps) {
  const { camera } = useThree();
  const mouseRef = useRef(mouse);
  const basePos = useRef<THREE.Vector3>(new THREE.Vector3(0, 8, 12));
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 8, 12));
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    mouseRef.current = mouse;
  }, [mouse]);

  useFrame((state, delta) => {
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // Subtle parallax — camera drifts slightly with mouse
    targetPos.current.set(
      basePos.current.x + mx * 0.6,
      basePos.current.y + my * 0.3,
      basePos.current.z
    );

    (camera as THREE.PerspectiveCamera).position.lerp(targetPos.current, delta * 1.5);
    camera.lookAt(0, 0.5, -1.0);
  });

  // Try to load desk GLB — fallback to plane if missing
  const deskGLB = useSafeGLTF('/assets/adjustable-desk.glb');

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#ffe4c4" />
      {/* Warm key light from top-left */}
      <pointLight
        position={[-5, 10, 4]}
        intensity={30}
        color="#ffcc88"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Soft cool fill */}
      <pointLight position={[6, 5, 6]} intensity={8} color="#aaddff" />
      {/* Subtle rim from back */}
      <pointLight position={[0, 3, -8]} intensity={4} color="#ff8833" />

      {/* Floor plane */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0d0d18" roughness={0.9} />
      </mesh>

      {/* Desk base */}
      {deskGLB ? (
        <primitive
          object={deskGLB.scene.clone()}
          position={[0, 0, 0]}
          scale={1.0}
          castShadow
          receiveShadow
        />
      ) : (
        <DeskFallback />
      )}

      {/* Interactive objects */}
      {OBJECTS.map((obj) => (
        <DeskObjectMesh
          key={obj.id}
          id={obj.id}
          modelPath={obj.model}
          fallbackType={obj.fallback}
          fallbackColor={obj.fallbackColor}
          fallbackSize={obj.fallbackSize}
          position={obj.position}
          rotation={obj.rotation}
          scale={obj.scale}
          isSelected={selected === obj.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

// Safe GLB loader — returns null if file not found
function useSafeGLTF(path: string) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGLTF(path);
  } catch {
    return null;
  }
}

// Fallback desk geometry
function DeskFallback() {
  return (
    <group position={[0, 0, 0]}>
      {/* Desk surface */}
      <mesh receiveShadow castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[7.5, 0.08, 4.5]} />
        <meshStandardMaterial color="#3d2b1a" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Desk legs */}
      {[[-3.4, -2.8], [3.4, -2.8], [-3.4, 2.3], [3.4, 2.3]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.45, z]}>
          <boxGeometry args={[0.12, 0.9, 0.12]} />
          <meshStandardMaterial color="#2a1f14" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// Preload all GLBs
OBJECTS.forEach((o) => {
  try { useGLTF.preload(o.model); } catch { /* ignore */ }
});
try { useGLTF.preload('/assets/adjustable-desk.glb'); } catch { /* ignore */ }
