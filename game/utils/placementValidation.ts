import * as THREE from 'three';
import type {
  FurnitureCatalogItem,
  WallBlockPreset,
  RenovationProperty,
  PlacementSurface
} from '../../types/renovation';

export interface PlacementValidationParams {
  item: FurnitureCatalogItem | WallBlockPreset;
  hitPoint: THREE.Vector3;
  hitNormal: THREE.Vector3;
  hitUserData?: Record<string, any>;
  cameraPosition: THREE.Vector3;
  placementRotation: [number, number, number];
  property: RenovationProperty | null;
  maxReachDistance?: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  alignedPosition: [number, number, number];
  alignedRotation: [number, number, number];
}

// Pre-allocate temporary Three.js objects to eliminate per-frame garbage collection
const tempBoxProposed = new THREE.Box3();
const tempBoxExisting = new THREE.Box3();
const tempVecCenter = new THREE.Vector3();
const tempVecSize = new THREE.Vector3();

export function validatePlacement({
  item,
  hitPoint,
  hitNormal,
  hitUserData = {},
  cameraPosition,
  placementRotation,
  property,
  maxReachDistance = 8.0
}: PlacementValidationParams): ValidationResult {
  const defaultRes: ValidationResult = {
    valid: false,
    reason: 'Invalid target point',
    alignedPosition: [hitPoint?.x || 0, hitPoint?.y || 0, hitPoint?.z || 0],
    alignedRotation: placementRotation
  };

  if (!hitPoint || !hitNormal) return defaultRes;

  // 1. Max Reach Distance Check
  const distance = hitPoint.distanceTo(cameraPosition);
  if (distance > maxReachDistance) {
    return {
      ...defaultRes,
      valid: false,
      reason: `Target is too far away (Max reach: ${maxReachDistance}m)`
    };
  }

  const gridSnapSize = 1.0;
  const isFurniture = 'category' in item && item.category !== 'building';
  const isBuildingBlock = !isFurniture;

  // Discrete World-Space Face Normal Vector (-1, 0, 1)
  const normX = Math.abs(hitNormal.x) > 0.5 ? Math.sign(hitNormal.x) : 0;
  const normY = Math.abs(hitNormal.y) > 0.5 ? Math.sign(hitNormal.y) : 0;
  const normZ = Math.abs(hitNormal.z) > 0.5 ? Math.sign(hitNormal.z) : 0;

  const hitType = hitUserData.type || '';
  const isTargetingFloor = hitType === 'floor' || (normY === 1 && hitPoint.y <= 0.1);

  const pos: [number, number, number] = [0, 0, 0];

  if (isBuildingBlock) {
    // MINECRAFT-STYLE FACE-ADJACENT BUILDING BLOCK PLACEMENT
    const blockHeight = ('height' in item && item.height) ? item.height : 1.0;

    if (isTargetingFloor) {
      // Direct placement on floor surface
      pos[0] = Math.floor(hitPoint.x / gridSnapSize) * gridSnapSize + gridSnapSize / 2;
      pos[1] = 0;
      pos[2] = Math.floor(hitPoint.z / gridSnapSize) * gridSnapSize + gridSnapSize / 2;
    } else if (normY === 1) {
      // Direct top face placement -> place directly on top of target face
      pos[0] = Math.floor(hitPoint.x / gridSnapSize) * gridSnapSize + gridSnapSize / 2;
      pos[2] = Math.floor(hitPoint.z / gridSnapSize) * gridSnapSize + gridSnapSize / 2;
      pos[1] = Math.max(0, Math.round(hitPoint.y * 100) / 100);
    } else {
      // Targeting a side face -> compute face-adjacent grid cell
      const insidePoint = hitPoint.clone().addScaledVector(hitNormal, -0.1);
      const targetGridX = Math.floor(insidePoint.x / gridSnapSize) * gridSnapSize + gridSnapSize / 2;
      const targetGridZ = Math.floor(insidePoint.z / gridSnapSize) * gridSnapSize + gridSnapSize / 2;
      const targetGridY = Math.max(0, Math.floor((insidePoint.y + 0.05) / blockHeight) * blockHeight);

      pos[0] = targetGridX + normX * gridSnapSize;
      pos[2] = targetGridZ + normZ * gridSnapSize;
      pos[1] = Math.max(0, targetGridY + normY * blockHeight);
    }
  } else {
    // FURNITURE PLACEMENT: Ground / Surface Snapping
    pos[0] = Math.floor(hitPoint.x / gridSnapSize) * gridSnapSize + gridSnapSize / 2;
    pos[2] = Math.floor(hitPoint.z / gridSnapSize) * gridSnapSize + gridSnapSize / 2;
    pos[1] = Math.max(0, hitPoint.y);

    const furnitureItem = item as FurnitureCatalogItem;
    if (furnitureItem.placementSurface === 'WallMounted') {
      const depth = furnitureItem.dimensions ? furnitureItem.dimensions[2] : 0.4;
      pos[0] += normX * (depth / 2 + 0.02);
      pos[1] += normY * (depth / 2 + 0.02);
      pos[2] += normZ * (depth / 2 + 0.02);
    }
  }

  // 2. Property Floor Bounds Check
  if (property && property.floors && property.floors.length > 0) {
    const floor = property.floors[0];
    const { minX, maxX, minZ, maxZ } = floor.bounds;
    const margin = 0.2;
    if (pos[0] < minX + margin || pos[0] > maxX - margin || pos[2] < minZ + margin || pos[2] > maxZ - margin) {
      return {
        ...defaultRes,
        alignedPosition: pos,
        valid: false,
        reason: 'Outside property boundary'
      };
    }
  }

  // 3. Floating Air Support Check for Elevated Building Blocks (Y > 0)
  let blockHeight = 1.0;
  if ('height' in item && item.height) blockHeight = item.height;
  if ('dimensions' in item && item.dimensions) blockHeight = item.dimensions[1];

  if (isBuildingBlock && pos[1] > 0.05) {
    let hasBlockSupport = false;

    if (property) {
      for (const wall of property.walls) {
        if (wall.isDemolished) continue;

        const wMidX = (wall.startPoint[0] + wall.endPoint[0]) / 2;
        const wMidZ = (wall.startPoint[2] + wall.endPoint[2]) / 2;
        const wY = wall.startPoint[1] ?? 0;

        const dx = Math.abs(wMidX - pos[0]);
        const dy = Math.abs(wY - pos[1]);
        const dz = Math.abs(wMidZ - pos[2]);

        const isSupportBelow = dx < 0.35 && dz < 0.35 && Math.abs((wY + (wall.height || 1.0)) - pos[1]) < 0.35;
        const isSupportAbove = dx < 0.35 && dz < 0.35 && Math.abs(wY - (pos[1] + blockHeight)) < 0.35;
        const isSupportSideX = Math.abs(dy) < 1.25 && dz < 0.35 && Math.abs(dx - gridSnapSize) < 0.35;
        const isSupportSideZ = Math.abs(dy) < 1.25 && dx < 0.35 && Math.abs(dz - gridSnapSize) < 0.35;

        if (isSupportBelow || isSupportAbove || isSupportSideX || isSupportSideZ) {
          hasBlockSupport = true;
          break;
        }
      }
    }

    if (!hasBlockSupport) {
      return {
        ...defaultRes,
        alignedPosition: pos,
        valid: false,
        reason: 'Block cannot float in air without block support'
      };
    }
  }

  // 4. Grid Cell Occupancy & Collision Check
  tempVecCenter.set(pos[0], pos[1] + blockHeight / 2, pos[2]);
  tempVecSize.set(gridSnapSize, blockHeight, gridSnapSize);
  tempBoxProposed.setFromCenterAndSize(tempVecCenter, tempVecSize);
  tempBoxProposed.expandByScalar(-0.06);

  if (property) {
    // Check against existing undemolished walls
    for (const wall of property.walls) {
      if (wall.isDemolished) continue;

      const wMidX = (wall.startPoint[0] + wall.endPoint[0]) / 2;
      const wMidZ = (wall.startPoint[2] + wall.endPoint[2]) / 2;
      const wY = (wall.startPoint[1] ?? 0) + (wall.height || 1.0) / 2;
      const wSize = new THREE.Vector3(
        Math.max(1.0, Math.abs(wall.endPoint[0] - wall.startPoint[0])),
        wall.height || 1.0,
        Math.max(1.0, Math.abs(wall.endPoint[2] - wall.startPoint[2]))
      );

      tempBoxExisting.setFromCenterAndSize(new THREE.Vector3(wMidX, wY, wMidZ), wSize);
      tempBoxExisting.expandByScalar(-0.06);

      if (tempBoxProposed.intersectsBox(tempBoxExisting)) {
        return {
          ...defaultRes,
          alignedPosition: pos,
          valid: false,
          reason: 'Grid cell already occupied'
        };
      }
    }

    // Check against existing furniture
    for (const furn of property.furniture) {
      const fCenter = new THREE.Vector3(...furn.position);
      const fSize = new THREE.Vector3(1.0, 1.0, 1.0);
      tempBoxExisting.setFromCenterAndSize(fCenter, fSize);
      tempBoxExisting.expandByScalar(-0.06);

      if (tempBoxProposed.intersectsBox(tempBoxExisting)) {
        return {
          ...defaultRes,
          alignedPosition: pos,
          valid: false,
          reason: 'Grid cell already occupied by furniture'
        };
      }
    }
  }

  return {
    valid: true,
    alignedPosition: pos,
    alignedRotation: placementRotation
  };
}
