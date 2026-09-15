import { create } from 'zustand';
import type {
  RenovationTool,
  PaintColor,
  FlooringMaterial,
  FurnitureCatalogItem,
  WallBlockPreset,
  RenovationProperty,
  RenovationContract,
  DirtStain,
  WallSegment,
  FlooringTile,
  FurnitureObject,
  FixtureObject,
  RoomBlock,
  RoomBlockType
} from '../types/renovation';
import { generateRoomBlockElements } from '../game/utils/roomBlockGenerator';

export const WALL_BLOCK_PRESETS: WallBlockPreset[] = [
  { id: 'wall_drywall', name: 'Standard Drywall Block', color: '#cbd5e1', price: 40, type: 'drywall' },
  { id: 'wall_brick', name: 'Red Brick Block', color: '#9a3412', price: 50, type: 'brick' },
  { id: 'wall_stone', name: 'Rustic Stone Block', color: '#475569', price: 60, type: 'stone' },
  { id: 'wall_glass', name: 'Glass Window Block', color: '#38bdf8', price: 75, type: 'glass', isTransparent: true },
  { id: 'wall_doorway', name: 'Arch Doorway Block', color: '#64748b', price: 80, type: 'doorway' },
];

export const PAINT_COLORS: PaintColor[] = [
  { id: 'paint_white', name: 'Clean White', hex: '#f8fafc', price: 20 },
  { id: 'paint_warm_beige', name: 'Warm Beige', hex: '#f5f5dc', price: 25 },
  { id: 'paint_sage', name: 'Sage Green', hex: '#87986a', price: 30 },
  { id: 'paint_navy', name: 'Navy Blue', hex: '#1e293b', price: 35 },
  { id: 'paint_terracotta', name: 'Terracotta', hex: '#c25943', price: 30 },
  { id: 'paint_charcoal', name: 'Modern Charcoal', hex: '#334155', price: 35 },
  { id: 'paint_pastel_pink', name: 'Pastel Rose', hex: '#f472b6', price: 25 },
  { id: 'paint_sunflower', name: 'Warm Yellow', hex: '#fbbf24', price: 25 },
];

