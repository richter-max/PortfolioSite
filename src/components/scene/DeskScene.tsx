'use client';

import { useEffect, useRef, Suspense } from 'react';
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
    position: [0, 1.4, 0],
    rotation: [0, 0, 0],
    scale: 2.0,
    fallbackColor: '#4a9eff',
    fallbackSize: [1.5, 0.12, 1.0],
  },
  {
    id: 'book',
    model: '/assets/thin-book.glb',
    fallback: 'box',
    position: [-2.5, 1.4, 0.8],
    rotation: [0, 0.3, 0],
    scale: 1.5,
    fallbackColor: '#8b6b3d',
    fallbackSize: [0.8, 0.12, 1.1],
  },
  {
    id: 'stickynotes',
    model: '/assets/sticky-notes.glb',
    fallback: 'box',
    position: [2.5, 1.4, 0.5],
    rotation: [0, -0.3, 0],
    scale: 1.2,
    fallbackColor: '#f5e642',
    fallbackSize: [0.7, 0.08, 0.7],
  },
  {
    id: 'trophy',
    model: '/assets/trophy.glb',
    fallback: 'cylinder',
    position: [-2.2, 1.4, -2.0],
    rotation: [0, 0.5, 0],
    scale: 1.2,
    fallbackColor: '#f0a832',
    fallbackSize: [0.35, 0.35, 0.9],
  },
  {
    id: 'flashdrive',
    model: '/assets/flash-drive.glb',
    fallback: 'box',
    position: [2.8, 1.4, -1.8],
    rotation: [0, -0.6, 0],
    scale: 1.2,
    fallbackColor: '#00d4aa',
    fallbackSize: [0.5, 0.25, 0.18],
  },
  {
    id: 'coffeecup',
    model: '/assets/coffee-cup.glb',
    fallback: 'cylinder',
    position: [2.0, 1.4, -2.5],
    rotation: [0, 0.1, 0],
    scale: 1.4,
    fallbackColor: '#c8841a',
    fallbackSize: [0.22, 0.22, 0.45],
  },
  {
    id: 'phone',
    model: '/assets/phone.glb',
    fallback: 'box',
    position: [1.8, 1.4, 1.6],
    rotation: [0, -0.8, 0],
    scale: 1.4,
    fallbackColor: '#1a1a2e',
    fallbackSize: [0.38, 0.08, 0.75],
  },
];

export default function DeskScene({ mouse, selected, onSelect }: DeskSceneProps) {
  const { camera } = useThree();
  const mouseRef = useRef(mouse);
  const basePos = useRef<THREE.Vector3>(new THREE.Vector3(0, 15, 20));
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 15, 20));
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
    camera.lookAt(0, 0, 0);
  });

  // Floor plane
  // Floor plane
  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={1.5} color="#ffe4c4" />
      <directionalLight position={[-5, 10, 5]} intensity={3.5} castShadow />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#aaddff" />

      {/* Desk base with Suspense */}
      <Suspense fallback={<DeskFallback />}>
        <DeskModel />
      </Suspense>

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

function DeskModel() {
  const { scene } = useGLTF('/assets/adjustable-desk.glb');
  const clone = scene.clone();
  
  clone.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return (
    <primitive
      object={clone}
      position={[0, -0.5, 0]}
      scale={8.0}
    />
  );
}

function DeskFallback() {
  return (
    <mesh position={[0, -5, 0]} receiveShadow>
      <boxGeometry args={[40, 10, 25]} />
      <meshStandardMaterial color="#221100" />
    </mesh>
  );
}

// Preload all GLBs
OBJECTS.forEach((o) => {
  try { useGLTF.preload(o.model); } catch { /* ignore */ }
});
try { useGLTF.preload('/assets/adjustable-desk.glb'); } catch { /* ignore */ }
