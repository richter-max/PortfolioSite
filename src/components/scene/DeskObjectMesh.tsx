'use client';

import { useRef, useState } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { DeskObject } from '../DeskSection';

interface DeskObjectMeshProps {
  id: DeskObject;
  modelPath: string;
  fallbackType: 'box' | 'cylinder' | 'sphere' | 'torus';
  fallbackColor: string;
  fallbackSize: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  isSelected: boolean;
  onSelect: (id: DeskObject) => void;
}

export default function DeskObjectMesh({
  id,
  modelPath,
  fallbackType,
  fallbackColor,
  fallbackSize,
  position,
  rotation,
  scale,
  isSelected,
  onSelect,
}: DeskObjectMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Easter egg refs
  const trophyRotation = useRef(0);
  const flashDriveRotation = useRef(0);
  const bookTilt = useRef(0);
  const coffeeTime = useRef(0);
  const phoneWake = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const group = groupRef.current;
    const t = state.clock.elapsedTime;

    // Hover scale animation
    const targetScale = hovered || isSelected ? scale * 1.09 : scale;
    const currentScale = group.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * delta * 8;
    group.scale.setScalar(newScale);

    // Subtle floating when hovered
    if (hovered) {
      group.position.y = position[1] + Math.sin(t * 3) * 0.03;
    } else {
      group.position.y += (position[1] - group.position.y) * delta * 5;
    }

    // === Easter eggs ===

    // Trophy: slow spin always
    if (id === 'trophy') {
      trophyRotation.current += delta * 0.4;
      group.rotation.y = rotation[1] + trophyRotation.current;
    }

    // Flash drive: slow Y rotation
    if (id === 'flashdrive') {
      flashDriveRotation.current += delta * 0.3;
      group.rotation.y = rotation[1] + Math.sin(flashDriveRotation.current) * 0.5;
    }

    // Book: subtle tilt on hover
    if (id === 'book') {
      const targetTilt = hovered ? 0.15 : 0;
      bookTilt.current += (targetTilt - bookTilt.current) * delta * 4;
      group.rotation.z = bookTilt.current;
    }

    // Phone: screen wake effect (extra tilt toward camera when hovered)
    if (id === 'phone') {
      const targetPhone = hovered ? -0.35 : 0;
      phoneWake.current += (targetPhone - phoneWake.current) * delta * 5;
      group.rotation.x = phoneWake.current;
    }
  });

  // Try to load GLB, use fallback if not available
  const glb = useSafeGLTF(modelPath);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(id);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {glb ? (
        <GLBModel glb={glb} hovered={hovered} isSelected={isSelected} />
      ) : (
        <FallbackMesh
          type={fallbackType}
          color={fallbackColor}
          size={fallbackSize}
          hovered={hovered}
          isSelected={isSelected}
        />
      )}

      {/* Coffee cup steam particles */}
      {id === 'coffeecup' && <SteamEffect />}

      {/* Phone screen glow */}
      {id === 'phone' && <PhoneScreen hovered={hovered} />}
    </group>
  );
}

// GLB model with non-destructive highlight
function GLBModel({ glb, hovered, isSelected }: {
  glb: any;
  hovered: boolean;
  isSelected: boolean;
}) {
  if (!glb || !glb.scene) return null;
  const clone = glb.scene.clone();

  clone.traverse((node: THREE.Object3D) => {
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  return (
    <group>
      <primitive object={clone} />
      {/* Non-destructive highlight */}
      {(hovered || isSelected) && (
        <pointLight position={[0, 0.5, 0]} distance={1.5} intensity={2} color="#4a9eff" />
      )}
    </group>
  );
}

// Fallback geometry when GLB not found
function FallbackMesh({ type, color, size, hovered, isSelected }: {
  type: string;
  color: string;
  size: [number, number, number];
  hovered: boolean;
  isSelected: boolean;
}) {
  const emissiveIntensity = hovered ? 0.3 : isSelected ? 0.5 : 0;

  const material = (
    <meshStandardMaterial
      color={color}
      roughness={0.4}
      metalness={0.2}
      emissive={hovered || isSelected ? '#4a9eff' : '#000000'}
      emissiveIntensity={emissiveIntensity}
    />
  );

  if (type === 'cylinder') {
    return (
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[size[0], size[1], size[2], 32]} />
        {material}
      </mesh>
    );
  }

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={size} />
      {material}
    </mesh>
  );
}

// Steam particles for coffee cup
function SteamEffect() {
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.children.forEach((child, i) => {
      const t = (state.clock.elapsedTime * 0.5 + i * 0.4) % 1;
      child.position.y = 0.3 + t * 0.5;
      child.position.x = Math.sin(t * Math.PI * 2 + i) * 0.05;
      (child as THREE.Mesh).material && ((child as THREE.Mesh & { material: THREE.MeshStandardMaterial }).material.opacity = Math.sin(t * Math.PI) * 0.4);
    });
  });

  return (
    <group ref={particlesRef} position={[0, 0.25, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, i * 0.15, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color="#aaddff"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Phone screen glow
function PhoneScreen({ hovered }: { hovered: boolean }) {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!screenRef.current) return;
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    const targetIntensity = hovered ? 0.8 : 0.1;
    mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * delta * 6;
  });

  return (
    <mesh ref={screenRef} position={[0, 0.05, 0]}>
      <boxGeometry args={[0.34, 0.02, 0.69]} />
      <meshStandardMaterial
        color="#1a2a4a"
        emissive="#4a9eff"
        emissiveIntensity={0.1}
        roughness={0.1}
        metalness={0.5}
      />
    </mesh>
  );
}

// Safe GLB loader hook
function useSafeGLTF(path: string): ReturnType<typeof useGLTF> | null {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGLTF(path);
  } catch {
    return null;
  }
}
