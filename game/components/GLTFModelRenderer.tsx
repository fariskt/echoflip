'use client';

import React, { useMemo, Component, ReactNode } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import type { FurnitureCategory } from '../../types/renovation';
import { calculateModelNormalization } from '../utils/modelNormalizer';

interface GLTFModelRendererProps {
  modelPath: string;
  category?: FurnitureCategory;
  assetId?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  userData?: Record<string, any>;
  isSelected?: boolean;
  isGhost?: boolean;
  ghostColor?: string;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

class GLTFErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('GLTF Model load error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function InnerGLTFModel({
  modelPath,
  category = 'seating',
  assetId = '',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  userData = {},
  isSelected = false,
  isGhost = false,
  ghostColor = '#22c55e',
  onClick
}: GLTFModelRendererProps) {
  const { scene } = useGLTF(modelPath);

  // Measure bounding box and compute normalized scaling + floor offset
  const normalization = useMemo(() => {
    return calculateModelNormalization(scene, modelPath, category, assetId);
  }, [scene, modelPath, category, assetId]);

  // Clone scene so multiple instances of the same model can exist independently in Three.js
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Apply materials, shadows, and userData to child meshes
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = !isGhost;
        mesh.receiveShadow = !isGhost;

        if (userData) {
          mesh.userData = { ...mesh.userData, ...userData };
        }

        if (isGhost) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(ghostColor),
            transparent: true,
            opacity: 0.65,
            roughness: 0.5
          });
        }
      }
    });

    return clone;
  }, [scene, userData, isGhost, ghostColor]);

  // Calculate final combined scale (user scale multiplier * normalized scale)
  const normScale = normalization.normalizedScale;
  const finalScale: [number, number, number] = [
    scale[0] * normScale,
    scale[1] * normScale,
    scale[2] * normScale
  ];

  // Local Y shift to align lowest vertex of model to floor Y = 0 with a 0.03m floor elevation cushion
  const localYShift = -normalization.minY + 0.03;

  return (
    <group
      position={position}
      rotation={rotation}
      scale={finalScale}
      userData={userData}
      onClick={onClick}
    >
      {/* Active selection outline bounding box matching normalized dimensions */}
      {isSelected && (
        <mesh position={[0, normalization.originalDimensions.height / 2 + 0.03, 0]}>
          <boxGeometry args={[
            normalization.originalDimensions.width * 1.05,
            normalization.originalDimensions.height * 1.05,
            normalization.originalDimensions.depth * 1.05
          ]} />
          <meshBasicMaterial color="#38bdf8" wireframe={true} />
        </mesh>
      )}

      {/* Model primitive shifted locally so lowest vertex sits on Y = 0 */}
      <primitive object={clonedScene} position={[0, localYShift, 0]} />
    </group>
  );
}

export const GLTFModelRenderer: React.FC<GLTFModelRendererProps> = (props) => {
  const fallbackBox = (
    <group position={props.position} rotation={props.rotation} scale={props.scale} userData={props.userData} onClick={props.onClick}>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={props.isSelected ? '#38bdf8' : '#10b981'} roughness={0.5} />
      </mesh>
    </group>
  );

  if (!props.modelPath) {
    return fallbackBox;
  }

  return (
    <GLTFErrorBoundary fallback={fallbackBox}>
      <React.Suspense fallback={fallbackBox}>
        <InnerGLTFModel {...props} />
      </React.Suspense>
    </GLTFErrorBoundary>
  );
};
