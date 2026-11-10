import * as THREE from 'three';
import type { FurnitureCategory, AssetNormalizedMetadata } from '../../types/renovation';

export interface TargetDimension {
  width: number;
  height: number;
  depth: number;
}

// Category-based standard real-world target dimensions (in meters)
export const CATEGORY_TARGET_DIMENSIONS: Record<FurnitureCategory, TargetDimension> = {
  seating: { width: 2.2, height: 0.9, depth: 0.9 },
  tables: { width: 1.2, height: 0.75, depth: 0.8 },
  beds: { width: 2.0, height: 1.1, depth: 2.1 },
  storage: { width: 1.2, height: 2.0, depth: 0.6 },
  kitchen: { width: 1.1, height: 0.9, depth: 0.65 },
  bathroom: { width: 0.85, height: 1.5, depth: 0.7 },
  doors: { width: 1.0, height: 2.1, depth: 0.2 },
  windows: { width: 1.2, height: 1.3, depth: 0.2 },
  lighting: { width: 0.5, height: 0.5, depth: 0.5 },
  building: { width: 1.0, height: 1.0, depth: 1.0 },
  appliances: { width: 0.8, height: 1.5, depth: 0.8 },
  decor: { width: 0.5, height: 0.8, depth: 0.5 }
};

// Item-specific target dimension overrides for precise real-world matching
export const SPECIFIC_ASSET_TARGETS: Record<string, TargetDimension> = {
  // Seating
  '3-seater_sofa': { width: 2.2, height: 0.9, depth: 0.95 },
  'armchair': { width: 0.9, height: 0.85, depth: 0.85 },
  'dining_chair': { width: 0.55, height: 0.9, depth: 0.55 },

  // Tables
  'coffee_table': { width: 1.2, height: 0.45, depth: 0.6 },
  'mini_table': { width: 0.65, height: 0.75, depth: 0.65 },
  'table_and_chair': { width: 1.6, height: 0.8, depth: 1.2 },

  // Beds & Storage
  'bed': { width: 2.0, height: 1.1, depth: 2.1 },
  'wardrobe': { width: 1.2, height: 2.0, depth: 0.6 },

  // Kitchen
  'fridge': { width: 0.9, height: 1.85, depth: 0.8 },
  'kitchen_cabinet': { width: 1.0, height: 0.9, depth: 0.6 },
  'kitchen_sink': { width: 1.2, height: 0.9, depth: 0.6 },

  // Bathroom
  'bathroom_sink': { width: 0.8, height: 0.85, depth: 0.55 },
  'modern_shower': { width: 1.1, height: 2.1, depth: 1.1 },
  'toilet': { width: 0.5, height: 0.8, depth: 0.7 },

  // Doors & Windows
  'modern_door': { width: 1.0, height: 2.1, depth: 0.15 },
  'window': { width: 1.0, height: 1.2, depth: 0.15 },
  'modular_window_05': { width: 1.2, height: 1.4, depth: 0.15 },
  'ceiling_window_and_frame': { width: 1.5, height: 0.3, depth: 1.5 },

  // Lighting
  'ceiling_light': { width: 0.4, height: 0.6, depth: 0.4 },
  'led_ceiling_light': { width: 0.6, height: 0.1, depth: 0.6 },

  // Building & Structures
  'steep_staircase': { width: 1.2, height: 2.8, depth: 2.5 },
  'brick_wall': { width: 1.0, height: 1.0, depth: 1.0 },
  'modular_wall_09': { width: 1.0, height: 1.0, depth: 1.0 },
  'worn_concrete_wall': { width: 1.0, height: 1.0, depth: 1.0 },
  'floating_floor': { width: 2.0, height: 0.15, depth: 2.0 },
  'floor_white_tile_2x2_meters': { width: 2.0, height: 0.05, depth: 2.0 }
};

// Global cache for calculated model metadata
const normalizedMetadataCache = new Map<string, AssetNormalizedMetadata>();
// Overrides set by developer debug tool
const targetDimensionOverrides = new Map<string, TargetDimension>();

export function getTargetDimensions(
  category: FurnitureCategory = 'seating',
  modelPath: string = '',
  assetId: string = ''
): TargetDimension {
  if (targetDimensionOverrides.has(modelPath)) {
    return targetDimensionOverrides.get(modelPath)!;
  }

  const cleanName = modelPath.split('/').pop()?.replace(/\.(glb|gltf|fbx|obj)$/i, '') || assetId;

  if (cleanName && SPECIFIC_ASSET_TARGETS[cleanName]) {
    return SPECIFIC_ASSET_TARGETS[cleanName];
  }

  if (assetId && SPECIFIC_ASSET_TARGETS[assetId]) {
    return SPECIFIC_ASSET_TARGETS[assetId];
  }

  return CATEGORY_TARGET_DIMENSIONS[category] || { width: 1.0, height: 1.0, depth: 1.0 };
}

export function setTargetDimensionOverride(modelPath: string, target: TargetDimension) {
  targetDimensionOverrides.set(modelPath, target);
  normalizedMetadataCache.delete(modelPath);
}

export function getNormalizedMetadataCache(): Map<string, AssetNormalizedMetadata> {
  return normalizedMetadataCache;
}

export function calculateModelNormalization(
  scene: THREE.Object3D,
  modelPath: string,
  category: FurnitureCategory = 'seating',
  assetId: string = ''
): AssetNormalizedMetadata {
  if (normalizedMetadataCache.has(modelPath)) {
    return normalizedMetadataCache.get(modelPath)!;
  }

  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);

  const origW = size.x || 1.0;
  const origH = size.y || 1.0;
  const origD = size.z || 1.0;

  const target = getTargetDimensions(category, modelPath, assetId);

  const scaleX = target.width / origW;
  const scaleY = target.height / origH;
  const scaleZ = target.depth / origD;

  const uniformScale = Math.min(scaleX, scaleY, scaleZ);

  // Align lowest point to Y = 0
  const floorOffset = -box.min.y * uniformScale;

  const normalizedDimensions = {
    width: origW * uniformScale,
    height: origH * uniformScale,
    depth: origD * uniformScale
  };

  const metadata: AssetNormalizedMetadata = {
    id: assetId || modelPath,
    modelPath,
    category,
    originalDimensions: { width: origW, height: origH, depth: origD },
    targetDimensions: target,
    normalizedScale: uniformScale,
    normalizedDimensions,
    floorOffset,
    minY: box.min.y,
    isNormalized: true
  };

  normalizedMetadataCache.set(modelPath, metadata);
  return metadata;
}
