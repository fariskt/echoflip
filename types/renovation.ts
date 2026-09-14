export type RenovationTool =
  | 'inspect'
  | 'sponge'
  | 'paint_roller'
  | 'flooring'
  | 'hammer'
  | 'wall_builder'
  | 'room_builder'
  | 'furniture';

export type RoomBlockType =
  | 'floor'
  | 'wall'
  | 'ceiling'
  | 'empty_room'
  | 'full_room'
  | 'foundation';

export interface RoomBlock {
  id: string;
  name?: string;
  type: RoomBlockType;
  start: [number, number, number];
  end: [number, number, number];
  height: number;
  wallThickness: number;
  wallPresetId?: string;
  flooringMaterialId?: string;
  hasCeiling?: boolean;
  color?: string;
  createdAt?: number;
}

export interface WallBlockPreset {
  id: string;
  name: string;
  color: string;
  price: number;
  type: 'drywall' | 'brick' | 'stone' | 'glass' | 'doorway';
  isTransparent?: boolean;
}

export interface PaintColor {
  id: string;
  name: string;
  hex: string;
  roughness?: number;
  price: number;
}

export interface FlooringMaterial {
  id: string;
  name: string;
  color: string;
  type: 'wood' | 'tile' | 'carpet' | 'concrete';
  priceSqM: number;
}

export interface DirtStain {
  id: string;
  wallOrFloorId: string;
  position: [number, number, number];
  normal: [number, number, number];
  size: number;
  clearedRatio: number; // 0 (dirty) to 1 (clean)
  type: 'mud' | 'graffiti' | 'grease' | 'mold';
}

export interface WallSegment {
  id: string;
  roomId: string;
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  height: number;
  thickness: number;
  color: string;
  isDemolished?: boolean;
  hasWindow?: boolean;
  hasDoor?: boolean;
  blockType?: 'drywall' | 'brick' | 'stone' | 'glass' | 'doorway';
  rotation?: [number, number, number];
}

export interface FlooringTile {
  id: string;
  roomId: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    y: number;
  };
  materialId: string;
  color: string;
}

export interface FixtureObject {
  id: string;
  name: string;
  type: 'light' | 'sink' | 'outlet' | 'door' | 'window' | 'radiator';
  position: [number, number, number];
  rotation: [number, number, number];
  isBroken: boolean;
  isRepaired: boolean;
  repairCost: number;
}

export type PlacementSurface =
  | 'FloorOnly'
  | 'WallMounted'
  | 'CeilingMounted'
  | 'Tabletop'
  | 'SurfaceFlat';

export type FurnitureCategory =
  | 'building'
  | 'seating'
  | 'tables'
  | 'beds'
  | 'storage'
  | 'lighting'
  | 'appliances'
  | 'kitchen'
  | 'bathroom'
  | 'doors'
  | 'windows'
  | 'decor';

export interface AssetNormalizedMetadata {
  id: string;
  modelPath: string;
  category: FurnitureCategory;
  originalDimensions: { width: number; height: number; depth: number };
  targetDimensions: { width: number; height: number; depth: number };
  normalizedScale: number;
  normalizedDimensions: { width: number; height: number; depth: number };
  floorOffset: number;
  minY: number;
  isNormalized: boolean;
}

export interface FurnitureObject {
  id: string;
  catalogId: string;
  name: string;
  category: FurnitureCategory;
  meshName: string;
  modelPath?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  price: number;
  placementSurface?: PlacementSurface;
  rotationOffset?: [number, number, number];
  targetDimensions?: [number, number, number];
  floorOffset?: number;
  normalizedScale?: number;
}

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  meshName: string;
  modelPath?: string;
  price: number;
  dimensions: [number, number, number];
  placementSurface?: PlacementSurface;
  icon?: string;
  scaleOffset?: [number, number, number];
  rotationOffset?: [number, number, number];
  targetDimensions?: [number, number, number];
}

export interface ContractTask {
  id: string;
  description: string;
  type: 'scrub_stains' | 'paint_walls' | 'change_flooring' | 'place_furniture' | 'repair_fixtures';
  targetCount: number;
  currentCount: number;
  reward: number;
  isCompleted: boolean;
}

export interface RenovationContract {
  id: string;
  title: string;
  clientName: string;
  description: string;
  budget: number;
  payout: number;
  propertyId: string;
  tasks: ContractTask[];
  isCompleted: boolean;
}

export interface RenovationProperty {
  id: string;
  name: string;
  address: string;
  estimatedValue: number;
  buyPrice: number;
  isOwned: boolean;
  walls: WallSegment[];
  floors: FlooringTile[];
  dirtStains: DirtStain[];
  fixtures: FixtureObject[];
  furniture: FurnitureObject[];
  roomBlocks?: RoomBlock[];
  spawnPoint: [number, number, number];
}
