import type { RoomBlock, WallSegment, FlooringTile, RenovationProperty } from '../../types/renovation';

export const PROPERTY_BOUNDS = {
  minX: -30,
  maxX: 30,
  minZ: -30,
  maxZ: 30
};

export interface GeneratedRoomElements {
  walls: WallSegment[];
  floors: FlooringTile[];
  ceilings: FlooringTile[];
}

/**
 * Calculates floor area in square meters using Shoelace formula for arbitrary polygon points
 */
export function calculatePolygonArea(points: [number, number, number][]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][2];
    area -= points[j][0] * points[i][2];
  }
  return Math.abs(area / 2);
}

/**
 * Calculates rectangular room dimensions and area
 */
export function calculateRoomMetrics(
  start: [number, number, number],
  end: [number, number, number]
): { width: number; length: number; area: number; perimeter: number } {
  const width = Math.abs(end[0] - start[0]);
  const length = Math.abs(end[2] - start[2]);
  const area = width * length;
  const perimeter = 2 * (width + length);
  return { width, length, area, perimeter };
}

/**
 * Calculates estimated construction cost for a room block
 */
export function calculateRoomBuildCost(
  start: [number, number, number],
  end: [number, number, number],
  height: number = 2.8,
  wallPrice: number = 40
): number {
  const { width, length, area } = calculateRoomMetrics(start, end);
  const wallSurfaceArea = 2 * (width + length) * height;
  const wallCost = wallSurfaceArea * (wallPrice / 10);
  const floorCost = area * 35;
  return Math.round(wallCost + floorCost);
}

export function generateRoomBlockElements(block: RoomBlock): GeneratedRoomElements {
  const p1 = block.start;
  const p2 = block.end;
  const startY = block.elevationY ?? Math.min(p1[1], p2[1]);
  const height = Math.max(0.5, block.height);
  const thickness = Math.max(0.1, block.wallThickness);
  const blockId = block.id;
  const color = block.color || '#cbd5e1';
  const blockType = (block.wallPresetId as any) || 'drywall';

  const walls: WallSegment[] = [];
  const floors: FlooringTile[] = [];
  const ceilings: FlooringTile[] = [];

  const minX = Math.min(p1[0], p2[0]);
  const maxX = Math.max(p1[0], p2[0]);
  const minZ = Math.min(p1[2], p2[2]);
  const maxZ = Math.max(p1[2], p2[2]);

  const width = maxX - minX;
  const length = maxZ - minZ;

  // Handle polygon room blocks (custom multi-vertex rooms)
  if (block.polygonPoints && block.polygonPoints.length >= 3) {
    const pts = block.polygonPoints;
    for (let i = 0; i < pts.length; i++) {
      const nextIdx = (i + 1) % pts.length;
      const sp = pts[i];
      const ep = pts[nextIdx];
      walls.push({
        id: `${blockId}_poly_wall_${i}`,
        roomId: blockId,
        startPoint: [sp[0], startY, sp[2]],
        endPoint: [ep[0], startY, ep[2]],
        height,
        thickness,
        color,
        blockType
      });
    }

    floors.push({
      id: `${blockId}_floor`,
      roomId: blockId,
      bounds: { minX, maxX, minZ, maxZ, y: startY },
      materialId: block.flooringMaterialId || 'floor_oak',
      color: '#b45309'
    });

    return { walls, floors, ceilings };
  }

  // Handle standard 4-wall room vs single wall side
  if (block.type === 'empty_room' || block.type === 'full_room') {
    if (width >= 0.2 && length >= 0.2) {
      // 4 perimeter walls
      // North Wall (minZ)
      walls.push({
        id: `${blockId}_wall_n`,
        roomId: blockId,
        startPoint: [minX, startY, minZ],
        endPoint: [maxX, startY, minZ],
        height,
        thickness,
        color,
        blockType
      });
      // South Wall (maxZ)
      walls.push({
        id: `${blockId}_wall_s`,
        roomId: blockId,
        startPoint: [maxX, startY, maxZ],
        endPoint: [minX, startY, maxZ],
        height,
        thickness,
        color,
        blockType
      });
      // East Wall (maxX)
      walls.push({
        id: `${blockId}_wall_e`,
        roomId: blockId,
        startPoint: [maxX, startY, minZ],
        endPoint: [maxX, startY, maxZ],
        height,
        thickness,
        color,
        blockType
      });
      // West Wall (minX)
      walls.push({
        id: `${blockId}_wall_w`,
        roomId: blockId,
        startPoint: [minX, startY, maxZ],
        endPoint: [minX, startY, minZ],
        height,
        thickness,
        color,
        blockType
      });

      // Floor slab
      floors.push({
        id: `${blockId}_floor`,
        roomId: blockId,
        bounds: { minX, maxX, minZ, maxZ, y: startY },
        materialId: block.flooringMaterialId || 'floor_oak',
        color: '#b45309'
      });

      // Ceiling slab if requested
      if (block.hasCeiling) {
        ceilings.push({
          id: `${blockId}_ceiling`,
          roomId: blockId,
          bounds: { minX, maxX, minZ, maxZ, y: startY + height },
          materialId: 'floor_concrete',
          color: '#f8fafc'
        });
      }
    }
  } else {
    // Single wall segment (e.g. type === 'wall' or line partition)
    const distance = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);
    if (distance >= 0.1) {
      walls.push({
        id: `${blockId}_wall_side`,
        roomId: blockId,
        startPoint: [p1[0], startY, p1[2]],
        endPoint: [p2[0], startY, p2[2]],
        height,
        thickness,
        color,
        blockType
      });
    }
  }

  return { walls, floors, ceilings };
}

export function validateRoomBlockPlacement(
  start: [number, number, number],
  end: [number, number, number],
  property?: RenovationProperty | null
): { valid: boolean; reason?: string; dimensions: { width: number; length: number } } {
  const distance = Math.hypot(end[0] - start[0], end[2] - start[2]);

  if (distance < 0.2) {
    return { valid: false, reason: 'Wall length too short (min 0.2m)', dimensions: { width: distance, length: distance } };
  }

  if (
    start[0] < PROPERTY_BOUNDS.minX || start[0] > PROPERTY_BOUNDS.maxX ||
    start[2] < PROPERTY_BOUNDS.minZ || start[2] > PROPERTY_BOUNDS.maxZ ||
    end[0] < PROPERTY_BOUNDS.minX || end[0] > PROPERTY_BOUNDS.maxX ||
    end[2] < PROPERTY_BOUNDS.minZ || end[2] > PROPERTY_BOUNDS.maxZ
  ) {
    return { valid: false, reason: 'Outside property plot boundary', dimensions: { width: distance, length: distance } };
  }

  return { valid: true, dimensions: { width: distance, length: distance } };
}