export const FLOORING_MATERIALS: FlooringMaterial[] = [
  { id: 'floor_oak', name: 'Natural Oak Parquet', color: '#b45309', type: 'wood', priceSqM: 40 },
  { id: 'floor_walnut', name: 'Dark Walnut Planks', color: '#451a03', type: 'wood', priceSqM: 50 },
  { id: 'floor_marble', name: 'White Marble Tile', color: '#e2e8f0', type: 'tile', priceSqM: 65 },
  { id: 'floor_slate', name: 'Slate Gray Tile', color: '#334155', type: 'tile', priceSqM: 45 },
  { id: 'floor_carpet_grey', name: 'Cozy Gray Carpet', color: '#64748b', type: 'carpet', priceSqM: 30 },
  { id: 'floor_concrete', name: 'Polished Concrete', color: '#94a3b8', type: 'concrete', priceSqM: 25 },
];

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // Seating
  { id: 'cat_sofa_modern', name: 'Modern 3-Seater Sofa', category: 'seating', meshName: '3-seater_sofa', modelPath: '/assets/furniture/3-seater_sofa.glb', price: 450, dimensions: [2.2, 0.9, 0.9], placementSurface: 'FloorOnly' },
  { id: 'cat_armchair', name: 'Scandinavian Armchair', category: 'seating', meshName: 'armchair', modelPath: '/assets/furniture/armchair.glb', price: 180, dimensions: [0.9, 0.9, 0.8], placementSurface: 'FloorOnly' },
  { id: 'cat_dining_chair', name: 'Modern Dining Chair', category: 'seating', meshName: 'dining_chair', modelPath: '/assets/furniture/dining_chair.glb', price: 90, dimensions: [0.6, 0.9, 0.6], placementSurface: 'FloorOnly' },

  // Tables
  { id: 'cat_coffee_table', name: 'Wood Coffee Table', category: 'tables', meshName: 'coffee_table', modelPath: '/assets/furniture/coffee_table.glb', price: 120, dimensions: [1.2, 0.45, 0.6], placementSurface: 'FloorOnly' },
  { id: 'cat_dining_table', name: 'Oak Dining & Chair Set', category: 'tables', meshName: 'table_and_chair', modelPath: '/assets/furniture/table_and_chair.glb', price: 320, dimensions: [1.6, 0.8, 1.2], placementSurface: 'FloorOnly' },
  { id: 'cat_study_desk', name: 'Mini Writing Desk', category: 'tables', meshName: 'mini_table', modelPath: '/assets/furniture/mini_table.glb', price: 150, dimensions: [0.6, 0.5, 0.6], placementSurface: 'FloorOnly' },

  // Beds & Wardrobe
  { id: 'cat_king_bed', name: 'Minimalist King Bed', category: 'beds', meshName: 'bed', modelPath: '/assets/furniture/bed.glb', price: 650, dimensions: [2.0, 1.1, 2.1], placementSurface: 'FloorOnly' },
  { id: 'cat_bookshelf', name: 'Tall Double Wardrobe', category: 'storage', meshName: 'wardrobe', modelPath: '/assets/furniture/wardrobe.glb', price: 280, dimensions: [1.2, 2.0, 0.6], placementSurface: 'FloorOnly' },

  // Kitchen
  { id: 'cat_fridge', name: 'Stainless Steel Refrigerator', category: 'kitchen', meshName: 'fridge', modelPath: '/assets/fridge.glb', price: 550, dimensions: [0.9, 1.8, 0.8], placementSurface: 'FloorOnly' },
  { id: 'cat_kitchen_cabinet', name: 'Modular Kitchen Cabinet', category: 'kitchen', meshName: 'kitchen_cabinet', modelPath: '/assets/furniture/kitchen_cabinet.glb', price: 340, dimensions: [1.0, 0.9, 0.6], placementSurface: 'FloorOnly' },
  { id: 'cat_kitchen_sink', name: 'Kitchen Sink Unit', category: 'kitchen', meshName: 'kitchen_sink', modelPath: '/assets/furniture/kitchen_sink.glb', price: 290, dimensions: [1.2, 0.9, 0.6], placementSurface: 'FloorOnly' },

  // Bathroom
  { id: 'cat_bathroom_sink', name: 'Bathroom Vanity Sink', category: 'bathroom', meshName: 'bathroom_sink', modelPath: '/assets/bathroom_sink.glb', price: 220, dimensions: [0.8, 0.85, 0.5], placementSurface: 'FloorOnly' },
  { id: 'cat_modern_shower', name: 'Glass Walk-In Shower Unit', category: 'bathroom', meshName: 'modern_shower', modelPath: '/assets/modern_shower.glb', price: 780, dimensions: [1.1, 2.1, 1.1], placementSurface: 'FloorOnly' },
  { id: 'cat_toilet', name: 'Ceramic Toilet', category: 'bathroom', meshName: 'toilet', modelPath: '/assets/toilet.glb', price: 190, dimensions: [0.5, 0.8, 0.7], placementSurface: 'FloorOnly' },

  // Doors & Windows
  { id: 'cat_door_frame', name: 'Modern Wooden Door', category: 'doors', meshName: 'modern_door', modelPath: '/assets/furniture/modern_door.glb', price: 140, dimensions: [1.0, 2.2, 0.25], placementSurface: 'WallMounted' },
  { id: 'cat_window_frame', name: 'Modular Glass Window', category: 'windows', meshName: 'modular_window_05', modelPath: '/assets/furniture/modular_window_05.glb', price: 130, dimensions: [1.2, 1.4, 0.2], placementSurface: 'WallMounted' },
  { id: 'cat_window_standard', name: 'Standard Wall Window', category: 'windows', meshName: 'window', modelPath: '/assets/furniture/window.glb', price: 110, dimensions: [1.0, 1.2, 0.2], placementSurface: 'WallMounted' },
  { id: 'cat_ceiling_window', name: 'Skylight Roof Window', category: 'windows', meshName: 'ceiling_window_and_frame', modelPath: '/assets/ceiling_window_and_frame.glb', price: 210, dimensions: [1.5, 0.3, 1.5], placementSurface: 'CeilingMounted' },

  // Lighting
  { id: 'cat_ceiling_light', name: 'Modern Ceiling Pendant Light', category: 'lighting', meshName: 'ceiling_light', modelPath: '/assets/ceiling_light.glb', price: 110, dimensions: [0.4, 0.6, 0.4], placementSurface: 'CeilingMounted' },
  { id: 'cat_led_ceiling_light', name: 'LED Ceiling Panel Light', category: 'lighting', meshName: 'led_ceiling_light', modelPath: '/assets/led_ceiling_light.glb', price: 95, dimensions: [0.6, 0.1, 0.6], placementSurface: 'CeilingMounted' },
  { id: 'cat_floor_lamp', name: 'Arc Floor Lamp', category: 'lighting', meshName: 'ceiling_light', modelPath: '/assets/ceiling_light.glb', price: 95, dimensions: [0.4, 1.7, 0.4], placementSurface: 'FloorOnly' },

  // Building Structures & Stairs
  { id: 'cat_support_pillar', name: 'Steep Wooden Staircase', category: 'building', meshName: 'steep_staircase', modelPath: '/assets/furniture/steep_staircase.glb', price: 320, dimensions: [1.2, 2.8, 2.5], placementSurface: 'FloorOnly' },
  { id: 'cat_floating_floor', name: 'Floating Wood Floor Slab', category: 'building', meshName: 'floating_floor', modelPath: '/assets/floating_floor.glb', price: 85, dimensions: [2.0, 0.15, 2.0], placementSurface: 'FloorOnly' },
  { id: 'cat_floor_white_tile', name: 'White Tile Floor Slab (2x2m)', category: 'building', meshName: 'floor_white_tile_2x2_meters', modelPath: '/assets/floor_white_tile_2x2_meters.glb', price: 75, dimensions: [2.0, 0.05, 2.0], placementSurface: 'FloorOnly' },
  { id: 'cat_brick_wall', name: 'Red Brick Wall Block', category: 'building', meshName: 'brick_wall', modelPath: '/assets/brick_wall.glb', price: 50, dimensions: [1.0, 1.0, 1.0], placementSurface: 'FloorOnly' },
  { id: 'cat_modular_wall_09', name: 'Modular Wall Block', category: 'building', meshName: 'modular_wall_09', modelPath: '/assets/modular_wall_09.glb', price: 45, dimensions: [1.0, 1.0, 1.0], placementSurface: 'FloorOnly' },
  { id: 'cat_worn_concrete_wall', name: 'Concrete Wall Block', category: 'building', meshName: 'worn_concrete_wall', modelPath: '/assets/worn_concrete_wall.glb', price: 40, dimensions: [1.0, 1.0, 1.0], placementSurface: 'FloorOnly' },

  // Decor
  { id: 'cat_potted_plant', name: 'Ficus Potted Plant', category: 'decor', meshName: 'Plant', price: 45, dimensions: [0.5, 1.2, 0.5], placementSurface: 'Tabletop' },
];

export interface RenovationState {
  appMode: 'renovation' | 'editor';
  money: number;
  portfolio: string[];
  equippedTool: RenovationTool;

  selectedPaintColor: PaintColor;
  selectedFlooring: FlooringMaterial;
  selectedFurniture: FurnitureCatalogItem | null;
  selectedWallBlock: WallBlockPreset;
  selectedPlacedFurnitureId: string | null;
  selectedPlacedWallId: string | null;
  selectedPlacedBlockId: string | null;
  placementRotation: [number, number, number];

  // Room / Block Creation State
  activeRoomBlockType: RoomBlockType;
  roomBlockHeight: number;
  roomBlockWallThickness: number;
  includeCeiling: boolean;
  roomBlockStartPoint: [number, number, number] | null;
  setRoomBlockStartPoint: (pt: [number, number, number] | null) => void;

