'use client';

import React from 'react';
import {
  Hand,
  Sparkles,
  Paintbrush,
  Grid,
  Hammer,
  SquarePlus,
  Armchair,
  ClipboardList,
  CheckCircle2,
  X,
  Edit3,
  Coins,
  Palette,
  RotateCw,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  useRenovationStore,
  PAINT_COLORS,
  FLOORING_MATERIALS,
  FURNITURE_CATALOG,
  WALL_BLOCK_PRESETS
} from '../stores/renovationStore';
import type { RenovationTool } from '../types/renovation';

export const EchoFlipHUD: React.FC = () => {
  const appMode = useRenovationStore((state) => state.appMode);
  const setAppMode = useRenovationStore((state) => state.setAppMode);
  const money = useRenovationStore((state) => state.money);
  const equippedTool = useRenovationStore((state) => state.equippedTool);
  const setEquippedTool = useRenovationStore((state) => state.setEquippedTool);

  const activeProperty = useRenovationStore((state) => state.activeProperty);
  const activeContract = useRenovationStore((state) => state.activeContract);

  const selectedPaintColor = useRenovationStore((state) => state.selectedPaintColor);
  const setSelectedPaintColor = useRenovationStore((state) => state.setSelectedPaintColor);

  const selectedFlooring = useRenovationStore((state) => state.selectedFlooring);
  const setSelectedFlooring = useRenovationStore((state) => state.setSelectedFlooring);

  const selectedFurniture = useRenovationStore((state) => state.selectedFurniture);
  const setSelectedFurniture = useRenovationStore((state) => state.setSelectedFurniture);

  const selectedPlacedFurnitureId = useRenovationStore((state) => state.selectedPlacedFurnitureId);
  const setSelectedPlacedFurnitureId = useRenovationStore((state) => state.setSelectedPlacedFurnitureId);

  const selectedPlacedWallId = useRenovationStore((state) => state.selectedPlacedWallId);
  const setSelectedPlacedWallId = useRenovationStore((state) => state.setSelectedPlacedWallId);

  const selectedWallBlock = useRenovationStore((state) => state.selectedWallBlock);
  const setSelectedWallBlock = useRenovationStore((state) => state.setSelectedWallBlock);

  const placementRotation = useRenovationStore((state) => state.placementRotation);
  const rotatePlacementYaw = useRenovationStore((state) => state.rotatePlacementYaw);
  const tiltPlacementPitch = useRenovationStore((state) => state.tiltPlacementPitch);
  const rollPlacementRoll = useRenovationStore((state) => state.rollPlacementRoll);
  const resetPlacementRotation = useRenovationStore((state) => state.resetPlacementRotation);

  const isCatalogOpen = useRenovationStore((state) => state.isCatalogOpen);
  const setCatalogOpen = useRenovationStore((state) => state.setCatalogOpen);

  const isPaintMenuOpen = useRenovationStore((state) => state.isPaintMenuOpen);
  const setPaintMenuOpen = useRenovationStore((state) => state.setPaintMenuOpen);

  const isContractMenuOpen = useRenovationStore((state) => state.isContractMenuOpen);
  const setContractMenuOpen = useRenovationStore((state) => state.setContractMenuOpen);

  const toastMessage = useRenovationStore((state) => state.toastMessage);
  const completeContract = useRenovationStore((state) => state.completeContract);

  const gridSnapEnabled = useRenovationStore((state) => state.gridSnapEnabled);
  const gridSnapSize = useRenovationStore((state) => state.gridSnapSize);
  const toggleGridSnap = useRenovationStore((state) => state.toggleGridSnap);
  const setGridSnapSize = useRenovationStore((state) => state.setGridSnapSize);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Escape') {
        if (selectedFurniture || selectedPlacedFurnitureId || selectedPlacedWallId || equippedTool === 'furniture') {
          setSelectedFurniture(null);
          setSelectedPlacedFurnitureId(null);
          setSelectedPlacedWallId(null);
          setEquippedTool('inspect');
          useRenovationStore.getState().showToast('Selection Cancelled [ESC]');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [equippedTool, selectedFurniture, selectedPlacedFurnitureId, selectedPlacedWallId, setEquippedTool, setSelectedFurniture, setSelectedPlacedFurnitureId, setSelectedPlacedWallId]);

  const tools: { id: RenovationTool; label: string; icon: React.ReactNode; key: string }[] = [
    { id: 'inspect', label: 'Inspect / Hand', icon: <Hand className="w-5 h-5" />, key: '1' },
    { id: 'sponge', label: 'Sponge / Clean', icon: <Sparkles className="w-5 h-5" />, key: '2' },
    { id: 'paint_roller', label: 'Paint Roller', icon: <Paintbrush className="w-5 h-5" />, key: '3' },
    { id: 'flooring', label: 'Flooring Tile', icon: <Grid className="w-5 h-5" />, key: '4' },
    { id: 'hammer', label: 'Demolition', icon: <Hammer className="w-5 h-5" />, key: '5' },
    { id: 'wall_builder', label: 'Wall Builder', icon: <SquarePlus className="w-5 h-5" />, key: '6' },
    { id: 'furniture', label: 'Catalog / Place', icon: <Armchair className="w-5 h-5" />, key: '7' }
  ];

  const handleToolClick = (toolId: RenovationTool) => {
    setEquippedTool(toolId);
    if (toolId === 'furniture') {
      setCatalogOpen(true);
    } else if (toolId === 'paint_roller' || toolId === 'flooring' || toolId === 'wall_builder') {
      setPaintMenuOpen(true);
    }
  };

  const getToolActionPrompt = () => {
    switch (equippedTool) {
      case 'inspect':
        return 'Click object to inspect details';
      case 'sponge':
        return 'Click dirt stains to scrub clean';
      case 'paint_roller':
        return `Click wall to paint with ${selectedPaintColor.name}`;
      case 'flooring':
        return `Click floor to install ${selectedFlooring.name}`;
      case 'hammer':
        return 'Click wall block to demolish';
      case 'wall_builder':
        return `Click floor to build ${selectedWallBlock.name}`;
      case 'furniture':
        return selectedFurniture
          ? `Click floor to place ${selectedFurniture.name} (R: Rotate, T: Tilt, G: Roll)`
          : 'Select item from catalog';
      default:
        return 'Click to interact';
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-between p-6 select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between">
        <div className="pointer-events-auto flex items-center space-x-4 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-lg">
            EF
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">EchoFlip Base Sandbox</h1>
            <p className="text-xs text-emerald-400 font-medium">
              60m × 60m Plain Base Area (3,600 m²)
            </p>
          </div>
        </div>

        {/* Center Controls & Mode Switcher */}
        <div className="pointer-events-auto flex items-center space-x-3">
          {/* Vertical Camera Controls Guide */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-900/90 border border-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl backdrop-blur-md">
            <span className="font-semibold text-emerald-400">Camera:</span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">Space/E</span>
            <ArrowUp className="w-3 h-3 text-emerald-400" />
            <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">Ctrl/Q</span>
            <ArrowDown className="w-3 h-3 text-emerald-400" />
          </div>

          {/* Mode Switcher */}
          <button
            onClick={() => setAppMode(appMode === 'renovation' ? 'editor' : 'renovation')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-lg transition duration-200 ${appMode === 'editor'
                ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
          >
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium">
              {appMode === 'editor' ? 'Game Mode' : '3D Studio Mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Center Reticle & Action Prompt */}
      {appMode === 'renovation' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="w-3 h-3 rounded-full border-2 border-white/80 bg-emerald-400/40 shadow-glow" />
          <div className="mt-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-200 text-xs px-3.5 py-1.5 rounded-full shadow-lg font-medium text-center">
            {getToolActionPrompt()}
          </div>
        </div>
      )}

      {/* 3D Object Rotation & Grid Snap Bar */}
      {(equippedTool === 'furniture' || equippedTool === 'wall_builder' || selectedFurniture || selectedPlacedFurnitureId || selectedPlacedWallId) && (
        <div className="pointer-events-auto absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-slate-900/95 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
          <button
            onClick={() => toggleGridSnap()}
            className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition flex items-center gap-1.5 ${gridSnapEnabled
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            title="Toggle Grid Snapping for precise 3D placement"
          >
            <Grid className="w-3.5 h-3.5 text-emerald-400" />
            Grid Snap: {gridSnapEnabled ? `${gridSnapSize}m` : 'OFF'}
          </button>
          <button
            onClick={() => {
              const sizes = [0.25, 0.5, 1.0];
              const next = sizes[(sizes.indexOf(gridSnapSize) + 1) % sizes.length];
              setGridSnapSize(next);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 font-mono transition"
            title="Cycle Grid Snap Step (0.25m / 0.5m / 1.0m)"
          >
            Step: {gridSnapSize}m
          </button>

          <span className="text-slate-600 font-bold">|</span>

          <span className="text-xs font-semibold text-slate-300 mr-1 flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5 text-emerald-400" /> Rotate Object/Wall:
          </span>
          <button
            onClick={() => rotatePlacementYaw(45)}
            className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs px-3 py-1.5 rounded-xl border border-emerald-700/60 font-medium transition flex items-center gap-1"
            title="Rotate Yaw 45 degrees (Shortcut: Key R)"
          >
            +45° <span className="text-[10px] text-emerald-400 font-mono">[R]</span>
          </button>
          <button
            onClick={() => rotatePlacementYaw(90)}
            className="bg-teal-950/80 hover:bg-teal-900 text-teal-300 text-xs px-3 py-1.5 rounded-xl border border-teal-700/60 font-medium transition flex items-center gap-1"
            title="Rotate Yaw 90 degrees (Shortcut: Shift + R)"
          >
            +90° <span className="text-[10px] text-teal-400 font-mono">[Shift+R]</span>
          </button>
          <button
            onClick={() => tiltPlacementPitch(45)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 transition"
            title="Tilt Pitch 45 degrees (Shortcut: Key T)"
          >
            Tilt <span className="text-[10px] text-slate-400 font-mono">[T]</span>
          </button>
          <button
            onClick={() => rollPlacementRoll(45)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 transition"
            title="Roll 45 degrees (Shortcut: Key G)"
          >
            Roll <span className="text-[10px] text-slate-400 font-mono">[G]</span>
          </button>
          <button
            onClick={resetPlacementRotation}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2 py-1.5 rounded-xl border border-slate-700 transition"
            title="Reset rotation to [0,0,0] (Shortcut: Key X)"
          >
            Reset <span className="text-[10px] opacity-75 font-mono">[X]</span>
          </button>
          <button
            onClick={() => {
              setSelectedFurniture(null);
              setSelectedPlacedFurnitureId(null);
              setSelectedPlacedWallId(null);
              setEquippedTool('inspect');
              useRenovationStore.getState().showToast('Selection Cancelled');
            }}
            className="bg-red-950/90 hover:bg-red-900 text-red-200 text-xs px-3 py-1.5 rounded-xl border border-red-700/80 font-semibold transition ml-1 flex items-center gap-1"
            title="Cancel Selection (Shortcut: Escape)"
          >
            Cancel Selection <span className="text-[10px] bg-red-900/60 px-1 py-0.5 rounded font-mono text-red-300">[ESC]</span>
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 pointer-events-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-2xl font-medium text-sm flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Toolbelt */}
      {appMode === 'renovation' && (
        <footer className="pointer-events-auto flex justify-center">
          <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl">
            {tools.map((t) => {
              const isEquipped = equippedTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleToolClick(t.id)}
                  className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl font-medium transition duration-200 ${isEquipped
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-500 text-white shadow-lg scale-105 border border-emerald-400'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200'
                    }`}
                  title={t.label}
                >
                  {t.icon}
                  <span className="text-[10px] mt-1 font-bold opacity-80">{t.key}</span>
                </button>
              );
            })}
          </div>
        </footer>
      )}

      {/* Furniture Catalog Modal */}
      {isCatalogOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Armchair className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Furniture & Architectural Catalog</h2>
              </div>
              <button
                onClick={() => setCatalogOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto">
              {FURNITURE_CATALOG.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedFurniture(item);
                    setEquippedTool('furniture');
                    setCatalogOpen(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${selectedFurniture?.id === item.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1">{item.name}</h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      FREE
                    </span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                      Select
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Paint & Flooring Selection Modal */}
      {isPaintMenuOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Palette className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Materials, Paint & Wall Blocks</h2>
              </div>
              <button
                onClick={() => setPaintMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Paint Colors */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Paint Colors</h3>
                <div className="grid grid-cols-4 gap-3">
                  {PAINT_COLORS.map((paint) => (
                    <button
                      key={paint.id}
                      onClick={() => {
                        setSelectedPaintColor(paint);
                        setEquippedTool('paint_roller');
                        setPaintMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center space-x-3 text-left transition ${selectedPaintColor.id === paint.id
                          ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/40'
                          : 'bg-slate-800/40 border-slate-700'
                        }`}
                    >
                      <div className="w-6 h-6 rounded-full border border-white/20 shadow" style={{ backgroundColor: paint.hex }} />
                      <div>
                        <div className="text-xs font-semibold text-white">{paint.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flooring Materials */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Flooring Materials</h3>
                <div className="grid grid-cols-3 gap-3">
                  {FLOORING_MATERIALS.map((floor) => (
                    <button
                      key={floor.id}
                      onClick={() => {
                        setSelectedFlooring(floor);
                        setEquippedTool('flooring');
                        setPaintMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition ${selectedFlooring.id === floor.id
                          ? 'bg-slate-800 border-emerald-500'
                          : 'bg-slate-800/40 border-slate-700'
                        }`}
                    >
                      <div className="text-xs font-semibold text-white">{floor.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wall Block Presets */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Wall Builder Presets</h3>
                <div className="grid grid-cols-3 gap-3">
                  {WALL_BLOCK_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedWallBlock(preset);
                        setEquippedTool('wall_builder');
                        setPaintMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition ${selectedWallBlock.id === preset.id
                          ? 'bg-slate-800 border-emerald-500'
                          : 'bg-slate-800/40 border-slate-700'
                        }`}
                    >
                      <div className="text-xs font-semibold text-white">{preset.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
