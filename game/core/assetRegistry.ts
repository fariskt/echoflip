import type { TerrainPreset } from '../../types';

export interface PreloadedAsset {
  name: string;
  url: string;
}

export const PRELOADED_ASSETS: PreloadedAsset[] = [
  { name: 'Grass_Tile_H', url: '/models/Grass_Tile_H.glb' },
  { name: 'Door', url: '/models/Door.glb' },
  { name: 'Window', url: '/models/Window.glb' },
  { name: 'Pillar', url: '/models/Pillar.glb' },
  { name: 'Sofa', url: '/models/Sofa.glb' },
  { name: 'Chair', url: '/models/Chair.glb' },
  { name: 'Table', url: '/models/Table.glb' },
  { name: 'Table_Large', url: '/models/Table_Large.glb' },
  { name: 'Desk', url: '/models/Desk.glb' },
  { name: 'Bed', url: '/models/Bed.glb' },
  { name: 'Cabinet', url: '/models/Cabinet.glb' },
  { name: 'Lamp', url: '/models/Lamp.glb' },
  { name: 'Plant', url: '/models/Plant.glb' },
];

export const TERRAIN_PRESETS: TerrainPreset[] = [
  { id: 'forest_grass', name: 'Forest Grass', color: '#2d4a22' },
  { id: 'plain_grass', name: 'Plain Grass', color: '#3f6212' },
  { id: 'dark_soil', name: 'Forest Soil', color: '#3f2e18' },
];
