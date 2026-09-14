'use client';

import '../lib/reactPolyfill';
import React, { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, OrbitControls, Grid, Sky } from '@react-three/drei';

import { HouseRenderer } from '../game/components/HouseRenderer';
import { ForestBackground } from '../game/components/ForestBackground';
import { FirstPersonRenovationController } from '../game/components/FirstPersonRenovationController';

import { TERRAIN_PRESETS } from '../game/core/assetRegistry';
import { useGameStore } from '../stores/gameStore';
import { useRenovationStore } from '../stores/renovationStore';

import type { PlacedObject } from '../types';
import type { RenovationProperty, RenovationContract } from '../types/renovation';

type GameCanvasProps = {
  initialObjects?: PlacedObject[];
  initialTerrainId?: string | null;
  mode?: 'renovation' | 'legacy';
};

function EchoFlipScene() {
  const [pointerPos, setPointerPos] = useState<THREE.Vector3 | null>(null);
  const [pointerNorm, setPointerNorm] = useState<THREE.Vector3 | null>(null);
  const [pointerUserData, setPointerUserData] = useState<Record<string, any> | null>(null);
  const appMode = useRenovationStore((state) => state.appMode);

  return (
    <>
      <PerspectiveCamera makeDefault fov={65} position={appMode === 'editor' ? [12, 12, 18] : [0, 1.6, 6]} />
      {appMode === 'editor' ? (
        <>
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
          <Grid infiniteGrid fadeDistance={100} sectionSize={5} cellSize={1} cellColor="#94a3b8" sectionColor="#475569" />
        </>
      ) : (
        <FirstPersonRenovationController
          onPointerTargetChange={(pos, norm, userData) => {
            setPointerPos(pos);
            setPointerNorm(norm);
            setPointerUserData(userData || null);
          }}
        />
      )}

      {/* Bright Daylight Sky Dome & Light Fog */}
      <Sky sunPosition={[50, 40, 30]} turbidity={8} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <color attach="background" args={['#bae6fd']} />
      <fog attach="fog" args={['#e0f2fe', 40, 200]} />

      {/* Daylight Ambient & Direct Sunlight */}
      <ambientLight intensity={1.1} color="#ffffff" />
      <directionalLight
        position={[40, 70, 30]}
        intensity={3.2}
        color="#fffbe8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[-30, 40, -20]}
        intensity={0.6}
        color="#e0f2fe"
      />

      <Environment preset="city" />

      {/* Outdoor Surrounding Environment (Grass, Road, Rocks, Horizon Mountains, Solar Lamps & Clouds) */}
      <ForestBackground />

      {/* Main Property Renovation Base */}
      <HouseRenderer pointerPosition={pointerPos} pointerNormal={pointerNorm} pointerHitUserData={pointerUserData} />
    </>
  );
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  initialTerrainId,
  mode = 'renovation'
}) => {
  const setTerrain = useGameStore((state) => state.setTerrain);
  const setLoadingProgress = useGameStore((state) => state.setLoadingProgress);
  const setLoaded = useGameStore((state) => state.setLoaded);
  const setObjective = useGameStore((state) => state.setObjective);

  const loadProperty = useRenovationStore((state) => state.loadProperty);
  const loadContract = useRenovationStore((state) => state.loadContract);

  useEffect(() => {
    const preset = TERRAIN_PRESETS.find((entry) => entry.id === initialTerrainId) ?? TERRAIN_PRESETS[0];
    setTerrain(preset);

    async function initEchoFlip() {
      // Default fallback starter property to guarantee activeProperty is initialized
      const defaultProperty: RenovationProperty = {
        id: 'starter_house',
        name: '60m × 60m Plain Base Sandbox',
        address: 'Sandbox Plot, Forest Edge',
        estimatedValue: 500000,
        buyPrice: 0,
        isOwned: true,
        spawnPoint: [0, 1.6, 20],
        walls: [],
        floors: [
          {
            id: 'floor_main_base',
            roomId: 'room_sandbox_base',
            bounds: { minX: -30, maxX: 30, minZ: -30, maxZ: 30, y: 0 },
            materialId: 'floor_concrete',
            color: '#64748b'
          }
        ],
        dirtStains: [],
        fixtures: [],
        furniture: []
      };

      const defaultContract: RenovationContract = {
        id: 'contract_oakridge_renovation',
        title: 'Oakridge Forest Turnaround',
        clientName: 'Sarah Jenkins (Forest Homeowner)',
        description: 'Hi there! I just acquired this cozy forest plot in Oakridge. It needs cleaning, custom flooring, built walls, and living room furniture!',
        budget: 5000,
        payout: 4200,
        propertyId: 'starter_house',
        isCompleted: false,
        tasks: [
          { id: 'task_scrub_stains', description: 'Scrub dirt stains off walls and floors', type: 'scrub_stains', targetCount: 0, currentCount: 0, reward: 400, isCompleted: true },
          { id: 'task_paint_walls', description: 'Paint walls with fresh coat of paint', type: 'paint_walls', targetCount: 3, currentCount: 0, reward: 600, isCompleted: false },
          { id: 'task_change_flooring', description: 'Install new flooring (Wood/Tile/Carpet)', type: 'change_flooring', targetCount: 1, currentCount: 0, reward: 800, isCompleted: false },
          { id: 'task_repair_fixtures', description: 'Repair broken lighting and plumbing fixtures', type: 'repair_fixtures', targetCount: 2, currentCount: 0, reward: 500, isCompleted: false },
          { id: 'task_place_furniture', description: 'Unpack and place living room furniture (Sofa/Table/Bed)', type: 'place_furniture', targetCount: 3, currentCount: 0, reward: 1000, isCompleted: false }
        ]
      };

      // Set fallback immediately
      loadProperty(defaultProperty);
      loadContract(defaultContract);

      try {
        const [propRes, contractRes] = await Promise.all([
          fetch('/data/properties/starter_house.json'),
          fetch('/data/contracts/starter_contract.json')
        ]);

        if (propRes.ok) {
          const propData = (await propRes.json()) as RenovationProperty;
          loadProperty(propData);
        }
        if (contractRes.ok) {
          const contractData = (await contractRes.json()) as RenovationContract;
          loadContract(contractData);
        }
      } catch (e) {
        console.warn('Loaded default property data:', e);
      } finally {
        setObjective('EchoFlip: Complete your renovation contract!');
        setLoadingProgress(100, 'Forest Property Loaded');
        setLoaded(true);
      }
    }

    if (mode === 'renovation') {
      initEchoFlip();
    } else {
      setLoadingProgress(100, 'World loaded');
      setLoaded(true);
    }
  }, [initialTerrainId, loadContract, loadProperty, mode, setLoaded, setLoadingProgress, setObjective, setTerrain]);

  return (
    <div className="relative w-full h-full">
      <Canvas shadows dpr={[1, 2]} className="w-full h-full block cursor-pointer">
        <Suspense fallback={null}>
          <EchoFlipScene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GameCanvas;
