import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useRenovationStore } from '../../stores/renovationStore';
import { validatePlacement } from '../utils/placementValidation';

interface HouseRendererProps {
  pointerPosition?: THREE.Vector3 | null;
  pointerNormal?: THREE.Vector3 | null;
  pointerHitUserData?: Record<string, any> | null;
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
  const setSelectedPlacedBlockId = useRenovationStore((state) => state.setSelectedPlacedBlockId);
  const deleteRoomBlock = useRenovationStore((state) => state.deleteRoomBlock);

  const gridSnapEnabled = useRenovationStore((state) => state.gridSnapEnabled);
  const gridSnapSize = useRenovationStore((state) => state.gridSnapSize);
  const snapToGrid = useRenovationStore((state) => state.snapToGrid);

  useFrame(() => {
    if (pointerPosition && pointerNormal) {
      const activeItem = equippedTool === 'furniture' ? selectedFurniture : equippedTool === 'wall_builder' ? selectedWallBlock : null;
      if (!activeItem) return;

      const res = validatePlacement({
        item: activeItem,
        hitPoint: pointerPosition,
        hitNormal: pointerNormal,
        hitUserData: pointerHitUserData || {},
        cameraPosition: camera.position,
        placementRotation,
        property: activeProperty
      });

      if (res.valid !== isValidPlacement) {
        setIsValidPlacement(res.valid);
      }

      const ghostColor = res.valid ? '#22c55e' : '#ef4444';

      if (furnitureGhostRef.current) {
        furnitureGhostRef.current.position.set(...res.alignedPosition);
        if (furnitureGhostMatRef.current) {
          furnitureGhostMatRef.current.color.set(ghostColor);
        }
      }

      if (wallGhostRef.current) {
        wallGhostRef.current.position.set(...res.alignedPosition);
        if (wallGhostMatRef.current) {
          wallGhostMatRef.current.color.set(ghostColor);
        }
      }
    }
  });

  if (!activeProperty) return null;

  const ghostPos = pointerPosition ? snapToGrid([pointerPosition.x, pointerPosition.y, pointerPosition.z]) : null;

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
              {/* Corner Posts */}
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

              {/* Outer Perimeter Wireframe Line */}
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

      {/* 5. Render Placed Furniture with full 3D tilt & rotation */}
      {activeProperty.furniture.map((item) => {
        const radRotation: [number, number, number] = [
          (item.rotation[0] * Math.PI) / 180,
          (item.rotation[1] * Math.PI) / 180,
          (item.rotation[2] * Math.PI) / 180
        ];
        const isSelectedPlaced = selectedPlacedFurnitureId === item.id;

        return (
          <group
            key={item.id}
            userData={{ type: 'furniture', id: item.id, name: item.name, category: item.category, price: item.price }}
            position={item.position}
            rotation={radRotation}
            scale={item.scale}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              setSelectedPlacedFurnitureId(item.id);
              useRenovationStore.getState().showToast(`🔍 Selected ${item.name}! Use [R] Yaw, [T] Tilt, [G] Roll to rotate`);
            }}
          >
            {/* Active Selection Box Wireframe */}
            {isSelectedPlaced && (
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[2.2, 1.2, 1.2]} />
                <meshBasicMaterial color="#38bdf8" wireframe={true} />
              </mesh>
            )}

            {item.meshName === 'Sofa' && (
              <mesh userData={{ type: 'furniture', id: item.id, name: item.name }} castShadow receiveShadow position={[0, 0.45, 0]}>
                <boxGeometry args={[2.0, 0.8, 0.9]} />
                <meshStandardMaterial color={isSelectedPlaced ? "#38bdf8" : "#2563eb"} roughness={0.6} />
              </mesh>
            )}

            {item.meshName === 'Chair' && (
              <mesh userData={{ type: 'furniture', id: item.id, name: item.name }} castShadow receiveShadow position={[0, 0.4, 0]}>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial color={isSelectedPlaced ? "#38bdf8" : "#0284c7"} roughness={0.7} />
              </mesh>
            )}

            {(item.meshName === 'Table' || item.meshName === 'Table_Large' || item.meshName === 'Desk') && (
              <mesh userData={{ type: 'furniture', id: item.id, name: item.name }} castShadow receiveShadow position={[0, 0.37, 0]}>
                <boxGeometry args={[1.4, 0.75, 0.8]} />
                <meshStandardMaterial color={isSelectedPlaced ? "#38bdf8" : "#d97706"} roughness={0.5} />
              </mesh>
            )}

            {item.meshName === 'Bed' && (
              <mesh userData={{ type: 'furniture', id: item.id, name: item.name }} castShadow receiveShadow position={[0, 0.3, 0]}>
                <boxGeometry args={[2.0, 0.6, 2.1]} />
                <meshStandardMaterial color={isSelectedPlaced ? "#38bdf8" : "#475569"} roughness={0.8} />
              </mesh>
            )}

            {item.meshName === 'Cabinet' && (
              <mesh userData={{ type: 'furniture', id: item.id, name: item.name }} castShadow receiveShadow position={[0, 0.95, 0]}>
                <boxGeometry args={[0.9, 1.9, 0.35]} />
                <meshStandardMaterial color="#78350f" roughness={0.6} />
              </mesh>
            )}

            {item.meshName === 'Lamp' && (
              <mesh userData={{ type: 'furniture', id: item.id, name: item.name }} castShadow receiveShadow position={[0, 0.85, 0]}>
                <cylinderGeometry args={[0.1, 0.2, 1.7, 12]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
              </mesh>
            )}

            {/* Generic Fallback Box for items */}
            {!['Sofa', 'Chair', 'Table', 'Table_Large', 'Desk', 'Bed', 'Cabinet', 'Lamp'].includes(item.meshName) && (
              <mesh userData={{ type: 'furniture', id: item.id, name: item.name }} castShadow receiveShadow position={[0, 0.5, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#10b981" roughness={0.5} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 6. Placement Ghost Preview with Dynamic Surface & Collision Validation */}
      {equippedTool === 'furniture' && selectedFurniture && (
        <group
          ref={furnitureGhostRef}
          position={ghostPos || [0, 0, 0]}
          rotation={[
            (placementRotation[0] * Math.PI) / 180,
            (placementRotation[1] * Math.PI) / 180,
            (placementRotation[2] * Math.PI) / 180
          ]}
        >
          <mesh position={[0, (selectedFurniture.dimensions[1] || 1) / 2, 0]}>
            <boxGeometry args={selectedFurniture.dimensions || [1, 1, 1]} />
            <meshStandardMaterial ref={furnitureGhostMatRef} color="#22c55e" transparent opacity={0.65} wireframe={false} />
          </mesh>
        </group>
      )}

      {equippedTool === 'wall_builder' && (
        <group
          ref={wallGhostRef}
          position={ghostPos || [0, 0, 0]}
          rotation={[
            (placementRotation[0] * Math.PI) / 180,
            (placementRotation[1] * Math.PI) / 180,
            (placementRotation[2] * Math.PI) / 180
          ]}
        >
          <mesh>
            <boxGeometry args={[1.0, 1.0, 1.0]} />
            <meshStandardMaterial ref={wallGhostMatRef} color="#22c55e" transparent opacity={0.65} />
          </mesh>
        </group>
      )}
    </group>
  );
};
