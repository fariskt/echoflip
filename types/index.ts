export interface PlacedObject {
  id: string;
  type?: string;
  meshName: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  hidden?: boolean;
  points?: [number, number, number][];
  width?: number;
}

export interface TerrainPreset {
  id: string;
  name: string;
  color?: string;
  textureUrl?: string;
}

export type MeshLibrary = Record<string, any>;

export interface PolyPizzaModel {
  ID: string;
  Title: string;
  Category?: string;
  Creator?: {
    Username: string;
  };
  Licence?: string;
  Tags?: string[];
  Download?: string;
  Thumbnail?: string;
}

export interface PolyPizzaListResponse {
  models?: PolyPizzaModel[];
  results?: PolyPizzaModel[];
}
