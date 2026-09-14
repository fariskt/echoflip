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

// Pre-allocate temporary Three.js objects to eliminate garbage collection & per-frame allocation
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
  maxReachDistance = 6.0
}: PlacementValidationParams): ValidationResult {
  const defaultRes: ValidationResult = {
    valid: false,
    reason: 'Invalid hit point',
    alignedPosition: [hitPoint.x, hitPoint.y, hitPoint.z],
    alignedRotation: placementRotation
  };

  if (!hitPoint || !hitNormal) return defaultRes;

  // 1. Reach Distance Check
  const distance = hitPoint.distanceTo(cameraPosition);
  if (distance > maxReachDistance) {
    return {
      ...defaultRes,
      valid: false,
      reason: `Target is too far away (Max reach: ${maxReachDistance}m)`
    };
  }

  // Determine surface requirements
  let requiredSurface: PlacementSurface = 'FloorOnly';
  if ('placementSurface' in item && item.placementSurface) {
    requiredSurface = item.placementSurface;
  } else if ('category' in item && item.category === 'building') {
    requiredSurface = item.meshName.toLowerCase().includes('window') || item.meshName.toLowerCase().includes('door')
      ? 'WallMounted'
      : 'FloorOnly';
  }

  // Determine object dimensions
  let dims: [number, number, number] = [1.0, 1.0, 1.0];
  if ('dimensions' in item && item.dimensions) {
    dims = item.dimensions;
  }

  // 2. Surface Tag Alignment Validation
  const hitType = hitUserData.type || '';
  const isUpwardNormal = hitNormal.y > 0.6;
  const isDownwardNormal = hitNormal.y < -0.6;
  const isWallNormal = Math.abs(hitNormal.y) < 0.4;

  let isSurfaceValid = false;
  let surfaceReason = '';

  switch (requiredSurface) {
    case 'FloorOnly':
      isSurfaceValid = isUpwardNormal || hitType === 'floor';
      if (!isSurfaceValid) surfaceReason = 'Item must be placed on a floor surface';
      break;

    case 'WallMounted':
      isSurfaceValid = isWallNormal || hitType === 'wall';
      if (!isSurfaceValid) surfaceReason = 'Item must be mounted on a wall';
      break;

    case 'CeilingMounted':
      isSurfaceValid = isDownwardNormal;
      if (!isSurfaceValid) surfaceReason = 'Item must be mounted on a ceiling';
      break;

    case 'Tabletop':
      isSurfaceValid = isUpwardNormal && (hitType === 'furniture' || hitType === 'floor' || hitUserData.surface === 'tabletop');
      if (!isSurfaceValid) surfaceReason = 'Item must be placed on a flat tabletop or floor surface';
      break;

    case 'SurfaceFlat':
    default:
      isSurfaceValid = isUpwardNormal || hitType === 'floor';
      if (!isSurfaceValid) surfaceReason = 'Item must be placed on a flat surface';
      break;
  }

  if (!isSurfaceValid) {
    return {
      ...defaultRes,
      valid: false,
      reason: surfaceReason
    };
  }

  // Calculate aligned pivot offset based on surface normal & dimensions
  // For floor objects, bottom sits on surface (y + dims[1]/2)
  const pos: [number, number, number] = [hitPoint.x, hitPoint.y, hitPoint.z];

  if (requiredSurface === 'FloorOnly' || requiredSurface === 'Tabletop' || requiredSurface === 'SurfaceFlat') {
    if (isUpwardNormal) {
      pos[1] = hitPoint.y + dims[1] / 2;
    }
  } else if (requiredSurface === 'WallMounted') {
    // Offset slightly out from wall along normal
    pos[0] += hitNormal.x * (dims[2] / 2 + 0.02);
    pos[1] += hitNormal.y * (dims[2] / 2 + 0.02);
    pos[2] += hitNormal.z * (dims[2] / 2 + 0.02);
  }

  // 3. Property Floor Bounds Check
  if (property && property.floors && property.floors.length > 0) {
    const floor = property.floors[0];
    const { minX, maxX, minZ, maxZ } = floor.bounds;
    const margin = 0.2;
    if (pos[0] < minX + margin || pos[0] > maxX - margin || pos[2] < minZ + margin || pos[2] > maxZ - margin) {
      return {
        ...defaultRes,
        alignedPosition: pos,
        valid: false,
        reason: 'Item position is outside property boundary'
      };
    }
  }

  // 4. Lightweight AABB Box Collision Check against existing furniture & active walls
  tempVecCenter.set(pos[0], pos[1], pos[2]);
  tempVecSize.set(dims[0], dims[1], dims[2]);
  tempBoxProposed.setFromCenterAndSize(tempVecCenter, tempVecSize);

  // Shrink proposed box by 0.04m on all sides to avoid false-positive floor/wall touching
  tempBoxProposed.expandByScalar(-0.04);

  if (property) {
    // Check collision against existing furniture
    for (const furn of property.furniture) {
      const furnDims = [1.0, 1.0, 1.0];
      const fCenter = new THREE.Vector3(...furn.position);
      const fSize = new THREE.Vector3(...furnDims);
      tempBoxExisting.setFromCenterAndSize(fCenter, fSize);
      tempBoxExisting.expandByScalar(-0.04);

      if (tempBoxProposed.intersectsBox(tempBoxExisting)) {
        return {
          ...defaultRes,
          alignedPosition: pos,
          valid: false,
          reason: `Blocked by collision with nearby ${furn.name}`
        };
      }
    }

    // Check collision against active (undemolished) walls
    for (const wall of property.walls) {
      if (wall.isDemolished) continue;

      const start = new THREE.Vector3(...wall.startPoint);
      const end = new THREE.Vector3(...wall.endPoint);
      const wallMid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const dist = start.distanceTo(end);

      // Estimate wall bounding box
      const wallThickness = wall.thickness || 1.0;
      const wallHeight = wall.height || 1.0;
      const wSize = new THREE.Vector3(
        Math.max(wallThickness, Math.abs(end.x - start.x)),
        wallHeight,
        Math.max(wallThickness, Math.abs(end.z - start.z))
      );

      // Wall center Y offset
      const wallCenterY = (wall.startPoint[1] ?? 0) + wallHeight / 2;
      wallMid.y = wallCenterY;

      tempBoxExisting.setFromCenterAndSize(wallMid, wSize);
      tempBoxExisting.expandByScalar(-0.04);

      // If item is wall-mounted, skip self-wall collision check
      if (requiredSurface === 'WallMounted' && tempBoxProposed.intersectsBox(tempBoxExisting)) {
        continue;
      }

      if (tempBoxProposed.intersectsBox(tempBoxExisting)) {
        return {
          ...defaultRes,
          alignedPosition: pos,
          valid: false,
          reason: 'Blocked by collision with wall block'
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
