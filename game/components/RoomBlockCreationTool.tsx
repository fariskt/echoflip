import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRenovationStore } from '../../stores/renovationStore';
import { validateRoomBlockPlacement } from '../utils/roomBlockGenerator';
import type { RoomBlockType } from '../../types/renovation';

interface RoomBlockCreationToolProps {
  pointerPosition?: THREE.Vector3 | null;
}

export const RoomBlockCreationTool: React.FC<RoomBlockCreationToolProps> = ({
  pointerPosition
}) => {
  const { raycaster, camera, scene } = useThree();

  const equippedTool = useRenovationStore((state) => state.equippedTool);
  const activeRoomBlockType = useRenovationStore((state) => state.activeRoomBlockType);
  const roomBlockHeight = useRenovationStore((state) => state.roomBlockHeight);
  const setRoomBlockHeight = useRenovationStore((state) => state.setRoomBlockHeight);
  const roomBlockWallThickness = useRenovationStore((state) => state.roomBlockWallThickness);
  const includeCeiling = useRenovationStore((state) => state.includeCeiling);
  const selectedWallBlock = useRenovationStore((state) => state.selectedWallBlock);
  const selectedFlooring = useRenovationStore((state) => state.selectedFlooring);
  const activeProperty = useRenovationStore((state) => state.activeProperty);
  const createRoomBlock = useRenovationStore((state) => state.createRoomBlock);
  const showToast = useRenovationStore((state) => state.showToast);

  const gridSnapEnabled = useRenovationStore((state) => state.gridSnapEnabled);
  const gridSnapSize = useRenovationStore((state) => state.gridSnapSize);

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<[number, number, number] | null>(null);
  const [currentEndPoint, setCurrentEndPoint] = useState<[number, number, number]>([0, 0, 0]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [dimText, setDimText] = useState<string>('');

  // Three.js Refs for 60fps direct update
  const previewBoxMeshRef = useRef<THREE.Mesh>(null);
  const previewBoxMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const previewWireframeRef = useRef<THREE.LineSegments>(null);
  const startMarkerRef = useRef<THREE.Mesh>(null);

  // Modifiers
  const isShiftPressed = useRef<boolean>(false);
  const isCtrlPressed = useRef<boolean>(false);

  // Handle keyboard modifiers and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') isShiftPressed.current = true;
      if (e.key === 'Control') isCtrlPressed.current = true;

      if (e.key === 'Escape' && isDragging) {
        setIsDragging(false);
        setStartPoint(null);
        showToast('Room Creation Cancelled [ESC]');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') isShiftPressed.current = false;
      if (e.key === 'Control') isCtrlPressed.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDragging, showToast]);

  // Snap helper with Shift / Ctrl modifier check
  const snapPoint = (pt: THREE.Vector3): [number, number, number] => {
    let step = gridSnapSize;
    if (isShiftPressed.current || !gridSnapEnabled) {
      return [Number(pt.x.toFixed(2)), Number(pt.y.toFixed(2)), Number(pt.z.toFixed(2))];
    }
    if (isCtrlPressed.current) {
      step = 0.1; // Fine snapping
    }
    const x = Math.round(pt.x / step) * step;
    const z = Math.round(pt.z / step) * step;
    return [Number(x.toFixed(2)), 0, Number(z.toFixed(2))];
  };

  // Live frame updates for preview geometry
  useFrame(() => {
    if (equippedTool !== 'room_builder') return;

    let hitPt: THREE.Vector3 | null = pointerPosition || null;

    if (!hitPt) {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        hitPt = intersection;
      }
    }

    if (!hitPt) return;

    const snapped = snapPoint(hitPt);

    if (isDragging && startPoint) {
      const p1 = startPoint;
      const p2 = snapped;

      const minX = Math.min(p1[0], p2[0]);
      const maxX = Math.max(p1[0], p2[0]);
      const minZ = Math.min(p1[2], p2[2]);
      const maxZ = Math.max(p1[2], p2[2]);

      const width = Math.max(0.1, maxX - minX);
      const length = Math.max(0.1, maxZ - minZ);
      const height = activeRoomBlockType === 'floor' ? 0.15 : activeRoomBlockType === 'foundation' ? 0.5 : roomBlockHeight;

      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;
      const centerY = p1[1] + height / 2;

      // Update preview mesh
      if (previewBoxMeshRef.current) {
        previewBoxMeshRef.current.position.set(centerX, centerY, centerZ);
        previewBoxMeshRef.current.scale.set(width, height, length);
        previewBoxMeshRef.current.visible = true;
      }

      if (startMarkerRef.current) {
        startMarkerRef.current.position.set(p1[0], 0.05, p1[2]);
        startMarkerRef.current.visible = true;
      }

      // Validate
      const val = validateRoomBlockPlacement(p1, p2, activeProperty);
      if (val.valid !== isValid) setIsValid(val.valid);
      setValidationMessage(val.reason || '');
      setDimText(`${width.toFixed(1)}m × ${length.toFixed(1)}m (H: ${height.toFixed(1)}m)`);

      const color = val.valid ? '#22c55e' : '#ef4444';
      if (previewBoxMatRef.current) {
        previewBoxMatRef.current.color.set(color);
      }
    } else {
      if (previewBoxMeshRef.current) previewBoxMeshRef.current.visible = false;
      if (startMarkerRef.current) {
        startMarkerRef.current.position.set(snapped[0], 0.05, snapped[2]);
        startMarkerRef.current.visible = true;
      }
    }
  });

  if (equippedTool !== 'room_builder') return null;

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    const pt = snapPoint(e.point);

    if (!isDragging) {
      // Step 1: Set start corner
      setStartPoint(pt);
      setCurrentEndPoint(pt);
      setIsDragging(true);
      showToast(`🎯 Corner 1 set at (${pt[0]}, ${pt[2]}). Move mouse to resize, click again to finish.`);
    } else if (startPoint) {
      // Step 2: Confirm opposite corner
      const endPt = pt;
      const val = validateRoomBlockPlacement(startPoint, endPt, activeProperty);

      if (!val.valid) {
        showToast(`❌ Cannot create block: ${val.reason || 'Invalid location'}`);
        return;
      }

      createRoomBlock({
        type: activeRoomBlockType,
        start: startPoint,
        end: endPt,
        height: activeRoomBlockType === 'floor' ? 0.15 : activeRoomBlockType === 'foundation' ? 0.5 : roomBlockHeight,
        wallThickness: roomBlockWallThickness,
        wallPresetId: selectedWallBlock.id,
        flooringMaterialId: selectedFlooring.id,
        hasCeiling: includeCeiling,
        color: selectedWallBlock.color
      });

      setIsDragging(false);
      setStartPoint(null);
    }
  };

  const handleWheel = (e: ThreeEvent<WheelEvent>) => {
    if (isDragging) {
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newH = Math.max(0.5, Math.min(10, roomBlockHeight + delta));
      setRoomBlockHeight(Number(newH.toFixed(1)));
    }
  };

  return (
    <group onPointerDown={handlePointerDown} onWheel={handleWheel}>
      {/* Ground Click Target Receiver */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>

      {/* Start Corner Marker */}
      <mesh ref={startMarkerRef} visible={false}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.8} />
      </mesh>

      {/* Dynamic 3D Preview Box */}
      <mesh ref={previewBoxMeshRef} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={previewBoxMatRef}
          color="#22c55e"
          transparent
          opacity={0.35}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Live Dimension Overlay HTML Badge */}
      {isDragging && startPoint && (
        <Html
          position={[
            (startPoint[0] + currentEndPoint[0]) / 2,
            roomBlockHeight + 0.6,
            (startPoint[2] + currentEndPoint[2]) / 2
          ]}
          center
        >
          <div className="pointer-events-none flex flex-col items-center bg-slate-950/90 text-white text-xs px-3 py-1.5 rounded-xl border border-emerald-500/50 shadow-2xl backdrop-blur-md">
            <span className="font-bold text-emerald-400">{dimText}</span>
            <span className="text-[10px] text-slate-300">
              {activeRoomBlockType.replace('_', ' ').toUpperCase()} MODE
            </span>
            {!isValid && (
              <span className="text-[10px] text-red-400 font-semibold mt-0.5">{validationMessage}</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
