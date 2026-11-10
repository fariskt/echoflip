'use client';

import '../lib/reactPolyfill';
import React from 'react';
import dynamic from 'next/dynamic';
import { EchoFlipHUD } from './EchoFlipHUD';
import LoadingScreen from './LoadingScreen';
import type { PlacedObject } from '../types';

const GameCanvas = dynamic(() => import('./GameCanvas'), {
  ssr: false,
});

type MainPageContainerProps = {
  initialObjects?: PlacedObject[];
  initialTerrainId?: string | null;
};

export default function MainPageContainer({
  initialObjects = [],
  initialTerrainId = 'forest_grass',
}: MainPageContainerProps) {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <LoadingScreen />
      <GameCanvas initialObjects={initialObjects} initialTerrainId={initialTerrainId} />
      <EchoFlipHUD />
    </main>
  );
}

