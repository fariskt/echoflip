'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useRenovationStore } from '../../stores/renovationStore';
import type { RoomBlockType } from '../../types/renovation';
import { validatePlacement } from '../utils/placementValidation';
import { validateRoomBlockPlacement } from '../utils/roomBlockGenerator';

interface FPSControllerProps {
  onPointerTargetChange?: (pos: THREE.Vector3 | null, normal: THREE.Vector3 | null, userData?: Record<string, any> | null) => void;
}

export const FirstPersonRenovationController: React.FC<FPSControllerProps> = ({
  onPointerTargetChange
}) => {
  const { camera, scene, gl, pointer } = useThree();

  const activeProperty = useRenovationStore((state) => state.activeProperty);
  const equippedTool = useRenovationStore((state) => state.equippedTool);
  const setEquippedTool = useRenovationStore((state) => state.setEquippedTool);
  const isPaused = useRenovationStore((state) => state.isPaused);
  const setPaused = useRenovationStore((state) => state.setPaused);
  const setCatalogOpen = useRenovationStore((state) => state.setCatalogOpen);
  const setPaintMenuOpen = useRenovationStore((state) => state.setPaintMenuOpen);
  const setContractMenuOpen = useRenovationStore((state) => state.setContractMenuOpen);

  const selectedFurniture = useRenovationStore((state) => state.selectedFurniture);
  const selectedWallBlock = useRenovationStore((state) => state.selectedWallBlock);
  const placementRotation = useRenovationStore((state) => state.placementRotation);
  const rotatePlacementYaw = useRenovationStore((state) => state.rotatePlacementYaw);
  const tiltPlacementPitch = useRenovationStore((state) => state.tiltPlacementPitch);
  const rollPlacementRoll = useRenovationStore((state) => state.rollPlacementRoll);
  const resetPlacementRotation = useRenovationStore((state) => state.resetPlacementRotation);

  // Store actions
  const scrubDirtStain = useRenovationStore((state) => state.scrubDirtStain);
  const paintWallSegment = useRenovationStore((state) => state.paintWallSegment);
  const changeFlooring = useRenovationStore((state) => state.changeFlooring);
  const repairFixture = useRenovationStore((state) => state.repairFixture);
  const demolishWall = useRenovationStore((state) => state.demolishWall);
  const buildWall = useRenovationStore((state) => state.buildWall);
  const placeFurniture = useRenovationStore((state) => state.placeFurniture);
  const actionSignal = useRenovationStore((state) => state.actionSignal);

  const spawnedPropertyIdRef = useRef<string | null>(null);

  // WASD + Fly movement state
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    up: false,
    down: false
  });

  const velocity = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    if (activeProperty && spawnedPropertyIdRef.current !== activeProperty.id) {
      spawnedPropertyIdRef.current = activeProperty.id;
      if (activeProperty.spawnPoint) {
        camera.position.set(...activeProperty.spawnPoint);
      } else {
        camera.position.set(0, 1.6, 20);
      }
      camera.lookAt(0, 1.6, 0);
    }
  }, [activeProperty, camera]);

  const lastActionTimeRef = useRef<number>(0);

