'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useRenovationStore } from '../../stores/renovationStore';
import { validatePlacement } from '../utils/placementValidation';

interface FPSControllerProps {
  onPointerTargetChange?: (pos: THREE.Vector3 | null, normal: THREE.Vector3 | null, userData?: Record<string, any> | null) => void;
}

export const FirstPersonRenovationController: React.FC<FPSControllerProps> = ({
  onPointerTargetChange
}) => {
  const { camera, scene, gl } = useThree();
  const controlsRef = useRef<any>(null);

  // Safely catch browser SecurityError when requesting pointer lock too quickly after exiting
  useEffect(() => {
    const domEl = gl.domElement;
    if (!domEl) return;
    const originalRequestPointerLock = domEl.requestPointerLock;
    domEl.requestPointerLock = function (options?: PointerLockOptions): Promise<void> {
      try {
        const res = originalRequestPointerLock.call(domEl, options);
        if (res && typeof (res as any).catch === 'function') {
          (res as any).catch((err: any) => {
            if (err?.name === 'SecurityError' || err?.message?.includes('exited')) {
              console.warn('Pointer Lock cooldown active; click canvas again to lock.');
            }
          });
          return res;
        }
        return Promise.resolve();
      } catch (err: any) {
        console.warn('Pointer Lock suppressed:', err);
        return Promise.resolve();
      }
    };
    return () => {
      domEl.requestPointerLock = originalRequestPointerLock;
    };
  }, [gl]);

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

  const [, setIsLocked] = useState(false);
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
        camera.position.set(0, 1.6, 6);
      }
      camera.lookAt(0, 1.6, 0);
    }
  }, [activeProperty, camera]);

  // Handle MOUSE CLICK for Renovation tool actions
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || !controlsRef.current || !controlsRef.current.isLocked) return;

      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0 && intersects[0].distance < 8.0) {
        const hit = intersects[0];
        let obj: THREE.Object3D | null = hit.object;

        while (obj && !obj.userData?.type && obj.parent && obj.parent !== scene) {
          obj = obj.parent;
        }

        const userData = obj?.userData || {};
        const hitNormal = hit.face?.normal ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);

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
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [buildWall, camera, changeFlooring, demolishWall, equippedTool, paintWallSegment, placeFurniture, placementRotation, repairFixture, scene, scrubDirtStain, selectedFurniture]);

  // Keyboard controls listener
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
        case 'KeyF':
          setCatalogOpen(true);
          break;
        case 'Escape':
          if (selectedFurniture || equippedTool === 'furniture') {
            useRenovationStore.getState().setSelectedFurniture(null);
            setEquippedTool('inspect');
            useRenovationStore.getState().showToast('Deselected object (Selection Cancelled)');
          } else {
            setPaused(!isPaused);
          }
          break;
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

  // Frame tick loop: WASD locomotion, touch D-Pad & vertical elevation
  useFrame((_, delta) => {
    const mobileMove = useRenovationStore.getState().mobileMoveState;
    const isPointerLocked = controlsRef.current?.isLocked;

    // Allow mobile move if active or pointer lock is engaged
    const isForward = moveState.current.forward || mobileMove.forward;
    const isBackward = moveState.current.backward || mobileMove.backward;
    const isLeft = moveState.current.left || mobileMove.left;
    const isRight = moveState.current.right || mobileMove.right;
    const isUp = moveState.current.up || mobileMove.up;
    const isDown = moveState.current.down || mobileMove.down;

    const speed = (moveState.current.sprint ? 8.5 : 4.5);
    const friction = 10.0;

    velocity.current.x -= velocity.current.x * friction * delta;
    velocity.current.z -= velocity.current.z * friction * delta;

    const direction = new THREE.Vector3();
    const forward = Number(isForward) - Number(isBackward);
    const side = Number(isRight) - Number(isLeft);

    direction.set(side, 0, forward).normalize();

    if (isForward || isBackward) {
      velocity.current.z -= direction.z * speed * delta * 12;
    }
    if (isLeft || isRight) {
      velocity.current.x -= direction.x * speed * delta * 12;
    }

    if (controlsRef.current) {
      controlsRef.current.moveForward(-velocity.current.z * delta);
      controlsRef.current.moveRight(-velocity.current.x * delta);
    } else {
      camera.translateZ(velocity.current.z * delta);
      camera.translateX(-velocity.current.x * delta);
    }

    // Touch camera yaw rotation
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

    // Raycast forward from center crosshair
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0 && intersects[0].distance < 8.0) {
      const hit = intersects[0];
      let obj: THREE.Object3D | null = hit.object;
      while (obj && !obj.userData?.type && obj.parent && obj.parent !== scene) {
        obj = obj.parent;
      }
      const userData = obj?.userData || hit.object?.userData || {};
      if (onPointerTargetChange) {
        onPointerTargetChange(hit.point, hit.face?.normal || null, userData);
      }
    } else {
      if (onPointerTargetChange) {
        onPointerTargetChange(null, null, null);
      }
    }
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={() => setIsLocked(true)}
      onUnlock={() => setIsLocked(false)}
    />
  );
};
