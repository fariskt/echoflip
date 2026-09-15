import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRenovationStore } from '../../stores/renovationStore';
import { validateRoomBlockPlacement } from '../utils/roomBlockGenerator';

interface RoomBlockCreationToolProps {
  pointerPosition?: THREE.Vector3 | null;
}

export const RoomBlockCreationTool: React.FC<RoomBlockCreationToolProps> = ({
  pointerPosition
}) => {
  const { raycaster } = useThree();

  const equippedTool = useRenovationStore((state) => state.equippedTool);
  const activeRoomBlockType = useRenovationStore((state) => state.activeRoomBlockType);
  const roomBlockHeight = useRenovationStore((state) => state.roomBlockHeight);
  const setRoomBlockHeight = useRenovationStore((state) => state.setRoomBlockHeight);
  const roomBlockWallThickness = useRenovationStore((state) => state.roomBlockWallThickness);
  const selectedWallBlock = useRenovationStore((state) => state.selectedWallBlock);
  const activeProperty = useRenovationStore((state) => state.activeProperty);
  const showToast = useRenovationStore((state) => state.showToast);

  const roomBlockStartPoint = useRenovationStore((state) => state.roomBlockStartPoint);
  const setRoomBlockStartPoint = useRenovationStore((state) => state.setRoomBlockStartPoint);

  const gridSnapEnabled = useRenovationStore((state) => state.gridSnapEnabled);
  const gridSnapSize = useRenovationStore((state) => state.gridSnapSize);

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

      if (e.key === 'Escape' && roomBlockStartPoint) {
        setRoomBlockStartPoint(null);
        showToast('Wall Side Creation Cancelled [ESC]');
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
  }, [roomBlockStartPoint, setRoomBlockStartPoint, showToast]);

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

  // Live frame updates for 2-point 3D wall preview geometry
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
    setCurrentEndPoint(snapped);

    if (roomBlockStartPoint) {
      const p1 = roomBlockStartPoint;
      const p2 = snapped;

      const distance = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);
      const angle = Math.atan2(p2[0] - p1[0], p2[2] - p1[2]);

      const midX = (p1[0] + p2[0]) / 2;
      const midZ = (p1[2] + p2[2]) / 2;
      const height = roomBlockHeight || 2.8;
      const centerY = p1[1] + height / 2;
      const thickness = roomBlockWallThickness || 0.2;

      // Update preview mesh
      if (previewBoxMeshRef.current) {
        previewBoxMeshRef.current.position.set(midX, centerY, midZ);
        previewBoxMeshRef.current.rotation.set(0, angle, 0);
        previewBoxMeshRef.current.scale.set(thickness, height, Math.max(0.1, distance));
        previewBoxMeshRef.current.visible = true;
      }

      if (previewWireframeRef.current) {
        previewWireframeRef.current.position.set(midX, centerY, midZ);
        previewWireframeRef.current.rotation.set(0, angle, 0);
        previewWireframeRef.current.scale.set(thickness * 1.002, height * 1.002, Math.max(0.1, distance) * 1.002);
        previewWireframeRef.current.visible = true;
      }

      if (startMarkerRef.current) {
        startMarkerRef.current.position.set(p1[0], 0.05, p1[2]);
        startMarkerRef.current.visible = true;
      }

      // Validate
      const val = validateRoomBlockPlacement(p1, p2, activeProperty);
      if (val.valid !== isValid) setIsValid(val.valid);
      setValidationMessage(val.reason || '');
      setDimText(`${distance.toFixed(1)}m Wall Side (H: ${height.toFixed(1)}m)`);

      const color = val.valid ? (selectedWallBlock.color || '#38bdf8') : '#ef4444';
      if (previewBoxMatRef.current) {
        previewBoxMatRef.current.color.set(color);
      }
    } else {
      if (previewBoxMeshRef.current) previewBoxMeshRef.current.visible = false;
      if (previewWireframeRef.current) previewWireframeRef.current.visible = false;
      if (startMarkerRef.current) {
        startMarkerRef.current.position.set(snapped[0], 0.05, snapped[2]);
        startMarkerRef.current.visible = true;
      }
    }
  });

  if (equippedTool !== 'room_builder') return null;

  const handleWheel = (e: ThreeEvent<WheelEvent>) => {
    if (roomBlockStartPoint) {
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newH = Math.max(0.5, Math.min(10, roomBlockHeight + delta));
      setRoomBlockHeight(Number(newH.toFixed(1)));
    }
  };

  return (
    <group onWheel={handleWheel} userData={{ isGhost: true }}>
      {/* Start Corner Marker */}
      <mesh ref={startMarkerRef} visible={false} userData={{ isGhost: true }}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>

      {/* Dynamic 3D Preview Box */}
      <mesh ref={previewBoxMeshRef} visible={false} userData={{ isGhost: true }}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={previewBoxMatRef}
          color={selectedWallBlock.color || "#38bdf8"}
          transparent
          opacity={0.4}
          roughness={0.5}
          wireframe={false}
        />
      </mesh>

      {/* Wireframe Outline around Preview Box */}
      <lineSegments ref={previewWireframeRef} visible={false} userData={{ isGhost: true }}>
        <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial color={isValid ? '#0f172a' : '#ef4444'} linewidth={2} />
      </lineSegments>

      {/* Live Dimension Overlay HTML Badge */}
      {roomBlockStartPoint && (
        <Html
          position={[
            (roomBlockStartPoint[0] + currentEndPoint[0]) / 2,
            roomBlockHeight + 0.6,
            (roomBlockStartPoint[2] + currentEndPoint[2]) / 2
          ]}
          center
        >
          <div className="pointer-events-none flex flex-col items-center bg-slate-950/90 text-white text-xs px-3 py-1.5 rounded-xl border border-sky-500/40 shadow-2xl backdrop-blur-md">
            <span className="font-bold text-sky-400">{dimText}</span>
            <span className="text-[10px] text-slate-300">WALL SIDE 2-POINT MODE</span>
            {!isValid && (
              <span className="text-[10px] text-red-400 font-semibold mt-0.5">{validationMessage}</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
