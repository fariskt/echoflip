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
  const p1 = block.start;
  const p2 = block.end;
  const startY = Math.min(p1[1], p2[1]);
  const height = Math.max(0.5, block.height);
  const thickness = Math.max(0.1, block.wallThickness);
  const blockId = block.id;
  const color = block.color || '#cbd5e1';
  const blockType = (block.wallPresetId as any) || 'drywall';

  const walls: WallSegment[] = [];
  const floors: FlooringTile[] = [];
  const ceilings: FlooringTile[] = [];

  const distance = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);

  if (distance >= 0.1) {
    // ONE SINGLE WALL SIDE CONNECTING START & END POINT (No 4-wall full rect box)
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
