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

export function generateRoomBlockElements(block: RoomBlock): GeneratedRoomElements {
  const minX = Math.min(block.start[0], block.end[0]);
  const maxX = Math.max(block.start[0], block.end[0]);
  const minZ = Math.min(block.start[2], block.end[2]);
  const maxZ = Math.max(block.start[2], block.end[2]);
  const startY = Math.min(block.start[1], block.end[1]);
  const height = Math.max(0.5, block.height);
  const thickness = Math.max(0.1, block.wallThickness);
  const blockId = block.id;
  const color = block.color || '#cbd5e1';
  const blockType = (block.wallPresetId as any) || 'drywall';

  const walls: WallSegment[] = [];
  const floors: FlooringTile[] = [];
  const ceilings: FlooringTile[] = [];

  const width = maxX - minX;
  const depth = maxZ - minZ;

  if (block.type === 'full_room' || block.type === 'empty_room') {
    // 4 Perimeter walls
    // North Wall: (minX -> maxX, minZ)
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

    // South Wall: (minX -> maxX, maxZ)
    walls.push({
      id: `${blockId}_wall_s`,
      roomId: blockId,
      startPoint: [minX, startY, maxZ],
      endPoint: [maxX, startY, maxZ],
      height,
      thickness,
      color,
      blockType
    });

    // West Wall: (minX, minZ -> maxZ)
    walls.push({
      id: `${blockId}_wall_w`,
      roomId: blockId,
      startPoint: [minX, startY, minZ],
      endPoint: [minX, startY, maxZ],
      height,
      thickness,
      color,
      blockType
    });

    // East Wall: (maxX, minZ -> maxZ)
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

    if (block.type === 'full_room') {
      floors.push({
        id: `${blockId}_floor`,
        roomId: blockId,
        bounds: { minX, maxX, minZ, maxZ, y: startY },
        materialId: block.flooringMaterialId || 'floor_oak',
        color: '#b45309'
      });

      if (block.hasCeiling) {
        ceilings.push({
          id: `${blockId}_ceiling`,
          roomId: blockId,
          bounds: { minX, maxX, minZ, maxZ, y: startY + height },
          materialId: 'floor_concrete',
          color: '#e2e8f0'
        });
      }
    }
  } else if (block.type === 'floor' || block.type === 'foundation') {
    floors.push({
      id: `${blockId}_floor`,
      roomId: blockId,
      bounds: { minX, maxX, minZ, maxZ, y: startY },
      materialId: block.flooringMaterialId || (block.type === 'foundation' ? 'floor_concrete' : 'floor_oak'),
      color: block.type === 'foundation' ? '#475569' : '#b45309'
    });
  } else if (block.type === 'ceiling') {
    ceilings.push({
      id: `${blockId}_ceiling`,
      roomId: blockId,
      bounds: { minX, maxX, minZ, maxZ, y: startY + height },
      materialId: 'floor_concrete',
      color: '#e2e8f0'
    });
  } else if (block.type === 'wall') {
    // Single solid block wall segment along length or depth
    if (width >= depth) {
      const midZ = (minZ + maxZ) / 2;
      walls.push({
        id: `${blockId}_wall_single`,
        roomId: blockId,
        startPoint: [minX, startY, midZ],
        endPoint: [maxX, startY, midZ],
        height,
        thickness: Math.max(thickness, depth),
        color,
        blockType
      });
    } else {
      const midX = (minX + maxX) / 2;
      walls.push({
        id: `${blockId}_wall_single`,
        roomId: blockId,
        startPoint: [midX, startY, minZ],
        endPoint: [midX, startY, maxZ],
        height,
        thickness: Math.max(thickness, width),
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
  const minX = Math.min(start[0], end[0]);
  const maxX = Math.max(start[0], end[0]);
  const minZ = Math.min(start[2], end[2]);
  const maxZ = Math.max(start[2], end[2]);

  const width = Math.abs(maxX - minX);
  const length = Math.abs(maxZ - minZ);

  if (width < 0.3 || length < 0.3) {
    return { valid: false, reason: 'Area too small (min 0.3m × 0.3m)', dimensions: { width, length } };
  }

  if (
    minX < PROPERTY_BOUNDS.minX ||
    maxX > PROPERTY_BOUNDS.maxX ||
    minZ < PROPERTY_BOUNDS.minZ ||
    maxZ > PROPERTY_BOUNDS.maxZ
  ) {
    return { valid: false, reason: 'Outside property plot boundary', dimensions: { width, length } };
  }

  return { valid: true, dimensions: { width, length } };
}
