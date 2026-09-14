import React, { useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useRenovationStore } from '../../stores/renovationStore';
import { validatePlacement } from '../utils/placementValidation';
import { GLTFModelRenderer } from './GLTFModelRenderer';
import { PRELOADED_ASSETS } from '../core/assetRegistry';

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

        isValidPlacementRef.current = res.valid;
        const ghostColor = res.valid ? '#22c55e' : '#ef4444';
        targetVecRef.current.set(...res.alignedPosition);

        if (furnitureGhostRef.current) {
          furnitureGhostRef.current.position.lerp(targetVecRef.current, 0.45);
          if (furnitureGhostMatRef.current) {
            furnitureGhostMatRef.current.color.set(ghostColor);
          }
        }

        if (wallGhostRef.current) {
          wallGhostRef.current.position.lerp(targetVecRef.current, 0.45);
          if (wallGhostMatRef.current) {
            wallGhostMatRef.current.color.set(ghostColor);
          }
        }

        if (targetGridCellMatRef.current) {
          targetGridCellMatRef.current.color.set(res.valid ? '#10b981' : '#ef4444');
        }
      }

      if (targetPointerRef.current) {
        const targetPt = new THREE.Vector3(
          pointerPosition.x + (pointerNormal ? pointerNormal.x * 0.015 : 0),
          pointerPosition.y + (pointerNormal ? pointerNormal.y * 0.015 : 0.015),
          pointerPosition.z + (pointerNormal ? pointerNormal.z * 0.015 : 0)
        );
        targetPointerRef.current.position.lerp(targetPt, 0.5);
      }
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
            <meshBasicMaterial color="#10b981" wireframe={true} />
          </mesh>
        );
      })}

      {/* 1. Render Walls */}
      {activeProperty.walls.map((wall) => {
        if (wall.isDemolished) return null;

        const start = new THREE.Vector3(...wall.startPoint);
        const end = new THREE.Vector3(...wall.endPoint);
        const distance = start.distanceTo(end);
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const angle = Math.atan2(end.x - start.x, end.z - start.z);

        const startY = wall.startPoint[1] ?? 0;
        const wallHeight = wall.height || 1.0;
        const wallThickness = wall.thickness || 1.0;
        const centerY = startY + wallHeight / 2;

        const isSelectedWall = selectedPlacedWallId === wall.id;
        const wallRot = wall.rotation || [0, 0, 0];
        const totalRotation: [number, number, number] = [
          (wallRot[0] * Math.PI) / 180,
          angle + (wallRot[1] * Math.PI) / 180,
          (wallRot[2] * Math.PI) / 180
        ];

        return (
          <group key={wall.id}>
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
                if (equippedTool === 'wall_builder') {
                  const pt: [number, number, number] = [e.point.x, e.point.y, e.point.z];
                  buildWall(pt);
                  return;
                }
                setSelectedPlacedWallId(wall.id);
                if (equippedTool === 'inspect') {
                  useRenovationStore.getState().showToast(`🔍 Selected Wall Block (${wall.blockType || 'Drywall'})! [R] Yaw, [T] Tilt, [G] Roll`);
                } else if (equippedTool === 'paint_roller') {
                  paintWallSegment(wall.id);
                } else if (equippedTool === 'hammer') {
                  demolishWall(wall.id);
                }
              }}
            >
              <boxGeometry args={[wallThickness, wallHeight, distance]} />
              <meshStandardMaterial color={isSelectedWall ? "#38bdf8" : (wall.color || '#cbd5e1')} roughness={0.7} />
            </mesh>
          </group>
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
                const pt: [number, number, number] = [e.point.x, e.point.y, e.point.z];
                if (equippedTool === 'inspect') {
                  useRenovationStore.getState().showToast(`🔍 Floor Surface (${floor.materialId || 'Concrete'})`);
                } else if (equippedTool === 'flooring') {
                  changeFlooring(floor.id);
                } else if (equippedTool === 'wall_builder') {
                  buildWall(pt);
                } else if (equippedTool === 'furniture' && selectedFurniture) {
                  placeFurniture(selectedFurniture, pt, placementRotation);
                }
              }}
            >
              <planeGeometry args={[width, depth]} />
              <meshStandardMaterial color={floor.color || '#3a5a2a'} roughness={0.8} />
            </mesh>

            {/* Visual Placement Grid System Overlay on Floor */}
            {(equippedTool === 'furniture' || equippedTool === 'wall_builder' || equippedTool === 'flooring') && (
              <gridHelper
                args={[Math.max(width, depth), Math.round(Math.max(width, depth) / gridSnapSize), '#10b981', '#065f46']}
                position={[centerX, y + 0.015, centerZ]}
              />
            )}

            {/* 3D Perimeter Border & Corner Boundary Indicators */}
            <group position={[0, y + 0.02, 0]}>
              {[
                [minX, minZ],
                [maxX, minZ],
                [maxX, maxZ],
                [minX, maxZ]
              ].map(([cx, cz], idx) => (
                <group key={idx} position={[cx, 1.5, cz]}>
                  <mesh castShadow>
                    <cylinderGeometry args={[0.25, 0.25, 3.0, 16]} />
                    <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.8} />
                  </mesh>
                  <mesh position={[0, 1.6, 0]}>
                    <sphereGeometry args={[0.35, 16, 16]} />
                    <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={1.2} />
                  </mesh>
                </group>
              ))}

              <lineSegments position={[centerX, 0.05, centerZ]}>
                <edgesGeometry args={[new THREE.BoxGeometry(width, 0.05, depth)]} />
                <lineBasicMaterial color="#10b981" linewidth={3} />
              </lineSegments>
            </group>
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
              if (equippedTool === 'inspect') {
                useRenovationStore.getState().showToast(`🔍 Dirt Stain (${stain.type}) - ${Math.round((1 - stain.clearedRatio) * 100)}% dirty`);
              } else if (equippedTool === 'sponge') {
                scrubDirtStain(stain.id);
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
            if (equippedTool === 'inspect') {
              useRenovationStore.getState().showToast(`🔍 Fixture: ${fixture.name} (${fixture.isBroken ? '⚠️ Needs Repair' : '✅ Working'})`);
            } else if (fixture.isBroken) {
              repairFixture(fixture.id);
            }
          }}
        >
          {fixture.type === 'light' && (
            <>
              <mesh userData={{ type: 'fixture', id: fixture.id, name: fixture.name, isBroken: fixture.isBroken }} castShadow>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                  color={fixture.isBroken ? '#ef4444' : '#fef08a'}
                  emissive={fixture.isBroken ? '#450a0a' : '#fef08a'}
                  emissiveIntensity={fixture.isBroken ? 0.2 : 1.5}
                />
              </mesh>
              {!fixture.isBroken && (
                <pointLight intensity={2.5} distance={10} color="#fef08a" castShadow />
              )}
            </>
          )}

          {fixture.type === 'sink' && (
            <mesh userData={{ type: 'fixture', id: fixture.id, name: fixture.name, isBroken: fixture.isBroken }} castShadow>
              <boxGeometry args={[0.6, 0.4, 0.5]} />
              <meshStandardMaterial color={fixture.isBroken ? '#94a3b8' : '#f8fafc'} roughness={0.3} />
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

        return (
          <GLTFModelRenderer
            key={item.id}
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
              setSelectedPlacedFurnitureId(item.id);
              useRenovationStore.getState().showToast(`🔍 Selected ${item.name}! Use [R] Yaw, [T] Tilt, [G] Roll to rotate`);
            }}
          />
        );
      })}

      {/* 6. Placement Ghost Preview with Dynamic Surface & Collision Validation */}
      {equippedTool === 'furniture' && selectedFurniture && (
        <group
          ref={furnitureGhostRef}
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
            isGhost={true}
            ghostColor={isValidPlacementRef.current ? '#22c55e' : '#ef4444'}
          />
        </group>
      )}

      {equippedTool === 'wall_builder' && (
        <group
          ref={wallGhostRef}
          rotation={[
            (placementRotation[0] * Math.PI) / 180,
            (placementRotation[1] * Math.PI) / 180,
            (placementRotation[2] * Math.PI) / 180
          ]}
        >
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.0, 1.0, 1.0]} />
            <meshStandardMaterial ref={wallGhostMatRef} color="#22c55e" transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {/* 7. Dynamic 3D Dot Target Pointer Marker */}
      {pointerPosition && (
        <group ref={targetPointerRef}>
          <mesh rotation={pointerNormal && Math.abs(pointerNormal.y) > 0.5 ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
            <ringGeometry args={[0.08, 0.16, 24]} />
            <meshBasicMaterial
              color={
                pointerHitUserData?.type === 'wall' || pointerHitUserData?.type === 'furniture' || pointerHitUserData?.type === 'stain' || pointerHitUserData?.type === 'fixture'
                  ? '#38bdf8'
                  : '#10b981'
              }
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>

          <mesh>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial
              color={
                pointerHitUserData?.type === 'wall' || pointerHitUserData?.type === 'furniture' || pointerHitUserData?.type === 'stain' || pointerHitUserData?.type === 'fixture'
                  ? '#06b6d4'
                  : '#34d399'
              }
            />
          </mesh>

          {(equippedTool === 'furniture' || equippedTool === 'wall_builder') && (
            <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[gridSnapSize, gridSnapSize]} />
              <meshBasicMaterial
                ref={targetGridCellMatRef}
                color="#10b981"
                transparent
                opacity={0.35}
                wireframe={true}
              />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};
