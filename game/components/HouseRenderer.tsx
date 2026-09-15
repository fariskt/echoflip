import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useRenovationStore } from '../../stores/renovationStore';
import { validatePlacement } from '../utils/placementValidation';
import { GLTFModelRenderer } from './GLTFModelRenderer';
import { PRELOADED_ASSETS } from '../core/assetRegistry';
import { TransformControls } from '@react-three/drei';

interface HouseRendererProps {
  pointerPosition?: THREE.Vector3 | null;
  pointerNormal?: THREE.Vector3 | null;
  pointerHitUserData?: Record<string, any> | null;
}

function resolveModelPath(item: { modelPath?: string; meshName?: string }): string {
  if (item.modelPath) return item.modelPath;
  const name = item.meshName || '';
  const match = PRELOADED_ASSETS.find((a) => a.name === name || a.name.toLowerCase() === name.toLowerCase());
  return match?.url || '';
}

const MinecraftPopWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const groupRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef<number>(Date.now());

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = (Date.now() - startTimeRef.current) / 150;
    if (elapsed <= 1) {
      const popScale = 0.75 + 0.38 * Math.sin(elapsed * Math.PI * 0.75) - 0.13 * Math.pow(elapsed, 2);
      const s = Math.max(0.75, Math.min(1.08, popScale));
      groupRef.current.scale.set(s, s, s);
    } else {
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

const MinecraftGhostBlockPreview: React.FC<{
  dimensions?: [number, number, number];
  color?: string;
  isValid?: boolean;
}> = ({
  dimensions = [1.0, 1.0, 1.0],
  color = '#cbd5e1',
  isValid = true
}) => {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame(({ clock }) => {
      if (materialRef.current) {
        // 60FPS Pulsing glass animation matching the Minecraft preview image
        const pulseOpacity = 0.45 + 0.25 * Math.sin(clock.getElapsedTime() * 5.0);
        materialRef.current.opacity = pulseOpacity;
      }
    });

    const previewColor = isValid ? (color || '#cbd5e1') : '#ef4444';
    const width = dimensions[0] || 1.0;
    const height = dimensions[1] || 1.0;
    const depth = dimensions[2] || 1.0;

    return (
      <group>
        {/* Translucent Glass Cube Fill */}
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            ref={materialRef}
            color={previewColor}
            transparent={true}
            opacity={0.5}
            depthWrite={false}
            roughness={0.2}
          />
        </mesh>

        {/* Black 3D Bounding Box Wireframe Outline around 12 Edges */}
        <lineSegments position={[0, height / 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.002, height * 1.002, depth * 1.002)]} />
          <lineBasicMaterial color={isValid ? '#0f172a' : '#ef4444'} linewidth={2} />
        </lineSegments>
      </group>
    );
  };