  // House Builder & Multi-Floor State
  activeFloorLevel: import('../types/renovation').FloorLevel;
  setActiveFloorLevel: (level: import('../types/renovation').FloorLevel) => void;
  roomShapeMode: import('../types/renovation').RoomShapeMode;
  setRoomShapeMode: (mode: import('../types/renovation').RoomShapeMode) => void;
  selectedRoomTag: import('../types/renovation').RoomTag;
  setSelectedRoomTag: (tag: import('../types/renovation').RoomTag) => void;
  selectedRoofType: import('../types/renovation').RoofType;
  setSelectedRoofType: (roof: import('../types/renovation').RoofType) => void;
  polygonPathPoints: [number, number, number][];
  addPolygonPoint: (pt: [number, number, number]) => void;
  clearPolygonPath: () => void;
  getFloorElevationY: (level?: import('../types/renovation').FloorLevel) => number;

  // Undo / Redo Stacks
  undoStack: RenovationProperty[];
  redoStack: RenovationProperty[];

  // Mobile Touch Movement State
  mobileMoveState: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    turnLeft: boolean;
    turnRight: boolean;
    sprint: boolean;
    analogX: number;
    analogY: number;
  };
  setMobileMove: (dir: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down' | 'turnLeft' | 'turnRight' | 'sprint', active: boolean) => void;
  setMobileAnalog: (x: number, y: number) => void;
  mobileLookDelta: { x: number; y: number };
  addMobileLookDelta: (dx: number, dy: number) => void;
  consumeMobileLookDelta: () => { x: number; y: number };
  actionSignal: number;
  triggerMobileAction: () => void;

  activeProperty: RenovationProperty | null;
  activeContract: RenovationContract | null;

  isCatalogOpen: boolean;
  isPaintMenuOpen: boolean;
  isContractMenuOpen: boolean;
  isPaused: boolean;

  toastMessage: string | null;

  setAppMode: (mode: 'renovation' | 'editor') => void;
  setEquippedTool: (tool: RenovationTool) => void;
  setSelectedPaintColor: (paint: PaintColor) => void;
  setSelectedFlooring: (flooring: FlooringMaterial) => void;
  setSelectedFurniture: (item: FurnitureCatalogItem | null) => void;
  setSelectedWallBlock: (preset: WallBlockPreset) => void;
  setSelectedPlacedFurnitureId: (id: string | null) => void;
  setSelectedPlacedWallId: (id: string | null) => void;
  setSelectedPlacedBlockId: (id: string | null) => void;

  setActiveRoomBlockType: (type: RoomBlockType) => void;
  setRoomBlockHeight: (height: number) => void;
  setRoomBlockWallThickness: (thickness: number) => void;
  setIncludeCeiling: (include: boolean) => void;

  createRoomBlock: (block: Omit<RoomBlock, 'id'>) => string;
  deleteRoomBlock: (blockId: string) => void;
  duplicateRoomBlock: (blockId: string) => void;
  updateRoomBlock: (blockId: string, updates: Partial<RoomBlock>) => void;

  pushUndoState: () => void;
  undo: () => void;
  redo: () => void;

  setPlacementRotation: (rot: [number, number, number]) => void;
  rotatePlacementYaw: (deltaDeg?: number) => void;
  tiltPlacementPitch: (deltaDeg?: number) => void;
  rollPlacementRoll: (deltaDeg?: number) => void;
  resetPlacementRotation: () => void;
  setCatalogOpen: (open: boolean) => void;
  setPaintMenuOpen: (open: boolean) => void;
  setContractMenuOpen: (open: boolean) => void;
  setPaused: (paused: boolean) => void;

  loadProperty: (property: RenovationProperty) => void;
  loadContract: (contract: RenovationContract) => void;

  scrubDirtStain: (stainId: string, amount?: number) => void;
  paintWallSegment: (wallId: string) => void;
  changeFlooring: (floorId: string) => void;
  repairFixture: (fixtureId: string) => void;
  placeFurniture: (item: FurnitureCatalogItem, position: [number, number, number], rotation: [number, number, number]) => boolean;
  demolishWall: (wallId: string) => void;
  buildWall: (position: [number, number, number]) => void;

  gridSnapEnabled: boolean;
  gridSnapSize: number;
  toggleGridSnap: () => void;
  setGridSnapSize: (size: number) => void;
  snapToGrid: (pos: [number, number, number]) => [number, number, number];

  showToast: (msg: string) => void;
  completeContract: () => void;

  transformGizmoMode: 'translate' | 'rotate';
  setTransformGizmoMode: (mode: 'translate' | 'rotate') => void;
  moveSelectedObject: (dx?: number, dy?: number, dz?: number) => void;
  updateSelectedObjectPosition: (pos: [number, number, number]) => void;
  updateSelectedObjectRotation: (rot: [number, number, number]) => void;
  duplicateSelectedObject: () => void;
  deleteSelectedObject: () => void;
}

