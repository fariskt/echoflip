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

  const activeFloorLevel = useRenovationStore((state) => state.activeFloorLevel);
  const getFloorElevationY = useRenovationStore((state) => state.getFloorElevationY);
  const roomShapeMode = useRenovationStore((state) => state.roomShapeMode);
  const selectedRoomTag = useRenovationStore((state) => state.selectedRoomTag);
  const polygonPathPoints = useRenovationStore((state) => state.polygonPathPoints);

  const [currentEndPoint, setCurrentEndPoint] = useState<[number, number, number]>([0, 0, 0]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [dimText, setDimText] = useState<string>('');
  const [metricsAreaText, setMetricsAreaText] = useState<string>('');
  const [metricsCostText, setMetricsCostText] = useState<string>('');

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
        showToast('Wall Creation Cancelled [ESC]');
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

  // Snap helper with Shift / Ctrl modifier check and Floor Level Y
  const snapPoint = (pt: THREE.Vector3): [number, number, number] => {
    let step = gridSnapSize;
    const elevationY = getFloorElevationY();
    if (isShiftPressed.current || !gridSnapEnabled) {
      return [Number(pt.x.toFixed(2)), elevationY, Number(pt.z.toFixed(2))];
    }
    if (isCtrlPressed.current) {
      step = 0.1; // Fine snapping
    }
    const x = Math.round(pt.x / step) * step;
    const z = Math.round(pt.z / step) * step;
    return [Number(x.toFixed(2)), elevationY, Number(z.toFixed(2))];
  };

  // Live frame updates for 3D wall & room preview geometry
  useFrame(() => {
    if (equippedTool !== 'room_builder' && equippedTool !== 'roof_builder') return;

    const startY = roomBlockStartPoint
      ? roomBlockStartPoint[1]
      : (pointerPosition && pointerPosition.y > 0.1 ? Number(pointerPosition.y.toFixed(2)) : getFloorElevationY());

    let hitPt: THREE.Vector3 | null = pointerPosition || null;

    if (!hitPt) {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -startY);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        hitPt = intersection;
      }
    }

    if (!hitPt) return;

    const snapped = snapPoint(hitPt);
    snapped[1] = startY;

    if (roomBlockStartPoint) {
      const p1 = roomBlockStartPoint;
      let p2 = snapped;

      const isRoofTool = equippedTool === 'roof_builder' || activeRoomBlockType === 'roof';
      const isSingleWall = !isRoofTool && (activeRoomBlockType === 'wall' || roomShapeMode === 'single_wall');

      if (isSingleWall && !isShiftPressed.current) {
        const dx = Math.abs(p2[0] - p1[0]);
        const dz = Math.abs(p2[2] - p1[2]);
        if (dx >= dz) {
          p2 = [p2[0], p1[1], p1[2]];
        } else {
          p2 = [p1[0], p1[1], p2[2]];
        }
      }

      setCurrentEndPoint(p2);
      const distance = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);
      const angle = isRoofTool || isSingleWall ? 0 : Math.atan2(p2[0] - p1[0], p2[2] - p1[2]);

      const midX = (p1[0] + p2[0]) / 2;
      const midZ = (p1[2] + p2[2]) / 2;
      const height = isRoofTool ? 0.6 : (roomBlockHeight || 2.8);
      const centerY = startY + height / 2;
      const thickness = roomBlockWallThickness || 0.2;

      const width = Math.max(0.2, Math.abs(p2[0] - p1[0]));
      const length = Math.max(0.2, Math.abs(p2[2] - p1[2]));

      // Update preview mesh
      if (previewBoxMeshRef.current) {
        previewBoxMeshRef.current.position.set(midX, centerY, midZ);
        previewBoxMeshRef.current.rotation.set(0, angle, 0);
        previewBoxMeshRef.current.scale.set(
          isRoofTool ? width : (isSingleWall ? (p1[2] === p2[2] ? distance : thickness) : (roomShapeMode === 'rectangle' ? width : thickness)),
          height,
          isRoofTool ? length : (isSingleWall ? (p1[0] === p2[0] ? distance : thickness) : (roomShapeMode === 'rectangle' ? length : distance))
        );
        previewBoxMeshRef.current.visible = true;
      }

      if (previewWireframeRef.current) {
        previewWireframeRef.current.position.set(midX, centerY, midZ);
        previewWireframeRef.current.rotation.set(0, angle, 0);
        previewWireframeRef.current.scale.set(
          (isRoofTool ? width : (isSingleWall ? (p1[2] === p2[2] ? distance : thickness) : (roomShapeMode === 'rectangle' ? width : thickness))) * 1.002,
          height * 1.002,
          (isRoofTool ? length : (isSingleWall ? (p1[0] === p2[0] ? distance : thickness) : (roomShapeMode === 'rectangle' ? length : distance))) * 1.002
        );
        previewWireframeRef.current.visible = true;
      }

      if (startMarkerRef.current) {
        startMarkerRef.current.position.set(p1[0], startY + 0.05, p1[2]);
        startMarkerRef.current.visible = true;
      }

      // Validate
      const val = validateRoomBlockPlacement(p1, p2, activeProperty);
      if (val.valid !== isValid) setIsValid(val.valid);
      setValidationMessage(val.reason || '');

      const area = (width * length).toFixed(1);
      const estCost = isRoofTool
        ? Math.round(width * length * 45)
        : Math.round((2 * (width + length) * height * (selectedWallBlock.price / 10)) + (width * length * 35));

      setDimText(isRoofTool ? `${width.toFixed(1)}m x ${length.toFixed(1)}m Roof Area` : `${distance.toFixed(1)}m Side (L: ${levelName(activeFloorLevel)})`);
      setMetricsAreaText(`${area} m² ${isRoofTool ? 'Roof' : 'Area'} (${selectedRoomTag})`);
      setMetricsCostText(`Est. Build: $${estCost.toLocaleString()}`);

      const color = val.valid ? (isRoofTool ? '#9a3412' : (selectedWallBlock.color || '#38bdf8')) : '#ef4444';
      if (previewBoxMatRef.current) {
        previewBoxMatRef.current.color.set(color);
      }
    } else {
      if (previewBoxMeshRef.current) previewBoxMeshRef.current.visible = false;
      if (previewWireframeRef.current) previewWireframeRef.current.visible = false;
      if (startMarkerRef.current) {
        startMarkerRef.current.position.set(snapped[0], startY + 0.05, snapped[2]);
        startMarkerRef.current.visible = true;
      }
    }
  });

  if (equippedTool !== 'room_builder' && equippedTool !== 'roof_builder') return null;

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

      {/* Live Top-Right Dimension & Architectural Metric Overlay HTML Badge */}
      {roomBlockStartPoint && (
        <Html fullscreen zIndexRange={[100, 0]}>
          <div className="pointer-events-auto fixed top-24 right-4 sm:top-16 sm:right-6 z-40 flex flex-col items-end bg-slate-950/95 text-white px-4 py-3 rounded-2xl border border-sky-500/50 shadow-2xl backdrop-blur-md whitespace-nowrap min-w-[210px] transition-all duration-200">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
              <span className="font-extrabold text-sm text-sky-400 tracking-tight">{dimText}</span>
            </div>

            {metricsAreaText && (
              <span className="text-[11px] font-bold text-emerald-400 mt-1">
                📐 {metricsAreaText}
              </span>
            )}

            {metricsCostText && (
              <span className="text-[11px] font-bold text-amber-300 mt-0.5">
                💵 {metricsCostText}
              </span>
            )}

            <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase mt-1 bg-slate-800 px-2 py-0.5 rounded-full">
              LEVEL: {activeFloorLevel.toUpperCase()} • MODE: {roomShapeMode.toUpperCase()}
            </span>

            {!isValid && (
              <div className="text-[11px] text-red-400 font-bold bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-800/60 mt-1.5 flex items-center space-x-1">
                <span>⚠️ {validationMessage || 'Invalid placement'}</span>
              </div>
            )}

            <button
              onClick={() => {
                setRoomBlockStartPoint(null);
                showToast('Wall Side Creation Cancelled');
              }}
              className="mt-2 px-3 py-1 rounded-lg bg-red-600/90 hover:bg-red-700 active:scale-95 text-[11px] font-bold text-white shadow transition"
            >
              Cancel Corner [ESC]
            </button>
          </div>
        </Html>
      )}
    </group>
  );
};

function levelName(level: string): string {
  switch (level) {
    case 'basement': return 'Basement (-3m)';
    case 'ground': return 'Ground (0m)';
    case 'first': return '1st Floor (2.8m)';
    case 'second': return '2nd Floor (5.6m)';
    case 'roof': return 'Roof (8.4m)';
    default: return 'Ground (0m)';
  }
}