function findValidRaycastHit(intersects: THREE.Intersection[]): THREE.Intersection | null {
  for (const hit of intersects) {
    if (hit.distance >= 60.0) break;
    let isGhostOrHelper = false;
    let obj: THREE.Object3D | null = hit.object;
    while (obj) {
      if (
        obj.userData?.isGhost ||
        obj.userData?.type === 'ghost' ||
        obj.name === 'ghost' ||
        obj.type === 'LineSegments' ||
        obj.type === 'GridHelper'
      ) {
        isGhostOrHelper = true;
        break;
      }
      obj = obj.parent;
    }
    if (!isGhostOrHelper) return hit;
  }
  return null;
}

  // Reusable Tool Action execution (raycasting directly from mouse cursor position)
  const executeToolAction = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 150) {
      return; // Single-click placement transaction lock
    }
    lastActionTimeRef.current = now;

    // Raycast directly from center-screen crosshair Vector2(0, 0) (Minecraft-style targeting)
    const centerPointer = new THREE.Vector2(0, 0);
    raycaster.current.setFromCamera(centerPointer, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    const hit = findValidRaycastHit(intersects);

    if (hit) {
      let obj: THREE.Object3D | null = hit.object;

      while (obj && !obj.userData?.type && obj.parent && obj.parent !== scene) {
        obj = obj.parent;
      }

      const userData = obj?.userData || hit.object?.userData || {};
      const hitNormal = hit.face?.normal
        ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
        : new THREE.Vector3(0, 1, 0);

      if (equippedTool === 'room_builder' || equippedTool === 'roof_builder') {
        if (!hit.point) return;
        const store = useRenovationStore.getState();
        const step = store.gridSnapEnabled ? store.gridSnapSize : 1.0;

        const hitY = hit.point.y || 0;
        const surfaceY = hitY > 0.1 ? Number(hitY.toFixed(2)) : store.getFloorElevationY();

        let snappedPt: [number, number, number] = store.gridSnapEnabled
          ? [Math.round(hit.point.x / step) * step, surfaceY, Math.round(hit.point.z / step) * step]
          : [Number(hit.point.x.toFixed(2)), surfaceY, Number(hit.point.z.toFixed(2))];

        const startPt = store.roomBlockStartPoint;
        if (!startPt) {
          store.setRoomBlockStartPoint(snappedPt);
          const toolLabel = (equippedTool === 'roof_builder' || store.activeRoomBlockType === 'roof') ? 'roof' : 'wall';
          store.showToast(`🎯 Point 1 set at (${snappedPt[0]}, Y:${snappedPt[1]}, ${snappedPt[2]}). Aim at Point 2 & click!`);
        } else {
          snappedPt[1] = startPt[1];

          const isSingleWall = store.activeRoomBlockType === 'wall' || store.roomShapeMode === 'single_wall';
          const isRoof = equippedTool === 'roof_builder' || store.activeRoomBlockType === 'roof';

          if (isSingleWall && !isRoof) {
            const dx = Math.abs(snappedPt[0] - startPt[0]);
            const dz = Math.abs(snappedPt[2] - startPt[2]);
            if (dx >= dz) {
              snappedPt[2] = startPt[2];
            } else {
              snappedPt[0] = startPt[0];
            }
          }

          const distance = Math.hypot(snappedPt[0] - startPt[0], snappedPt[2] - startPt[2]);
          if (distance < 0.2) {
            store.showToast(`⚠️ Aim at 2nd point to set length (min 0.2m)`);
            return;
          }

          const val = validateRoomBlockPlacement(startPt, snappedPt, store.activeProperty);
          if (!val.valid) {
            store.showToast(`❌ Cannot create: ${val.reason || 'Invalid location'}`);
            return;
          }

          const activeRoomBlockType = store.activeRoomBlockType;
          const roomShapeMode = store.roomShapeMode;
          const blockTypeToCreate: RoomBlockType = isRoof
            ? 'roof'
            : (roomShapeMode === 'rectangle' ? 'empty_room' : (activeRoomBlockType || 'wall'));
          const roomBlockHeight = store.roomBlockHeight;
          const height = isRoof ? 0.4 : (blockTypeToCreate === 'floor' ? 0.15 : blockTypeToCreate === 'foundation' ? 0.5 : roomBlockHeight);

          store.createRoomBlock({
            type: blockTypeToCreate,
            elevationY: startPt[1],
            roofType: isRoof ? (store.selectedRoofType === 'none' ? 'flat' : store.selectedRoofType) : (blockTypeToCreate === 'wall' ? 'none' : store.selectedRoofType),
            start: startPt,
            end: snappedPt,
            height,
            wallThickness: store.roomBlockWallThickness,
            wallPresetId: store.selectedWallBlock.id,
            flooringMaterialId: store.selectedFlooring.id,
            hasCeiling: store.includeCeiling,
            color: store.selectedWallBlock.color
          });

          store.setRoomBlockStartPoint(null);
        }
        return;
      }

      if (equippedTool === 'inspect') {
        if (userData.type === 'furniture' && userData.id) {
          useRenovationStore.getState().setSelectedPlacedFurnitureId(userData.id);
          useRenovationStore.getState().showToast(`🔍 Selected ${userData.name || 'Placed Object'}! [R] Yaw, [T] Tilt, [G] Roll`);
        } else if (userData.type === 'wall' && userData.id) {
          useRenovationStore.getState().setSelectedPlacedWallId(userData.id);
          useRenovationStore.getState().showToast(`🔍 Selected Wall Block! [R] Yaw, [T] Tilt, [G] Roll`);
        } else if (userData.type === 'fixture') {
          useRenovationStore.getState().showToast(`🔍 Inspected Fixture: ${userData.name || 'Fixture'}`);
        }
        return;
      }

      if (userData.type === 'stain') {
        if (equippedTool === 'sponge') {
          scrubDirtStain(userData.id);
        }
      } else if (userData.type === 'wall') {
        if (equippedTool === 'paint_roller') {
          paintWallSegment(userData.id);
        } else if (equippedTool === 'hammer') {
          demolishWall(userData.id);
        } else if (equippedTool === 'wall_builder') {
          const valRes = validatePlacement({
            item: selectedWallBlock,
            hitPoint: hit.point,
            hitNormal,
            hitUserData: userData,
            cameraPosition: camera.position,
            placementRotation,
            property: activeProperty
          });
          if (!valRes.valid) {
            useRenovationStore.getState().showToast(`⚠️ Placement Blocked: ${valRes.reason}`);
            return;
          }
          buildWall(valRes.alignedPosition);
        } else if (equippedTool === 'furniture' && selectedFurniture) {
          const valRes = validatePlacement({
            item: selectedFurniture,
            hitPoint: hit.point,
            hitNormal,
            hitUserData: userData,
            cameraPosition: camera.position,
            placementRotation,
            property: activeProperty
          });
          if (!valRes.valid) {
            useRenovationStore.getState().showToast(`⚠️ Placement Blocked: ${valRes.reason}`);
            return;
          }
          placeFurniture(selectedFurniture, valRes.alignedPosition, placementRotation);
        }
      } else if (userData.type === 'floor') {
        if (equippedTool === 'flooring') {
          changeFlooring(userData.id);
        } else if (equippedTool === 'wall_builder') {
          const valRes = validatePlacement({
            item: selectedWallBlock,
            hitPoint: hit.point,
            hitNormal,
            hitUserData: userData,
            cameraPosition: camera.position,
            placementRotation,
            property: activeProperty
          });
          if (!valRes.valid) {
            useRenovationStore.getState().showToast(`⚠️ Placement Blocked: ${valRes.reason}`);
            return;
          }
          buildWall(valRes.alignedPosition);
        } else if (equippedTool === 'furniture' && selectedFurniture) {
          const valRes = validatePlacement({
            item: selectedFurniture,
            hitPoint: hit.point,
            hitNormal,
            hitUserData: userData,
            cameraPosition: camera.position,
            placementRotation,
            property: activeProperty
          });
          if (!valRes.valid) {
            useRenovationStore.getState().showToast(`⚠️ Placement Blocked: ${valRes.reason}`);
            return;
          }
          placeFurniture(selectedFurniture, valRes.alignedPosition, placementRotation);
        }
      } else if (userData.type === 'fixture') {
        if (userData.isBroken) {
          repairFixture(userData.id);
        }
      } else {
        if (equippedTool === 'wall_builder' && hit.point) {
          const valRes = validatePlacement({
            item: selectedWallBlock,
            hitPoint: hit.point,
            hitNormal,
            hitUserData: userData,
            cameraPosition: camera.position,
            placementRotation,
            property: activeProperty
          });
          if (!valRes.valid) {
            useRenovationStore.getState().showToast(`⚠️ Placement Blocked: ${valRes.reason}`);
            return;
          }
          buildWall(valRes.alignedPosition);
        } else if (equippedTool === 'furniture' && selectedFurniture && hit.point) {
          const valRes = validatePlacement({
            item: selectedFurniture,
            hitPoint: hit.point,
            hitNormal,
            hitUserData: userData,
            cameraPosition: camera.position,
            placementRotation,
            property: activeProperty
          });
          if (!valRes.valid) {
            useRenovationStore.getState().showToast(`⚠️ Placement Blocked: ${valRes.reason}`);
            return;
          }
          placeFurniture(selectedFurniture, valRes.alignedPosition, placementRotation);
        }
      }
    }
  }, [activeProperty, buildWall, camera, changeFlooring, demolishWall, equippedTool, paintWallSegment, placeFurniture, placementRotation, pointer, repairFixture, scene, scrubDirtStain, selectedFurniture, selectedWallBlock]);

  // Infinite Mouse Look (Pointer Lock + Hardware Movement Delta) & Tool Action Handler
  useEffect(() => {
    let previousMouseX: number | null = null;
    let previousMouseY: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      // Ignore mouse move if hovering over interactive UI buttons/overlays
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.pointer-events-auto'))) {
        previousMouseX = null;
        previousMouseY = null;
        return;
      }

      let deltaX = 0;
      let deltaY = 0;

      if (document.pointerLockElement === gl.domElement) {
        deltaX = e.movementX || 0;
        deltaY = e.movementY || 0;
      } else if (e.movementX !== undefined && (e.movementX !== 0 || e.movementY !== 0)) {
        deltaX = e.movementX;
        deltaY = e.movementY;
      } else if (previousMouseX !== null && previousMouseY !== null) {
        deltaX = e.clientX - previousMouseX;
        deltaY = e.clientY - previousMouseY;
      }

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;

      if (Math.abs(deltaX) < 150 && Math.abs(deltaY) < 150 && (deltaX !== 0 || deltaY !== 0)) {
        camera.rotation.order = 'YXZ';
        const sensitivity = 0.003;
        camera.rotation.y -= deltaX * sensitivity;
        camera.rotation.x -= deltaY * sensitivity;
        camera.rotation.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, camera.rotation.x));
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.pointer-events-auto'))) {
        return;
      }

      // Engage Pointer Lock on 3D viewport canvas for 360 mouse look
      if (document.pointerLockElement !== gl.domElement) {
        try {
          gl.domElement.requestPointerLock();
        } catch {}
      }

      if (e.button === 2) {
        // RIGHT CLICK: Cancel rect wall corner selection if active, or rotate ghost 90°
        e.preventDefault();
        const store = useRenovationStore.getState();
        if (store.roomBlockStartPoint) {
          store.setRoomBlockStartPoint(null);
          store.showToast('Rect Wall Creation Cancelled');
        } else {
          rotatePlacementYaw(90);
          useRenovationStore.getState().showToast('🔮 Glass Ghost Preview: Rotated 90° [Left-Click to place]');
        }
      } else if (e.button === 0) {
        // ONLY LEFT CLICK PLACES THE ITEM / BLOCK INTO THE WORLD!
        executeToolAction();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.pointer-events-auto'))) {
        return;
      }

      // Smooth scroll wheel zoom in / zoom out along camera look vector
      const zoomStep = Math.max(-2.5, Math.min(2.5, -e.deltaY * 0.012));
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, zoomStep);
      camera.position.y = Math.max(0.5, Math.min(30.0, camera.position.y));
    };

    const domEl = gl.domElement;
    window.addEventListener('mousemove', handleMouseMove);
    domEl.addEventListener('mousedown', handleMouseDown);
    domEl.addEventListener('contextmenu', handleContextMenu);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      domEl.removeEventListener('mousedown', handleMouseDown);
      domEl.removeEventListener('contextmenu', handleContextMenu);
      domEl.removeEventListener('wheel', handleWheel);
    };
  }, [camera, executeToolAction, gl.domElement]);

  // Handle Mobile Action Signal Triggering
  const prevActionSignalRef = useRef(actionSignal);
  useEffect(() => {
    if (actionSignal !== prevActionSignalRef.current) {
      prevActionSignalRef.current = actionSignal;
      executeToolAction();
    }
  }, [actionSignal, executeToolAction]);

  // Mobile Touch Drag Camera Look Handler
  useEffect(() => {
    let lookTouchId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.clientX > window.innerWidth * 0.35 && lookTouchId === null) {
          const target = touch.target as HTMLElement | null;
          if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.pointer-events-auto'))) {
            continue;
          }
          lookTouchId = touch.identifier;
          lastX = touch.clientX;
          lastY = touch.clientY;
          break;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (lookTouchId === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === lookTouchId) {
          const deltaX = touch.clientX - lastX;
          const deltaY = touch.clientY - lastY;
          lastX = touch.clientX;
          lastY = touch.clientY;

          camera.rotation.order = 'YXZ';
          const sensitivity = 0.0035;
          camera.rotation.y -= deltaX * sensitivity;
          camera.rotation.x -= deltaY * sensitivity;
          camera.rotation.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, camera.rotation.x));
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (lookTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === lookTouchId) {
          lookTouchId = null;
          break;
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [camera]);

  // Keyboard controls listener (PC WASD controls)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.sprint = true;
          break;
        case 'Space':
        case 'KeyE':
          moveState.current.up = true;
          break;
        case 'ControlLeft':
        case 'KeyQ':
          moveState.current.down = true;
          break;
        case 'KeyR':
          rotatePlacementYaw(e.shiftKey ? 90 : 45);
          break;
        case 'KeyT':
          tiltPlacementPitch(15);
          break;
        case 'KeyG':
          rollPlacementRoll(15);
          break;
        case 'KeyX':
          resetPlacementRotation();
          break;
        case 'Delete':
        case 'Backspace': {
          const store = useRenovationStore.getState();
          if (store.selectedPlacedFurnitureId || store.selectedPlacedWallId || store.selectedPlacedBlockId) {
            store.deleteSelectedObject();
          }
          break;
        }
        case 'Digit1':
          setEquippedTool('inspect');
          break;
        case 'Digit2':
          setEquippedTool('sponge');
          break;
        case 'Digit3':
          setEquippedTool('paint_roller');
          setPaintMenuOpen(true);
          break;
        case 'Digit4':
          setEquippedTool('flooring');
          setPaintMenuOpen(true);
          break;
        case 'Digit5':
          setEquippedTool('hammer');
          break;
        case 'Digit6':
          setEquippedTool('wall_builder');
          break;
        case 'Digit7':
          setEquippedTool('furniture');
          setCatalogOpen(true);
          break;
        case 'KeyC':
          setContractMenuOpen(true);
          break;
        case 'KeyB':
          setEquippedTool('room_builder');
          useRenovationStore.getState().setActiveRoomBlockType('empty_room');
          useRenovationStore.getState().setRoomShapeMode('rectangle');
          break;
        case 'KeyF':
          setEquippedTool('room_builder');
          useRenovationStore.getState().setActiveRoomBlockType('wall');
          useRenovationStore.getState().setRoomShapeMode('single_wall');
          break;
        case 'KeyR':
          setEquippedTool('roof_builder');
          useRenovationStore.getState().setActiveRoomBlockType('roof');
          useRenovationStore.getState().showToast('🏠 Roof Draw Tool Equipped [R] - Click 2 points to draw roof!');
          break;
        case 'Escape': {
          const store = useRenovationStore.getState();
          if (store.roomBlockStartPoint) {
            store.setRoomBlockStartPoint(null);
            store.showToast('Rect Wall Creation Cancelled [ESC]');
            break;
          }
          const isAnyMenuOpen = store.isCatalogOpen || store.isPaintMenuOpen || store.isContractMenuOpen;
          const hasSelectedObject = !!store.selectedFurniture || !!store.selectedPlacedFurnitureId || !!store.selectedPlacedWallId;

          if (equippedTool !== 'inspect' || isAnyMenuOpen || hasSelectedObject) {
            store.setSelectedFurniture(null);
            store.setSelectedPlacedFurnitureId(null);
            store.setSelectedPlacedWallId(null);
            setCatalogOpen(false);
            setPaintMenuOpen(false);
            setContractMenuOpen(false);
            setEquippedTool('inspect');
            store.showToast('Tool & Selection cancelled (Reset to Default Inspect)');
          } else {
            setPaused(!isPaused);
          }
          break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.sprint = false;
          break;
        case 'Space':
        case 'KeyE':
          moveState.current.up = false;
          break;
        case 'ControlLeft':
        case 'KeyQ':
          moveState.current.down = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, resetPlacementRotation, rollPlacementRoll, rotatePlacementYaw, setCatalogOpen, setContractMenuOpen, setEquippedTool, setPaintMenuOpen, setPaused, tiltPlacementPitch]);

  // Frame tick loop: WASD locomotion & mouse cursor raycasting
  useFrame((_, delta) => {
    const mobileMove = useRenovationStore.getState().mobileMoveState;

    const isUp = moveState.current.up || mobileMove.up;
    const isDown = moveState.current.down || mobileMove.down;
    const isSprint = moveState.current.sprint || mobileMove.sprint;

    const speed = isSprint ? 8.5 : 4.5;
    const friction = 10.0;

    velocity.current.x -= velocity.current.x * friction * delta;
    velocity.current.z -= velocity.current.z * friction * delta;

    let forwardInput = Number(moveState.current.forward) - Number(moveState.current.backward);
    let sideInput = Number(moveState.current.right) - Number(moveState.current.left);

    if (mobileMove.forward) forwardInput += 1;
    if (mobileMove.backward) forwardInput -= 1;
    if (mobileMove.right) sideInput += 1;
    if (mobileMove.left) sideInput -= 1;

    if (mobileMove.analogY !== 0) forwardInput = mobileMove.analogY;
    if (mobileMove.analogX !== 0) sideInput = mobileMove.analogX;

    forwardInput = Math.max(-1, Math.min(1, forwardInput));
    sideInput = Math.max(-1, Math.min(1, sideInput));

    if (forwardInput !== 0 || sideInput !== 0) {
      const inputVec = new THREE.Vector3(sideInput, 0, forwardInput);
      const mag = Math.min(1, inputVec.length());
      inputVec.normalize();

      velocity.current.z -= inputVec.z * speed * delta * 12 * mag;
      velocity.current.x -= inputVec.x * speed * delta * 12 * mag;
    }

    camera.translateZ(velocity.current.z * delta);
    camera.translateX(-velocity.current.x * delta);

    // Apply Touch Drag Camera Rotation
    const lookDelta = useRenovationStore.getState().consumeMobileLookDelta();
    if (lookDelta.x !== 0 || lookDelta.y !== 0) {
      camera.rotation.order = 'YXZ';
      const sensitivity = 0.0035;
      camera.rotation.y -= lookDelta.x * sensitivity;
      camera.rotation.x -= lookDelta.y * sensitivity;
      camera.rotation.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, camera.rotation.x));
    }

    // Discrete Touch camera yaw rotation fallbacks
    if (mobileMove.turnLeft) {
      camera.rotation.y += 1.5 * delta;
    }
    if (mobileMove.turnRight) {
      camera.rotation.y -= 1.5 * delta;
    }

    // Vertical Up / Down movement controls
    if (isUp) {
      camera.position.y += speed * delta;
    }
    if (isDown) {
      camera.position.y -= speed * delta;
    }
    camera.position.y = Math.max(0.5, Math.min(30.0, camera.position.y));

    // Raycast continuously from center-screen crosshair Vector2(0,0) (Minecraft-style targeting)
    const centerPointer = new THREE.Vector2(0, 0);
    raycaster.current.setFromCamera(centerPointer, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    const hit = findValidRaycastHit(intersects);

    if (hit) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj && !obj.userData?.type && obj.parent && obj.parent !== scene) {
        obj = obj.parent;
      }
      const userData = obj?.userData || hit.object?.userData || {};
      const hitNormal = hit.face?.normal
        ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
        : null;

      if (onPointerTargetChange) {
        onPointerTargetChange(hit.point, hitNormal, userData);
      }
    } else {
      if (onPointerTargetChange) {
        onPointerTargetChange(null, null, null);
      }
    }
  });

  return null;
};