export const HouseRenderer: React.FC<HouseRendererProps> = ({
  pointerPosition,
  pointerNormal,
  pointerHitUserData
}) => {
  const { camera } = useThree();
  const furnitureGhostRef = useRef<THREE.Group>(null);
  const furnitureGhostMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const wallGhostRef = useRef<THREE.Group>(null);
  const wallGhostMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const targetPointerRef = useRef<THREE.Group>(null);
  const targetGridCellMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const targetVecRef = useRef(new THREE.Vector3());
  const isValidPlacementRef = useRef<boolean>(true);
  const [isValidPlacement, setIsValidPlacement] = useState<boolean>(true);

  const activeProperty = useRenovationStore((state) => state.activeProperty);
  const equippedTool = useRenovationStore((state) => state.equippedTool);
  const selectedFurniture = useRenovationStore((state) => state.selectedFurniture);
  const selectedWallBlock = useRenovationStore((state) => state.selectedWallBlock);
  const placementRotation = useRenovationStore((state) => state.placementRotation);

  const scrubDirtStain = useRenovationStore((state) => state.scrubDirtStain);
  const paintWallSegment = useRenovationStore((state) => state.paintWallSegment);
  const changeFlooring = useRenovationStore((state) => state.changeFlooring);
  const repairFixture = useRenovationStore((state) => state.repairFixture);
  const demolishWall = useRenovationStore((state) => state.demolishWall);
  const buildWall = useRenovationStore((state) => state.buildWall);
  const placeFurniture = useRenovationStore((state) => state.placeFurniture);

  const selectedPlacedFurnitureId = useRenovationStore((state) => state.selectedPlacedFurnitureId);
  const setSelectedPlacedFurnitureId = useRenovationStore((state) => state.setSelectedPlacedFurnitureId);

  const selectedPlacedWallId = useRenovationStore((state) => state.selectedPlacedWallId);
  const setSelectedPlacedWallId = useRenovationStore((state) => state.setSelectedPlacedWallId);

  const selectedPlacedBlockId = useRenovationStore((state) => state.selectedPlacedBlockId);

  const transformGizmoMode = useRenovationStore((state) => state.transformGizmoMode);
  const updateSelectedObjectPosition = useRenovationStore((state) => state.updateSelectedObjectPosition);
  const updateSelectedObjectRotation = useRenovationStore((state) => state.updateSelectedObjectRotation);
  const selectedTargetGroupRef = useRef<THREE.Group>(null);

  const gridSnapSize = useRenovationStore((state) => state.gridSnapSize);

  // 60FPS Zero-Lag Smooth Ghost Preview & Pointer Update Loop
  useFrame(() => {
    if (pointerPosition && pointerNormal) {
      const activeItem = equippedTool === 'furniture' ? selectedFurniture : equippedTool === 'wall_builder' ? selectedWallBlock : null;

      if (activeItem) {
        const res = validatePlacement({
          item: activeItem,
          hitPoint: pointerPosition,
          hitNormal: pointerNormal,
          hitUserData: pointerHitUserData || {},
          cameraPosition: camera.position,
          placementRotation,
          property: activeProperty
        });

        if (isValidPlacementRef.current !== res.valid) {
          isValidPlacementRef.current = res.valid;
          setIsValidPlacement(res.valid);
        }
        targetVecRef.current.set(...res.alignedPosition);

        if (equippedTool === 'furniture' && furnitureGhostRef.current) {
          furnitureGhostRef.current.position.set(...res.alignedPosition);
          furnitureGhostRef.current.rotation.set(
            (placementRotation[0] * Math.PI) / 180,
            (placementRotation[1] * Math.PI) / 180,
            (placementRotation[2] * Math.PI) / 180
          );
          furnitureGhostRef.current.visible = true;

          if (furnitureGhostMatRef.current) {
            furnitureGhostMatRef.current.color.set(res.valid ? '#38bdf8' : '#ef4444');
          }
        }

        if (equippedTool === 'wall_builder' && wallGhostRef.current) {
          wallGhostRef.current.position.set(...res.alignedPosition);
          wallGhostRef.current.rotation.set(
            (placementRotation[0] * Math.PI) / 180,
            (placementRotation[1] * Math.PI) / 180,
            (placementRotation[2] * Math.PI) / 180
          );
          wallGhostRef.current.visible = true;

          if (wallGhostMatRef.current) {
            wallGhostMatRef.current.color.set(res.valid ? (selectedWallBlock.color || '#cbd5e1') : '#ef4444');
          }
        }
      } else {
        if (furnitureGhostRef.current) furnitureGhostRef.current.visible = false;
        if (wallGhostRef.current) wallGhostRef.current.visible = false;
        targetVecRef.current.copy(pointerPosition);
      }

      if (targetPointerRef.current) {
        targetPointerRef.current.position.copy(targetVecRef.current);
        targetPointerRef.current.visible = true;
      }

      if (targetGridCellMatRef.current) {
        targetGridCellMatRef.current.color.set(isValidPlacementRef.current ? '#38bdf8' : '#ef4444');
      }
    } else {
      if (furnitureGhostRef.current) furnitureGhostRef.current.visible = false;
      if (wallGhostRef.current) wallGhostRef.current.visible = false;
      if (targetPointerRef.current) targetPointerRef.current.visible = false;
    }
  });

  if (!activeProperty) return null;

  return (
    <group>
      {/* 0. Render Room / Block Bounding Outlines */}
      {(activeProperty.roomBlocks || []).map((block) => {
        const isSelected = selectedPlacedBlockId === block.id;
        const minX = Math.min(block.start[0], block.end[0]);
        const maxX = Math.max(block.start[0], block.end[0]);
        const minZ = Math.min(block.start[2], block.end[2]);
        const maxZ = Math.max(block.start[2], block.end[2]);
        const width = Math.max(0.2, maxX - minX);
        const depth = Math.max(0.2, maxZ - minZ);
        const height = block.height || 2.8;
        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;
        const centerY = block.start[1] + height / 2;

        if (!isSelected) return null;

        return (
          <mesh key={block.id} position={[centerX, centerY, centerZ]}>
            <boxGeometry args={[width + 0.1, height + 0.1, depth + 0.1]} />
            <meshBasicMaterial color="#38bdf8" wireframe={true} />
          </mesh>
        );
      })}

      {/* 1. Render Walls */}
      {activeProperty.walls.map((wall) => {
        if (wall.isDemolished) return null;

        const distance = Math.hypot(
          wall.endPoint[0] - wall.startPoint[0],
          wall.endPoint[2] - wall.startPoint[2]
        );
        const angle = Math.atan2(
          wall.endPoint[0] - wall.startPoint[0],
          wall.endPoint[2] - wall.startPoint[2]
        );

        const midPoint = new THREE.Vector3(
          (wall.startPoint[0] + wall.endPoint[0]) / 2,
          (wall.startPoint[1] + wall.endPoint[1]) / 2,
          (wall.startPoint[2] + wall.endPoint[2]) / 2
        );

        const wallHeight = wall.height || 2.8;
        const wallThickness = wall.thickness || 0.2;
        const centerY = midPoint.y + wallHeight / 2;

        const baseRotY = angle;
        const totalRotation: [number, number, number] = [
          ((wall.rotation?.[0] || 0) * Math.PI) / 180,
          baseRotY + ((wall.rotation?.[1] || 0) * Math.PI) / 180,
          ((wall.rotation?.[2] || 0) * Math.PI) / 180
        ];

        const isSelectedWall = selectedPlacedWallId === wall.id;

        return (
          <MinecraftPopWrapper key={wall.id}>
            <group>
              {isSelectedWall && (
                <mesh position={[midPoint.x, centerY, midPoint.z]} rotation={totalRotation}>
                  <boxGeometry args={[wallThickness + 0.08, wallHeight + 0.08, distance + 0.08]} />
                  <meshBasicMaterial color="#06b6d4" wireframe={true} />
                </mesh>
              )}

              <mesh
                userData={{ type: 'wall', id: wall.id, blockType: wall.blockType }}
                position={[midPoint.x, centerY, midPoint.z]}
                rotation={totalRotation}
                castShadow
                receiveShadow
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation();
                  if (e.button !== 0) return;
                  setSelectedPlacedWallId(wall.id);
                  if (equippedTool === 'inspect') {
                    useRenovationStore.getState().showToast(`🔍 Selected Wall Block (${wall.blockType || 'Drywall'})! [R] Yaw, [T] Tilt, [G] Roll`);
                  }
                }}
              >
                <boxGeometry args={[wallThickness, wallHeight, distance]} />
                <meshStandardMaterial color={isSelectedWall ? "#38bdf8" : (wall.color || '#cbd5e1')} roughness={0.7} />
              </mesh>
            </group>
          </MinecraftPopWrapper>
        );
      })}

      {/* 2. Render Floors */}
      {activeProperty.floors.map((floor) => {
        const { minX, maxX, minZ, maxZ, y } = floor.bounds;
        const width = maxX - minX;
        const depth = maxZ - minZ;
        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;

        return (
          <group key={floor.id}>
            <mesh
              userData={{ type: 'floor', id: floor.id }}
              position={[centerX, y, centerZ]}
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                if (e.button !== 0) return;
                if (equippedTool === 'inspect') {
                  useRenovationStore.getState().showToast(`🔍 Floor Surface (${floor.materialId || 'Concrete'})`);
                }
              }}
            >
              <planeGeometry args={[width, depth]} />
              <meshStandardMaterial color={floor.color || '#3a5a2a'} roughness={0.8} />
            </mesh>

            {/* Visual Placement Grid System Overlay on Floor (Always Visible) */}
            <gridHelper
              args={[Math.max(width, depth), Math.round(Math.max(width, depth) / gridSnapSize), '#64748b', '#334155']}
              position={[centerX, y + 0.015, centerZ]}
            />

            {/* Subtle Perimeter Border Indicator */}
            <lineSegments position={[centerX, y + 0.02, centerZ]}>
              <edgesGeometry args={[new THREE.BoxGeometry(width, 0.02, depth)]} />
              <lineBasicMaterial color="#475569" linewidth={1} />
            </lineSegments>
          </group>
        );
      })}

      {/* 3. Render Dirt Stains */}
      {activeProperty.dirtStains.map((stain) => {
        if (stain.clearedRatio >= 1.0) return null;

        const opacity = Math.max(0, 1.0 - stain.clearedRatio);
        const scale = (1.0 - stain.clearedRatio * 0.4) * stain.size;
        const isFloorStain = stain.normal ? Math.abs(stain.normal[1]) > 0.5 : true;

        return (
          <mesh
            key={stain.id}
            userData={{ type: 'stain', id: stain.id }}
            position={stain.position}
            rotation={isFloorStain ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              if (e.button !== 0) return;
              if (equippedTool === 'inspect') {
                useRenovationStore.getState().showToast(`🔍 Dirt Stain (${stain.type}) - ${Math.round((1 - stain.clearedRatio) * 100)}% dirty`);
              }
            }}
          >
            <planeGeometry args={[scale, scale]} />
            <meshStandardMaterial
              color={stain.type === 'graffiti' ? '#dc2626' : stain.type === 'grease' ? '#1e293b' : '#78350f'}
              transparent
              opacity={opacity * 0.88}
              depthTest={true}
            />
          </mesh>
        );
      })}

      {/* 4. Render Fixtures */}
      {activeProperty.fixtures.map((fixture) => (
        <group
          key={fixture.id}
          userData={{ type: 'fixture', id: fixture.id, name: fixture.name, isBroken: fixture.isBroken }}
          position={fixture.position}
          rotation={fixture.rotation.map((deg) => (deg * Math.PI) / 180) as [number, number, number]}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (e.button !== 0) return;
            if (equippedTool === 'inspect') {
              useRenovationStore.getState().showToast(`🔍 Fixture: ${fixture.name} (${fixture.isBroken ? '⚠️ Needs Repair' : '✅ Working'})`);
            }
          }}
        >
          {fixture.type === 'light' && (
            <>
              <mesh userData={{ type: 'fixture', id: fixture.id, name: fixture.name, isBroken: fixture.isBroken }} castShadow>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                  color={fixture.isBroken ? '#475569' : '#fef08a'}
                  emissive={fixture.isBroken ? '#000000' : '#fef08a'}
                  emissiveIntensity={fixture.isBroken ? 0 : 0.8}
                />
              </mesh>
              {!fixture.isBroken && (
                <pointLight intensity={1.5} distance={10} color="#fffbe8" castShadow />
              )}
            </>
          )}

          {fixture.type === 'plumbing' && (
            <mesh userData={{ type: 'fixture', id: fixture.id, name: fixture.name, isBroken: fixture.isBroken }} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
              <meshStandardMaterial color={fixture.isBroken ? '#ef4444' : '#94a3b8'} metalness={0.8} roughness={0.2} />
            </mesh>
          )}
        </group>
      ))}

      {/* 5. Render Placed Furniture with real 3D GLTF Models */}
      {activeProperty.furniture.map((item) => {
        const radRotation: [number, number, number] = [
          (item.rotation[0] * Math.PI) / 180,
          (item.rotation[1] * Math.PI) / 180,
          (item.rotation[2] * Math.PI) / 180
        ];
        const isSelectedPlaced = selectedPlacedFurnitureId === item.id;
        const modelUrl = resolveModelPath(item);

        if (isSelectedPlaced) {
          return (
            <MinecraftPopWrapper key={item.id}>
              <group ref={selectedTargetGroupRef}>
                <GLTFModelRenderer
                  modelPath={modelUrl}
                  category={item.category}
                  assetId={item.catalogId || item.id}
                  position={item.position}
                  rotation={radRotation}
                  scale={item.scale || [1, 1, 1]}
                  isSelected={isSelectedPlaced}
                  userData={{ type: 'furniture', id: item.id, name: item.name, category: item.category, price: item.price }}
                  onClick={(e: ThreeEvent<MouseEvent>) => {
                    e.stopPropagation();
                    if (e.button !== 0) return;
                    setSelectedPlacedFurnitureId(item.id);
                    useRenovationStore.getState().showToast(`🔍 Selected ${item.name}! Use Blender Inspector or 3D Gizmo to Move & Rotate`);
                  }}
                />
              </group>
            </MinecraftPopWrapper>
          );
        }

        return (
          <MinecraftPopWrapper key={item.id}>
            <GLTFModelRenderer
              modelPath={modelUrl}
              category={item.category}
              assetId={item.catalogId || item.id}
              position={item.position}
              rotation={radRotation}
              scale={item.scale || [1, 1, 1]}
              isSelected={isSelectedPlaced}
              userData={{ type: 'furniture', id: item.id, name: item.name, category: item.category, price: item.price }}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                if (e.button !== 0) return;
                setSelectedPlacedFurnitureId(item.id);
                useRenovationStore.getState().showToast(`🔍 Selected ${item.name}! Use Blender Inspector or 3D Gizmo to Move & Rotate`);
              }}
            />
          </MinecraftPopWrapper>
        );
      })}

      {/* 6. Placement Ghost Preview with Dynamic Surface & Collision Validation */}
      {equippedTool === 'furniture' && selectedFurniture && (
        <group
          ref={furnitureGhostRef}
          visible={false}
          userData={{ isGhost: true }}
          rotation={[
            (placementRotation[0] * Math.PI) / 180,
            (placementRotation[1] * Math.PI) / 180,
            (placementRotation[2] * Math.PI) / 180
          ]}
        >
          <GLTFModelRenderer
            modelPath={resolveModelPath(selectedFurniture)}
            category={selectedFurniture.category}
            assetId={selectedFurniture.id}
            scale={selectedFurniture.dimensions ? [selectedFurniture.dimensions[0] / 2, selectedFurniture.dimensions[1] / 2, selectedFurniture.dimensions[2] / 2] : [1, 1, 1]}
            isGhost={true}
            ghostColor={isValidPlacement ? '' : '#ef4444'}
          />
        </group>
      )}

      {equippedTool === 'wall_builder' && selectedWallBlock && (
        <group
          ref={wallGhostRef}
          visible={false}
          userData={{ isGhost: true }}
          rotation={[
            (placementRotation[0] * Math.PI) / 180,
            (placementRotation[1] * Math.PI) / 180,
            (placementRotation[2] * Math.PI) / 180
          ]}
        >
          <MinecraftGhostBlockPreview
            dimensions={[
              selectedWallBlock.width || 1.0,
              selectedWallBlock.height || 1.0,
              selectedWallBlock.depth || selectedWallBlock.thickness || 1.0
            ]}
            color={selectedWallBlock.color || '#cbd5e1'}
            isValid={isValidPlacement}
          />
        </group>
      )}



      {/* Minecraft Center Crosshair Target Block Bounding Box Selection Indicator */}
      {pointerPosition && (
        <group ref={targetPointerRef} userData={{ isGhost: true }}>
          {/* 3D Minecraft Target Block Wireframe Outline Box */}
          <lineSegments position={[0, gridSnapSize / 2, 0]}>
            <edgesGeometry args={[new THREE.BoxGeometry(gridSnapSize * 1.005, gridSnapSize * 1.005, gridSnapSize * 1.005)]} />
            <lineBasicMaterial color={isValidPlacement ? '#0f172a' : '#ef4444'} linewidth={2} />
          </lineSegments>

          {/* Minecraft Target Floor Grid Cell Highlight */}
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[gridSnapSize, gridSnapSize]} />
            <meshBasicMaterial
              ref={targetGridCellMatRef}
              color={isValidPlacement ? '#38bdf8' : '#ef4444'}
              transparent
              opacity={0.45}
              wireframe={false}
            />
          </mesh>
        </group>
      )}

      {/* 3D Blender Interactive Transform Controls Gizmo */}
      {selectedTargetGroupRef.current && (selectedPlacedFurnitureId || selectedPlacedWallId) && (
        <TransformControls
          object={selectedTargetGroupRef.current}
          mode={transformGizmoMode}
          size={0.75}
          onObjectChange={() => {
            if (selectedTargetGroupRef.current) {
              const p = selectedTargetGroupRef.current.position;
              const r = selectedTargetGroupRef.current.rotation;
              const rotDeg: [number, number, number] = [
                Math.round((r.x * 180) / Math.PI),
                Math.round((r.y * 180) / Math.PI),
                Math.round((r.z * 180) / Math.PI)
              ];
              updateSelectedObjectPosition([p.x, p.y, p.z]);
              updateSelectedObjectRotation(rotDeg);
            }
          }}
        />
      )}
    </group>
  );
};
