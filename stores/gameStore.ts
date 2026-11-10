import { create } from 'zustand';
import type { TerrainPreset } from '../types';
import { TERRAIN_PRESETS } from '../game/core/assetRegistry';

interface GameState {
  terrain: TerrainPreset;
  loadingProgress: number;
  loadingMessage: string;
  isLoaded: boolean;
  objective: string;
  setTerrain: (preset: TerrainPreset) => void;
  setLoadingProgress: (progress: number, msg?: string) => void;
  setLoaded: (loaded: boolean) => void;
  setObjective: (obj: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  terrain: TERRAIN_PRESETS[0],
  loadingProgress: 0,
  loadingMessage: 'Initializing EchoFlip...',
  isLoaded: false,
  objective: 'EchoFlip: House Renovation',
  setTerrain: (preset) => set({ terrain: preset }),
  setLoadingProgress: (progress, msg) => set((state) => ({ loadingProgress: progress, loadingMessage: msg ?? state.loadingMessage })),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setObjective: (obj) => set({ objective: obj }),
}));
