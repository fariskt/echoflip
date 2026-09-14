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
  { id: 'cat_door_frame', name: 'Wooden Door Frame', category: 'building', meshName: 'Door', price: 140, dimensions: [1.0, 2.2, 0.25], placementSurface: 'WallMounted' },
  { id: 'cat_window_frame', name: 'Glass Window Unit', category: 'building', meshName: 'Window', price: 110, dimensions: [1.2, 1.4, 0.2], placementSurface: 'WallMounted' },
  { id: 'cat_support_pillar', name: 'Structural Column Pillar', category: 'building', meshName: 'Pillar', price: 75, dimensions: [0.4, 3.0, 0.4], placementSurface: 'FloorOnly' },
  { id: 'cat_sofa_modern', name: 'Modern 3-Seater Sofa', category: 'seating', meshName: 'Sofa', price: 450, dimensions: [2.2, 0.9, 0.9], placementSurface: 'FloorOnly' },
  { id: 'cat_armchair', name: 'Scandinavian Armchair', category: 'seating', meshName: 'Chair', price: 180, dimensions: [0.9, 0.9, 0.8], placementSurface: 'FloorOnly' },
  { id: 'cat_coffee_table', name: 'Wood Coffee Table', category: 'tables', meshName: 'Table', price: 120, dimensions: [1.2, 0.45, 0.6], placementSurface: 'FloorOnly' },
  { id: 'cat_dining_table', name: 'Oak Dining Table', category: 'tables', meshName: 'Table_Large', price: 320, dimensions: [1.8, 0.75, 0.9], placementSurface: 'FloorOnly' },
  { id: 'cat_study_desk', name: 'Modern Writing Desk', category: 'tables', meshName: 'Desk', price: 210, dimensions: [1.4, 0.75, 0.6], placementSurface: 'FloorOnly' },
  { id: 'cat_king_bed', name: 'Minimalist King Bed', category: 'beds', meshName: 'Bed', price: 650, dimensions: [2.0, 1.1, 2.1], placementSurface: 'FloorOnly' },
  { id: 'cat_bookshelf', name: 'Tall Wooden Bookshelf', category: 'storage', meshName: 'Cabinet', price: 240, dimensions: [0.9, 1.9, 0.35], placementSurface: 'FloorOnly' },
  { id: 'cat_floor_lamp', name: 'Arc Floor Lamp', category: 'lighting', meshName: 'Lamp', price: 95, dimensions: [0.4, 1.7, 0.4], placementSurface: 'FloorOnly' },
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
  };
  setMobileMove: (dir: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down' | 'turnLeft' | 'turnRight', active: boolean) => void;

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
  setEquippedTool: (tool) => set({ equippedTool: tool }),
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

  activeRoomBlockType: 'full_room',
  roomBlockHeight: 2.8,
  roomBlockWallThickness: 0.2,
  includeCeiling: true,

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
    turnRight: false
  },
  setMobileMove: (dir, active) => set((state) => ({
    mobileMoveState: { ...state.mobileMoveState, [dir]: active }
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
    const { activeProperty, pushUndoState, showToast } = get();
    if (!activeProperty) return '';

    pushUndoState();

    const id = 'block_' + Math.random().toString(36).substring(2, 9);
    const newBlock: RoomBlock = {
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

    const newFurnitureObj: FurnitureObject = {
      id: 'furn_' + Math.random().toString(36).substring(2, 9),
      catalogId: item.id,
      name: item.name,
      category: item.category,
      meshName: item.meshName,
      position: snappedPos,
      rotation,
      scale: [1, 1, 1],
      price: item.price
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
    const gridY = Math.max(0, Math.floor(position[1] + 0.01));
    const gridZ = snappedPos[2];

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
