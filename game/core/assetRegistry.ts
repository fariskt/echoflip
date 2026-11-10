import type { TerrainPreset } from '../../types';
import type { FurnitureCategory, PlacementSurface } from '../../types/renovation';

export interface PreloadedAsset {
  name: string;
  url: string;
  category?: FurnitureCategory;
  dimensions?: [number, number, number];
  placementSurface?: PlacementSurface;
  defaultScale?: [number, number, number];
}

// All 26 real 3D .glb models discovered in public/assets
export const PRELOADED_ASSETS: PreloadedAsset[] = [
  // Furniture Folder Assets
  { name: '3-seater_sofa', url: '/assets/furniture/3-seater_sofa.glb', category: 'seating', dimensions: [2.2, 0.9, 0.9], placementSurface: 'FloorOnly' },
  { name: 'armchair', url: '/assets/furniture/armchair.glb', category: 'seating', dimensions: [0.9, 0.9, 0.8], placementSurface: 'FloorOnly' },
  { name: 'bed', url: '/assets/furniture/bed.glb', category: 'beds', dimensions: [2.0, 1.1, 2.1], placementSurface: 'FloorOnly' },
  { name: 'coffee_table', url: '/assets/furniture/coffee_table.glb', category: 'tables', dimensions: [1.2, 0.45, 0.6], placementSurface: 'FloorOnly' },
  { name: 'dining_chair', url: '/assets/furniture/dining_chair.glb', category: 'seating', dimensions: [0.6, 0.9, 0.6], placementSurface: 'FloorOnly' },
  { name: 'kitchen_cabinet', url: '/assets/furniture/kitchen_cabinet.glb', category: 'kitchen', dimensions: [1.0, 0.9, 0.6], placementSurface: 'FloorOnly' },
  { name: 'kitchen_sink', url: '/assets/furniture/kitchen_sink.glb', category: 'kitchen', dimensions: [1.2, 0.9, 0.6], placementSurface: 'FloorOnly' },
  { name: 'mini_table', url: '/assets/furniture/mini_table.glb', category: 'tables', dimensions: [0.6, 0.5, 0.6], placementSurface: 'FloorOnly' },
  { name: 'modern_door', url: '/assets/furniture/modern_door.glb', category: 'doors', dimensions: [1.0, 2.2, 0.25], placementSurface: 'WallMounted' },
  { name: 'modular_window_05', url: '/assets/furniture/modular_window_05.glb', category: 'windows', dimensions: [1.2, 1.4, 0.2], placementSurface: 'WallMounted' },
  { name: 'steep_staircase', url: '/assets/furniture/steep_staircase.glb', category: 'building', dimensions: [1.2, 2.8, 2.5], placementSurface: 'FloorOnly' },
  { name: 'table_and_chair', url: '/assets/furniture/table_and_chair.glb', category: 'tables', dimensions: [1.6, 0.8, 1.2], placementSurface: 'FloorOnly' },
  { name: 'wardrobe', url: '/assets/furniture/wardrobe.glb', category: 'storage', dimensions: [1.2, 2.0, 0.6], placementSurface: 'FloorOnly' },
  { name: 'window', url: '/assets/furniture/window.glb', category: 'windows', dimensions: [1.0, 1.2, 0.2], placementSurface: 'WallMounted' },

  // Assets Root Folder
  { name: 'bathroom_sink', url: '/assets/bathroom_sink.glb', category: 'bathroom', dimensions: [0.8, 0.85, 0.5], placementSurface: 'FloorOnly' },
  { name: 'brick_wall', url: '/assets/brick_wall.glb', category: 'building', dimensions: [1.0, 1.0, 1.0], placementSurface: 'FloorOnly' },
  { name: 'ceiling_light', url: '/assets/ceiling_light.glb', category: 'lighting', dimensions: [0.4, 0.6, 0.4], placementSurface: 'CeilingMounted' },
  { name: 'ceiling_window_and_frame', url: '/assets/ceiling_window_and_frame.glb', category: 'windows', dimensions: [1.5, 0.3, 1.5], placementSurface: 'CeilingMounted' },
  { name: 'floating_floor', url: '/assets/floating_floor.glb', category: 'building', dimensions: [2.0, 0.15, 2.0], placementSurface: 'FloorOnly' },
  { name: 'floor_white_tile_2x2_meters', url: '/assets/floor_white_tile_2x2_meters.glb', category: 'building', dimensions: [2.0, 0.05, 2.0], placementSurface: 'FloorOnly' },
  { name: 'fridge', url: '/assets/fridge.glb', category: 'kitchen', dimensions: [0.9, 1.8, 0.8], placementSurface: 'FloorOnly' },
  { name: 'led_ceiling_light', url: '/assets/led_ceiling_light.glb', category: 'lighting', dimensions: [0.6, 0.1, 0.6], placementSurface: 'CeilingMounted' },
  { name: 'modern_shower', url: '/assets/modern_shower.glb', category: 'bathroom', dimensions: [1.1, 2.1, 1.1], placementSurface: 'FloorOnly' },
  { name: 'modular_wall_09', url: '/assets/modular_wall_09.glb', category: 'building', dimensions: [1.0, 1.0, 1.0], placementSurface: 'FloorOnly' },
  { name: 'toilet', url: '/assets/toilet.glb', category: 'bathroom', dimensions: [0.5, 0.8, 0.7], placementSurface: 'FloorOnly' },
  { name: 'worn_concrete_wall', url: '/assets/worn_concrete_wall.glb', category: 'building', dimensions: [1.0, 1.0, 1.0], placementSurface: 'FloorOnly' },

  // Preserved mesh fallback compatibility mappings
  { name: 'Door', url: '/assets/furniture/modern_door.glb' },
  { name: 'Window', url: '/assets/furniture/window.glb' },
  { name: 'Pillar', url: '/assets/steep_staircase.glb' },
  { name: 'Sofa', url: '/assets/furniture/3-seater_sofa.glb' },
  { name: 'Chair', url: '/assets/furniture/armchair.glb' },
  { name: 'Table', url: '/assets/furniture/coffee_table.glb' },
  { name: 'Table_Large', url: '/assets/furniture/table_and_chair.glb' },
  { name: 'Desk', url: '/assets/furniture/mini_table.glb' },
  { name: 'Bed', url: '/assets/furniture/bed.glb' },
  { name: 'Cabinet', url: '/assets/furniture/wardrobe.glb' },
  { name: 'Lamp', url: '/assets/ceiling_light.glb' },
  { name: 'Plant', url: '' } // Fallback mesh for decor plant
];

export const TERRAIN_PRESETS: TerrainPreset[] = [
  { id: 'forest_grass', name: 'Forest Grass', color: '#2d4a22' },
  { id: 'plain_grass', name: 'Plain Grass', color: '#3f6212' },
  { id: 'dark_soil', name: 'Forest Soil', color: '#3f2e18' },
];