export const useRenovationStore = create<RenovationState>((set, get) => ({
  appMode: 'renovation',
  money: 5000,
  portfolio: ['starter_house'],
  equippedTool: 'inspect',

  selectedPaintColor: PAINT_COLORS[0],
  selectedFlooring: FLOORING_MATERIALS[0],
  selectedFurniture: FURNITURE_CATALOG[0],
  selectedWallBlock: WALL_BLOCK_PRESETS[0],
  placementRotation: [0, 0, 0],

  activeProperty: null,
  activeContract: null,

  isCatalogOpen: false,
  isPaintMenuOpen: false,
  isContractMenuOpen: false,
  isPaused: false,

  toastMessage: null,

  setAppMode: (mode) => set({ appMode: mode }),
  setEquippedTool: (tool) => set({ equippedTool: tool, roomBlockStartPoint: null }),
  setSelectedPaintColor: (paint) => set({ selectedPaintColor: paint }),
  setSelectedFlooring: (flooring) => set({ selectedFlooring: flooring }),
  setSelectedFurniture: (item) => set({ selectedFurniture: item }),
  setSelectedWallBlock: (preset) => set({ selectedWallBlock: preset }),
  selectedPlacedFurnitureId: null,
  setSelectedPlacedFurnitureId: (id) => set({ selectedPlacedFurnitureId: id, selectedPlacedWallId: null, selectedPlacedBlockId: null }),
  selectedPlacedWallId: null,
  setSelectedPlacedWallId: (id) => set({ selectedPlacedWallId: id, selectedPlacedFurnitureId: null, selectedPlacedBlockId: null }),
  selectedPlacedBlockId: null,
  setSelectedPlacedBlockId: (id) => set({ selectedPlacedBlockId: id, selectedPlacedFurnitureId: null, selectedPlacedWallId: null }),

  transformGizmoMode: 'translate',
  setTransformGizmoMode: (mode) => set({ transformGizmoMode: mode }),

  activeRoomBlockType: 'wall',
  roomBlockHeight: 2.8,
  roomBlockWallThickness: 0.2,
  includeCeiling: true,
  roomBlockStartPoint: null,
  setRoomBlockStartPoint: (pt) => set({ roomBlockStartPoint: pt }),

  activeFloorLevel: 'ground',
  setActiveFloorLevel: (level) => set({ activeFloorLevel: level }),
  roomShapeMode: 'single_wall',
  setRoomShapeMode: (mode) => set({ roomShapeMode: mode, polygonPathPoints: [], roomBlockStartPoint: null }),
  selectedRoomTag: 'Living Room',
  setSelectedRoomTag: (tag) => set({ selectedRoomTag: tag }),
  selectedRoofType: 'none',
  setSelectedRoofType: (roof) => set({ selectedRoofType: roof }),
  polygonPathPoints: [],
  addPolygonPoint: (pt) => set((state) => ({ polygonPathPoints: [...state.polygonPathPoints, pt] })),
  clearPolygonPath: () => set({ polygonPathPoints: [] }),
  getFloorElevationY: (targetLevel) => {
    const level = targetLevel || get().activeFloorLevel;
    switch (level) {
      case 'basement': return -3.0;
      case 'ground': return 0.0;
      case 'first': return 2.8;
      case 'second': return 5.6;
      case 'roof': return 8.4;
      default: return 0.0;
    }
  },

  undoStack: [],
  redoStack: [],

  mobileMoveState: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    turnLeft: false,
    turnRight: false,
    sprint: false,
    analogX: 0,
    analogY: 0
  },
  actionSignal: 0,
  setMobileMove: (dir, active) => set((state) => ({
    mobileMoveState: { ...state.mobileMoveState, [dir]: active }
  })),
  setMobileAnalog: (x, y) => set((state) => ({
    mobileMoveState: { ...state.mobileMoveState, analogX: x, analogY: y }
  })),
  mobileLookDelta: { x: 0, y: 0 },
  addMobileLookDelta: (dx, dy) => set((state) => ({
    mobileLookDelta: { x: state.mobileLookDelta.x + dx, y: state.mobileLookDelta.y + dy }
  })),
  consumeMobileLookDelta: () => {
    const current = get().mobileLookDelta;
    if (current.x !== 0 || current.y !== 0) {
      set({ mobileLookDelta: { x: 0, y: 0 } });
    }
    return current;
  },
  triggerMobileAction: () => set((state) => ({
    actionSignal: state.actionSignal + 1
  })),

  setActiveRoomBlockType: (type) => set({ activeRoomBlockType: type }),
  setRoomBlockHeight: (height) => set({ roomBlockHeight: Math.max(0.5, Math.min(10, height)) }),
  setRoomBlockWallThickness: (thickness) => set({ roomBlockWallThickness: Math.max(0.05, Math.min(1, thickness)) }),
  setIncludeCeiling: (include) => set({ includeCeiling: include }),

  pushUndoState: () => {
    const { activeProperty, undoStack } = get();
    if (!activeProperty) return;
    const snapshot: RenovationProperty = JSON.parse(JSON.stringify(activeProperty));
    set({
      undoStack: [...undoStack.slice(-20), snapshot],
      redoStack: []
    });
  },

  undo: () => {
    const { activeProperty, undoStack, redoStack, showToast } = get();
    if (undoStack.length === 0 || !activeProperty) {
      showToast('Nothing to undo');
      return;
    }
    const previous = undoStack[undoStack.length - 1];
    const currentSnapshot: RenovationProperty = JSON.parse(JSON.stringify(activeProperty));
    set({
      activeProperty: previous,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, currentSnapshot]
    });
    showToast('Undo performed ↺');
  },

  redo: () => {
    const { activeProperty, undoStack, redoStack, showToast } = get();
    if (redoStack.length === 0 || !activeProperty) {
      showToast('Nothing to redo');
      return;
    }
    const next = redoStack[redoStack.length - 1];
    const currentSnapshot: RenovationProperty = JSON.parse(JSON.stringify(activeProperty));
    set({
      activeProperty: next,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, currentSnapshot]
    });
    showToast('Redo performed ↻');
  },

  createRoomBlock: (blockData) => {
    const { activeProperty, pushUndoState, showToast, activeFloorLevel, getFloorElevationY, selectedRoomTag, selectedRoofType } = get();
    if (!activeProperty) return '';

    pushUndoState();

    const id = 'block_' + Math.random().toString(36).substring(2, 9);
    const startElevation = blockData.elevationY ?? (blockData.start ? blockData.start[1] : getFloorElevationY());
    const initialRoofType = blockData.type === 'wall' ? 'none' : (blockData.roofType || (blockData.type === 'roof' ? (selectedRoofType === 'none' ? 'flat' : selectedRoofType) : selectedRoofType));
    const newBlock: RoomBlock = {
      floorLevel: activeFloorLevel,
      elevationY: startElevation,
      roomTag: selectedRoomTag,
      roofType: initialRoofType,
      ...blockData,
      id,
      createdAt: Date.now()
    };

    const generated = generateRoomBlockElements(newBlock);

    const updatedBlocks = [...(activeProperty.roomBlocks || []), newBlock];
    const updatedWalls = [...activeProperty.walls, ...generated.walls];
    const updatedFloors = [...activeProperty.floors, ...generated.floors];

    set({
      activeProperty: {
        ...activeProperty,
        roomBlocks: updatedBlocks,
        walls: updatedWalls,
        floors: updatedFloors
      }
    });

    showToast(`Created ${newBlock.type.replace('_', ' ').toUpperCase()} Block!`);
    return id;
  },

  deleteRoomBlock: (blockId) => {
    const { activeProperty, pushUndoState, showToast } = get();
    if (!activeProperty) return;

    pushUndoState();

    const updatedBlocks = (activeProperty.roomBlocks || []).filter(b => b.id !== blockId);
    const updatedWalls = activeProperty.walls.filter(w => w.roomId !== blockId);
    const updatedFloors = activeProperty.floors.filter(f => f.roomId !== blockId);

    set({
      selectedPlacedBlockId: null,
      activeProperty: {
        ...activeProperty,
        roomBlocks: updatedBlocks,
        walls: updatedWalls,
        floors: updatedFloors
      }
    });

    showToast('Deleted Room/Block!');
  },

  duplicateRoomBlock: (blockId) => {
    const { activeProperty, createRoomBlock, showToast } = get();
    if (!activeProperty) return;

    const source = (activeProperty.roomBlocks || []).find(b => b.id === blockId);
    if (!source) return;

    const offset = 2.0;
    const duplicated: Omit<RoomBlock, 'id'> = {
      ...source,
      start: [source.start[0] + offset, source.start[1], source.start[2] + offset],
      end: [source.end[0] + offset, source.end[1], source.end[2] + offset]
    };

    createRoomBlock(duplicated);
    showToast('Duplicated Block!');
  },

  updateRoomBlock: (blockId, updates) => {
    const { activeProperty, pushUndoState } = get();
    if (!activeProperty) return;

    pushUndoState();

    const existingBlocks = activeProperty.roomBlocks || [];
    const targetBlockIndex = existingBlocks.findIndex(b => b.id === blockId);
    if (targetBlockIndex === -1) return;

    const updatedBlock: RoomBlock = { ...existingBlocks[targetBlockIndex], ...updates };
    const updatedBlocks = [...existingBlocks];
    updatedBlocks[targetBlockIndex] = updatedBlock;

    const otherWalls = activeProperty.walls.filter(w => w.roomId !== blockId);
    const otherFloors = activeProperty.floors.filter(f => f.roomId !== blockId);

    const generated = generateRoomBlockElements(updatedBlock);

    set({
      activeProperty: {
        ...activeProperty,
        roomBlocks: updatedBlocks,
        walls: [...otherWalls, ...generated.walls],
        floors: [...otherFloors, ...generated.floors]
      }
    });
  },

  setPlacementRotation: (rot) => set({ placementRotation: rot }),
  rotatePlacementYaw: (deltaDeg = 15) => {
    const [x, y, z] = get().placementRotation;
    const newYaw = (y + deltaDeg) % 360;
    set({ placementRotation: [x, newYaw, z] });

    const { selectedPlacedFurnitureId, selectedPlacedWallId, activeProperty, showToast } = get();
    if (!activeProperty) return;

    if (selectedPlacedFurnitureId) {
      const updatedFurniture = activeProperty.furniture.map((item) => {
        if (item.id === selectedPlacedFurnitureId) {
          const updatedRot: [number, number, number] = [item.rotation[0], (item.rotation[1] + deltaDeg) % 360, item.rotation[2]];
          return { ...item, rotation: updatedRot };
        }
        return item;
      });
      const targetObj = activeProperty.furniture.find((f) => f.id === selectedPlacedFurnitureId);
      set({ activeProperty: { ...activeProperty, furniture: updatedFurniture } });
      if (targetObj) showToast(`Rotated ${targetObj.name} (Yaw +${deltaDeg}°)`);
    } else if (selectedPlacedWallId) {
      const updatedWalls = activeProperty.walls.map((wall) => {
        if (wall.id === selectedPlacedWallId) {
          const curRot = wall.rotation || [0, 0, 0];
          const updatedRot: [number, number, number] = [curRot[0], (curRot[1] + deltaDeg) % 360, curRot[2]];
          return { ...wall, rotation: updatedRot };
        }
        return wall;
      });
      set({ activeProperty: { ...activeProperty, walls: updatedWalls } });
      showToast(`Rotated Wall Block (Yaw +${deltaDeg}°)`);
    }
  },

  tiltPlacementPitch: (deltaDeg = 15) => {
    const [x, y, z] = get().placementRotation;
    const newPitch = (x + deltaDeg) % 360;
    set({ placementRotation: [newPitch, y, z] });

    const { selectedPlacedFurnitureId, selectedPlacedWallId, activeProperty, showToast } = get();
    if (!activeProperty) return;

    if (selectedPlacedFurnitureId) {
      const updatedFurniture = activeProperty.furniture.map((item) => {
        if (item.id === selectedPlacedFurnitureId) {
          const updatedRot: [number, number, number] = [(item.rotation[0] + deltaDeg) % 360, item.rotation[1], item.rotation[2]];
          return { ...item, rotation: updatedRot };
        }
        return item;
      });
      const targetObj = activeProperty.furniture.find((f) => f.id === selectedPlacedFurnitureId);
      set({ activeProperty: { ...activeProperty, furniture: updatedFurniture } });
      if (targetObj) showToast(`Tilted ${targetObj.name} (Pitch +${deltaDeg}°)`);
    } else if (selectedPlacedWallId) {
      const updatedWalls = activeProperty.walls.map((wall) => {
        if (wall.id === selectedPlacedWallId) {
          const curRot = wall.rotation || [0, 0, 0];
          const updatedRot: [number, number, number] = [(curRot[0] + deltaDeg) % 360, curRot[1], curRot[2]];
          return { ...wall, rotation: updatedRot };
        }
        return wall;
      });
      set({ activeProperty: { ...activeProperty, walls: updatedWalls } });
      showToast(`Tilted Wall Block (Pitch +${deltaDeg}°)`);
    }
  },

  rollPlacementRoll: (deltaDeg = 15) => {
    const [x, y, z] = get().placementRotation;
    const newRoll = (z + deltaDeg) % 360;
    set({ placementRotation: [x, y, newRoll] });

    const { selectedPlacedFurnitureId, selectedPlacedWallId, activeProperty, showToast } = get();
    if (!activeProperty) return;

    if (selectedPlacedFurnitureId) {
      const updatedFurniture = activeProperty.furniture.map((item) => {
        if (item.id === selectedPlacedFurnitureId) {
          const updatedRot: [number, number, number] = [item.rotation[0], item.rotation[1], (item.rotation[2] + deltaDeg) % 360];
          return { ...item, rotation: updatedRot };
        }
        return item;
      });
      const targetObj = activeProperty.furniture.find((f) => f.id === selectedPlacedFurnitureId);
      set({ activeProperty: { ...activeProperty, furniture: updatedFurniture } });
      if (targetObj) showToast(`Rolled ${targetObj.name} (Roll +${deltaDeg}°)`);
    } else if (selectedPlacedWallId) {
      const updatedWalls = activeProperty.walls.map((wall) => {
        if (wall.id === selectedPlacedWallId) {
          const curRot = wall.rotation || [0, 0, 0];
          const updatedRot: [number, number, number] = [curRot[0], curRot[1], (curRot[2] + deltaDeg) % 360];
          return { ...wall, rotation: updatedRot };
        }
        return wall;
      });
      set({ activeProperty: { ...activeProperty, walls: updatedWalls } });
      showToast(`Rolled Wall Block (Roll +${deltaDeg}°)`);
    }
  },

  resetPlacementRotation: () => {
    set({ placementRotation: [0, 0, 0] });
    const { selectedPlacedFurnitureId, selectedPlacedWallId, activeProperty, showToast } = get();
    if (!activeProperty) return;

    if (selectedPlacedFurnitureId) {
      const updatedFurniture = activeProperty.furniture.map((item) => {
        if (item.id === selectedPlacedFurnitureId) {
          return { ...item, rotation: [0, 0, 0] as [number, number, number] };
        }
        return item;
      });
      const targetObj = activeProperty.furniture.find((f) => f.id === selectedPlacedFurnitureId);
      set({ activeProperty: { ...activeProperty, furniture: updatedFurniture } });
      if (targetObj) showToast(`Reset ${targetObj.name} Rotation to [0°, 0°, 0°]`);
    } else if (selectedPlacedWallId) {
      const updatedWalls = activeProperty.walls.map((wall) => {
        if (wall.id === selectedPlacedWallId) {
          return { ...wall, rotation: [0, 0, 0] as [number, number, number] };
        }
        return wall;
      });
      set({ activeProperty: { ...activeProperty, walls: updatedWalls } });
      showToast(`Reset Wall Rotation to [0°, 0°, 0°]`);
    }
  },

  moveSelectedObject: (dx = 0, dy = 0, dz = 0) => {
    const { selectedPlacedFurnitureId, selectedPlacedWallId, activeProperty, showToast, pushUndoState } = get();
    if (!activeProperty) return;

    if (selectedPlacedFurnitureId) {
      pushUndoState();
      const updatedFurniture = activeProperty.furniture.map((item) => {
        if (item.id === selectedPlacedFurnitureId) {
          const newPos: [number, number, number] = [
            item.position[0] + dx,
            item.position[1] + dy,
            item.position[2] + dz
          ];
          return { ...item, position: newPos };
        }
        return item;
      });
      const targetObj = activeProperty.furniture.find((f) => f.id === selectedPlacedFurnitureId);
      set({ activeProperty: { ...activeProperty, furniture: updatedFurniture } });
      if (targetObj) showToast(`Moved ${targetObj.name}`);
    } else if (selectedPlacedWallId) {
      pushUndoState();
      const updatedWalls = activeProperty.walls.map((wall) => {
        if (wall.id === selectedPlacedWallId) {
          return {
            ...wall,
            startPoint: [wall.startPoint[0] + dx, wall.startPoint[1] + dy, wall.startPoint[2] + dz] as [number, number, number],
            endPoint: [wall.endPoint[0] + dx, wall.endPoint[1] + dy, wall.endPoint[2] + dz] as [number, number, number]
          };
        }
        return wall;
      });
      set({ activeProperty: { ...activeProperty, walls: updatedWalls } });
      showToast(`Moved Wall Block`);
    }
  },

  updateSelectedObjectPosition: (pos) => {
    const { selectedPlacedFurnitureId, selectedPlacedWallId, activeProperty } = get();
    if (!activeProperty) return;

    if (selectedPlacedFurnitureId) {
      const updatedFurniture = activeProperty.furniture.map((item) => {
        if (item.id === selectedPlacedFurnitureId) {
          return { ...item, position: pos };
        }
        return item;
      });
      set({ activeProperty: { ...activeProperty, furniture: updatedFurniture } });
    } else if (selectedPlacedWallId) {
      const wall = activeProperty.walls.find((w) => w.id === selectedPlacedWallId);
      if (!wall) return;
      const midX = (wall.startPoint[0] + wall.endPoint[0]) / 2;
      const midY = (wall.startPoint[1] + wall.endPoint[1]) / 2;
      const midZ = (wall.startPoint[2] + wall.endPoint[2]) / 2;
      const dx = pos[0] - midX;
      const dy = pos[1] - midY;
      const dz = pos[2] - midZ;

      const updatedWalls = activeProperty.walls.map((w) => {
        if (w.id === selectedPlacedWallId) {
          return {
            ...w,
            startPoint: [w.startPoint[0] + dx, w.startPoint[1] + dy, w.startPoint[2] + dz] as [number, number, number],
            endPoint: [w.endPoint[0] + dx, w.endPoint[1] + dy, w.endPoint[2] + dz] as [number, number, number]
          };
        }
        return w;
      });
      set({ activeProperty: { ...activeProperty, walls: updatedWalls } });
    }
  },

  updateSelectedObjectRotation: (rot) => {
    const { selectedPlacedFurnitureId, selectedPlacedWallId, activeProperty } = get();
    if (!activeProperty) return;

    if (selectedPlacedFurnitureId) {
      const updatedFurniture = activeProperty.furniture.map((item) => {
        if (item.id === selectedPlacedFurnitureId) {
          return { ...item, rotation: rot };
        }
        return item;
      });
      set({ activeProperty: { ...activeProperty, furniture: updatedFurniture } });
    } else if (selectedPlacedWallId) {
      const updatedWalls = activeProperty.walls.map((wall) => {
        if (wall.id === selectedPlacedWallId) {
          return { ...wall, rotation: rot };
        }
        return wall;
      });
      set({ activeProperty: { ...activeProperty, walls: updatedWalls } });
    }
  },

  duplicateSelectedObject: () => {
    const { selectedPlacedFurnitureId, selectedPlacedWallId, activeProperty, showToast, pushUndoState } = get();
    if (!activeProperty) return;

    if (selectedPlacedFurnitureId) {
      const item = activeProperty.furniture.find((f) => f.id === selectedPlacedFurnitureId);
      if (!item) return;
      pushUndoState();
      const newId = `furn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newItem = {
        ...item,
        id: newId,
        position: [item.position[0] + 0.5, item.position[1], item.position[2] + 0.5] as [number, number, number]
      };
      set({
        activeProperty: {
          ...activeProperty,
          furniture: [...activeProperty.furniture, newItem]
        },
        selectedPlacedFurnitureId: newId
      });
      showToast(`Duplicated ${item.name}!`);
    } else if (selectedPlacedWallId) {
      const wall = activeProperty.walls.find((w) => w.id === selectedPlacedWallId);
      if (!wall) return;
      pushUndoState();
      const newId = `wall_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newWall = {
        ...wall,
        id: newId,
        startPoint: [wall.startPoint[0] + 0.5, wall.startPoint[1], wall.startPoint[2] + 0.5] as [number, number, number],
        endPoint: [wall.endPoint[0] + 0.5, wall.endPoint[1], wall.endPoint[2] + 0.5] as [number, number, number]
      };
      set({
        activeProperty: {
          ...activeProperty,
          walls: [...activeProperty.walls, newWall]
        },
        selectedPlacedWallId: newId
      });
      showToast(`Duplicated Wall Block!`);
    }
  },

  deleteSelectedObject: () => {
    const { selectedPlacedFurnitureId, selectedPlacedWallId, selectedPlacedBlockId, activeProperty, showToast, pushUndoState } = get();
    if (!activeProperty) return;

    if (selectedPlacedFurnitureId) {
      const item = activeProperty.furniture.find((f) => f.id === selectedPlacedFurnitureId);
      pushUndoState();
      set({
        activeProperty: {
          ...activeProperty,
          furniture: activeProperty.furniture.filter((f) => f.id !== selectedPlacedFurnitureId)
        },
        selectedPlacedFurnitureId: null
      });
      if (item) showToast(`Deleted ${item.name}`);
    } else if (selectedPlacedWallId) {
      pushUndoState();
      set({
        activeProperty: {
          ...activeProperty,
          walls: activeProperty.walls.filter((w) => w.id !== selectedPlacedWallId)
        },
        selectedPlacedWallId: null
      });
      showToast(`Demolished Wall Block`);
    } else if (selectedPlacedBlockId) {
      get().deleteRoomBlock(selectedPlacedBlockId);
    }
  },
  setCatalogOpen: (open) => set({ isCatalogOpen: open }),
  setPaintMenuOpen: (open) => set({ isPaintMenuOpen: open }),
  setContractMenuOpen: (open) => set({ isContractMenuOpen: open }),
  setPaused: (paused) => set({ isPaused: paused }),

  loadProperty: (property) => set({ activeProperty: property }),
  loadContract: (contract) => set({ activeContract: contract }),

  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) set({ toastMessage: null });
    }, 3000);
  },

  scrubDirtStain: (stainId, amount = 0.35) => {
    const { activeProperty, activeContract, showToast } = get();
    if (!activeProperty) return;

    const target = activeProperty.dirtStains.find(s => s.id === stainId);
    if (!target) return;

    const newRatio = Math.min(1.0, target.clearedRatio + amount);
    const updatedStains = activeProperty.dirtStains.map(s =>
      s.id === stainId ? { ...s, clearedRatio: newRatio } : s
    );

    let updatedContract = activeContract;
    if (newRatio >= 1.0 && activeContract) {
      const updatedTasks = activeContract.tasks.map(task => {
        if (task.type === 'scrub_stains') {
          const currentCount = task.currentCount + 1;
          return {
            ...task,
            currentCount,
            isCompleted: currentCount >= task.targetCount
          };
        }
        return task;
      });
      updatedContract = { ...activeContract, tasks: updatedTasks };
      showToast('Stain scrubbed clean!');
    }

    set({
      activeProperty: { ...activeProperty, dirtStains: updatedStains },
      activeContract: updatedContract
    });
  },

  paintWallSegment: (wallId) => {
    const { activeProperty, activeContract, selectedPaintColor, showToast } = get();
    if (!activeProperty) return;

    const updatedWalls = activeProperty.walls.map(w =>
      w.id === wallId ? { ...w, color: selectedPaintColor.hex } : w
    );

    let updatedContract = activeContract;
    if (activeContract) {
      const updatedTasks = activeContract.tasks.map(task => {
        if (task.type === 'paint_walls') {
          const currentCount = task.currentCount + 1;
          return {
            ...task,
            currentCount,
            isCompleted: currentCount >= task.targetCount
          };
        }
        return task;
      });
      updatedContract = { ...activeContract, tasks: updatedTasks };
    }

    set({
      activeProperty: { ...activeProperty, walls: updatedWalls },
      activeContract: updatedContract
    });

    showToast(`Painted wall with ${selectedPaintColor.name}`);
  },

  changeFlooring: (floorId) => {
    const { activeProperty, activeContract, selectedFlooring, showToast } = get();
    if (!activeProperty) return;

    const updatedFloors = activeProperty.floors.map(f =>
      f.id === floorId ? { ...f, materialId: selectedFlooring.id, color: selectedFlooring.color } : f
    );

    let updatedContract = activeContract;
    if (activeContract) {
      const updatedTasks = activeContract.tasks.map(task => {
        if (task.type === 'change_flooring') {
          const currentCount = task.currentCount + 1;
          return {
            ...task,
            currentCount,
            isCompleted: currentCount >= task.targetCount
          };
        }
        return task;
      });
      updatedContract = { ...activeContract, tasks: updatedTasks };
    }

    set({
      activeProperty: { ...activeProperty, floors: updatedFloors },
      activeContract: updatedContract
    });

    showToast(`Installed ${selectedFlooring.name}`);
  },

  repairFixture: (fixtureId) => {
    const { activeProperty, activeContract, showToast } = get();
    if (!activeProperty) return;

    const target = activeProperty.fixtures.find(f => f.id === fixtureId);
    if (!target || target.isRepaired) return;

    const updatedFixtures = activeProperty.fixtures.map(f =>
      f.id === fixtureId ? { ...f, isBroken: false, isRepaired: true } : f
    );

    let updatedContract = activeContract;
    if (activeContract) {
      const updatedTasks = activeContract.tasks.map(task => {
        if (task.type === 'repair_fixtures') {
          const currentCount = task.currentCount + 1;
          return {
            ...task,
            currentCount,
            isCompleted: currentCount >= task.targetCount
          };
        }
        return task;
      });
      updatedContract = { ...activeContract, tasks: updatedTasks };
    }

    set({
      activeProperty: { ...activeProperty, fixtures: updatedFixtures },
      activeContract: updatedContract
    });

    showToast(`Repaired ${target.name}`);
  },

  gridSnapEnabled: true,
  gridSnapSize: 1.0,
  toggleGridSnap: () => {
    const nextEnabled = !get().gridSnapEnabled;
    set({ gridSnapEnabled: nextEnabled });
    get().showToast(nextEnabled ? `Grid Snap Enabled (${get().gridSnapSize}m)` : 'Grid Snap Disabled');
  },
  setGridSnapSize: (size) => {
    set({ gridSnapSize: size, gridSnapEnabled: true });
    get().showToast(`Grid Snap set to ${size}m`);
  },
  snapToGrid: (pos) => {
    const { gridSnapEnabled, gridSnapSize } = get();
    if (!gridSnapEnabled || gridSnapSize <= 0) return pos;
    const s = gridSnapSize;
    return [
      Math.floor(pos[0] / s) * s + s / 2,
      pos[1],
      Math.floor(pos[2] / s) * s + s / 2
    ];
  },

  placeFurniture: (item, position, rotation) => {
    const { activeProperty, activeContract, showToast, snapToGrid } = get();
    if (!activeProperty) return false;

    const snappedPos = snapToGrid(position);

    // Check if cell is already occupied
    const cellOccupied = activeProperty.furniture.some((f) => {
      return Math.abs(f.position[0] - snappedPos[0]) < 0.3 && Math.abs(f.position[2] - snappedPos[2]) < 0.3 && Math.abs(f.position[1] - snappedPos[1]) < 0.3;
    });

    if (cellOccupied) {
      showToast('⚠️ Target space already occupied');
      return false;
    }

    const newFurnitureObj: FurnitureObject = {
      id: 'furn_' + Math.random().toString(36).substring(2, 9),
      catalogId: item.id,
      name: item.name,
      category: item.category,
      meshName: item.meshName,
      modelPath: item.modelPath,
      position: snappedPos,
      rotation,
      scale: item.scaleOffset || [1, 1, 1],
      price: item.price,
      placementSurface: item.placementSurface
    };

    const updatedFurniture = [...activeProperty.furniture, newFurnitureObj];

    let updatedContract = activeContract;
    if (activeContract) {
      const updatedTasks = activeContract.tasks.map(task => {
        if (task.type === 'place_furniture') {
          const currentCount = task.currentCount + 1;
          return {
            ...task,
            currentCount,
            isCompleted: currentCount >= task.targetCount
          };
        }
        return task;
      });
      updatedContract = { ...activeContract, tasks: updatedTasks };
    }

    set({
      activeProperty: { ...activeProperty, furniture: updatedFurniture },
      activeContract: updatedContract
    });

    showToast(`Placed ${item.name}`);
    return true;
  },

  demolishWall: (wallId) => {
    const { activeProperty, showToast } = get();
    if (!activeProperty) return;

    const updatedWalls = activeProperty.walls.map(w =>
      w.id === wallId ? { ...w, isDemolished: true } : w
    );

    set({ activeProperty: { ...activeProperty, walls: updatedWalls } });
    showToast('Demolished wall block!');
  },

  buildWall: (position) => {
    const { activeProperty, selectedWallBlock, showToast, snapToGrid } = get();
    if (!activeProperty) return;

    const snappedPos = snapToGrid(position);
    const gridX = snappedPos[0];
    const gridY = Math.max(0, Math.round(position[1] * 100) / 100);
    const gridZ = snappedPos[2];

    // Check if block already exists at this exact grid cell
    const blockExists = activeProperty.walls.some((w) => {
      if (w.isDemolished) return false;
      const wMidX = (w.startPoint[0] + w.endPoint[0]) / 2;
      const wMidZ = (w.startPoint[2] + w.endPoint[2]) / 2;
      const wY = w.startPoint[1] ?? 0;
      return Math.abs(wMidX - gridX) < 0.2 && Math.abs(wMidZ - gridZ) < 0.2 && Math.abs(wY - gridY) < 0.2;
    });

    if (blockExists) {
      showToast('⚠️ Block already exists at this location');
      return;
    }

    const newWall: WallSegment = {
      id: 'wall_block_' + Math.random().toString(36).substring(2, 9),
      roomId: 'room_custom',
      startPoint: [gridX - 0.5, gridY, gridZ],
      endPoint: [gridX + 0.5, gridY, gridZ],
      height: 1.0,
      thickness: 1.0,
      color: selectedWallBlock.color,
      blockType: selectedWallBlock.type,
      rotation: get().placementRotation,
      isDemolished: false
    };

    set({
      activeProperty: { ...activeProperty, walls: [...activeProperty.walls, newWall] }
    });

    showToast(`Built ${selectedWallBlock.name} Cube Block`);
  },

  completeContract: () => {
    const { activeContract, showToast } = get();
    if (!activeContract || activeContract.isCompleted) return;

    const allCompleted = activeContract.tasks.every(t => t.isCompleted);
    if (!allCompleted) {
      showToast('Complete all contract tasks first!');
      return;
    }

    set({
      activeContract: { ...activeContract, isCompleted: true }
    });

    showToast(`CONGRATULATIONS! Sandbox goal reached!`);
  }
}));
