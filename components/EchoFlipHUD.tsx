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
  Box,
  Undo,
  Redo,
  Copy,
  Trash2,
  CheckCircle2,
  X,
  Edit3,
  Coins,
  Palette,
  RotateCw,
  ArrowUp,
  ArrowDown,
  Layers,
  Maximize,
  Smartphone
} from 'lucide-react';
import {
  useRenovationStore,
  PAINT_COLORS,
  FLOORING_MATERIALS,
  FURNITURE_CATALOG,
  WALL_BLOCK_PRESETS
} from '../stores/renovationStore';
import type { RenovationTool, RoomBlockType } from '../types/renovation';
import { MinecraftTouchControls } from '../game/components/MinecraftTouchControls';

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

  const selectedPlacedBlockId = useRenovationStore((state) => state.selectedPlacedBlockId);
  const setSelectedPlacedBlockId = useRenovationStore((state) => state.setSelectedPlacedBlockId);
  const deleteRoomBlock = useRenovationStore((state) => state.deleteRoomBlock);
  const duplicateRoomBlock = useRenovationStore((state) => state.duplicateRoomBlock);

  const selectedWallBlock = useRenovationStore((state) => state.selectedWallBlock);
  const setSelectedWallBlock = useRenovationStore((state) => state.setSelectedWallBlock);

  const activeRoomBlockType = useRenovationStore((state) => state.activeRoomBlockType);
  const setActiveRoomBlockType = useRenovationStore((state) => state.setActiveRoomBlockType);
  const roomBlockHeight = useRenovationStore((state) => state.roomBlockHeight);
  const setRoomBlockHeight = useRenovationStore((state) => state.setRoomBlockHeight);
  const roomBlockWallThickness = useRenovationStore((state) => state.roomBlockWallThickness);
  const setRoomBlockWallThickness = useRenovationStore((state) => state.setRoomBlockWallThickness);
  const includeCeiling = useRenovationStore((state) => state.includeCeiling);
  const setIncludeCeiling = useRenovationStore((state) => state.setIncludeCeiling);

  const undo = useRenovationStore((state) => state.undo);
  const redo = useRenovationStore((state) => state.redo);
  const undoStack = useRenovationStore((state) => state.undoStack);
  const redoStack = useRenovationStore((state) => state.redoStack);

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
  const setMobileMove = useRenovationStore((state) => state.setMobileMove);

  const [isMobilePanelCollapsed, setIsMobilePanelCollapsed] = React.useState<boolean>(false);
  const [isPortrait, setIsPortrait] = React.useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);

  const handleEnterLandscapeFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {}

    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch {}
  };

  React.useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 850;
      setIsPortrait(portrait);
      setIsFullscreen(!!document.fullscreenElement);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    document.addEventListener('fullscreenchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      document.removeEventListener('fullscreenchange', checkOrientation);
    };
  }, []);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.code === 'Escape') {
        if (selectedFurniture || selectedPlacedFurnitureId || selectedPlacedWallId || selectedPlacedBlockId || equippedTool === 'furniture') {
          setSelectedFurniture(null);
          setSelectedPlacedFurnitureId(null);
          setSelectedPlacedWallId(null);
          setSelectedPlacedBlockId(null);
          setEquippedTool('inspect');
          useRenovationStore.getState().showToast('Selection Cancelled [ESC]');
        }
      } else if (e.key === '8') {
        setEquippedTool('room_builder');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [equippedTool, selectedFurniture, selectedPlacedFurnitureId, selectedPlacedWallId, selectedPlacedBlockId, setEquippedTool, setSelectedFurniture, setSelectedPlacedFurnitureId, setSelectedPlacedWallId, setSelectedPlacedBlockId, undo, redo]);

  const tools: { id: RenovationTool; label: string; icon: React.ReactNode; key: string }[] = [
    { id: 'inspect', label: 'Inspect / Hand', icon: <Hand className="w-5 h-5" />, key: '1' },
    { id: 'sponge', label: 'Sponge / Clean', icon: <Sparkles className="w-5 h-5" />, key: '2' },
    { id: 'paint_roller', label: 'Paint Roller', icon: <Paintbrush className="w-5 h-5" />, key: '3' },
    { id: 'flooring', label: 'Flooring Tile', icon: <Grid className="w-5 h-5" />, key: '4' },
    { id: 'hammer', label: 'Demolition', icon: <Hammer className="w-5 h-5" />, key: '5' },
    { id: 'wall_builder', label: 'Wall Builder', icon: <SquarePlus className="w-5 h-5" />, key: '6' },
    { id: 'furniture', label: 'Catalog / Place', icon: <Armchair className="w-5 h-5" />, key: '7' },
    { id: 'room_builder', label: 'Room / Block Builder', icon: <Box className="w-5 h-5" />, key: '8' }
  ];

  const handleToolClick = (toolId: RenovationTool) => {
    setEquippedTool(toolId);
    if (toolId === 'furniture') {
      setCatalogOpen(true);
    } else if (toolId === 'paint_roller' || toolId === 'flooring' || toolId === 'wall_builder') {
      setPaintMenuOpen(true);
    }
  };

  const cycleTool = (direction: 'next' | 'prev') => {
    const currentIndex = tools.findIndex((t) => t.id === equippedTool);
    let nextIndex = 0;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % tools.length;
    } else {
      nextIndex = (currentIndex - 1 + tools.length) % tools.length;
    }
    const targetTool = tools[nextIndex];
    handleToolClick(targetTool.id);
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
      case 'room_builder':
        return 'Click 1st corner, drag area, click 2nd corner to create room/block! (Esc: Cancel, Shift: Free Snap, Ctrl: Fine Snap)';
      case 'furniture':
        return selectedFurniture
          ? `Click floor to place ${selectedFurniture.name} (R: Rotate, T: Tilt, G: Roll)`
          : 'Select item from catalog';
      default:
        return 'Click to interact';
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden">
      {/* Responsive Top Header */}
      <header className="flex items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center space-x-2 sm:space-x-4 bg-slate-900/90 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-800 shadow-xl">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xs sm:text-base text-white shadow-lg shrink-0">
            EF
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-lg font-bold text-white tracking-wide truncate">EchoFlip Sandbox</h1>
            <p className="hidden xs:block text-[10px] sm:text-xs text-emerald-400 font-medium truncate">
              60m × 60m Base Plot (3,600 m²)
            </p>
          </div>
        </div>

        {/* Center Controls & Mode Switcher */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* Vertical Camera Controls Guide */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-900/90 border border-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl backdrop-blur-md">
            <span className="font-semibold text-emerald-400">Camera:</span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">Space/E</span>
            <ArrowUp className="w-3 h-3 text-emerald-400" />
            <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">Ctrl/Q</span>
            <ArrowDown className="w-3 h-3 text-emerald-400" />
          </div>

          {/* Fullscreen Landscape Button */}
          <button
            onClick={handleEnterLandscapeFullscreen}
            className="flex items-center space-x-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-emerald-400 backdrop-blur-md shadow-lg transition text-xs"
            title="Enter Fullscreen Landscape Mode"
          >
            <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline font-medium text-slate-200">Fullscreen</span>
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => setAppMode(appMode === 'renovation' ? 'editor' : 'renovation')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border backdrop-blur-md shadow-lg transition duration-200 text-xs sm:text-sm ${appMode === 'editor'
                ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
          >
            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {appMode === 'editor' ? 'Game Mode' : '3D Studio'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Portrait Landscape Prompt & Auto Fullscreen Overlay */}
      {isPortrait && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-2xl animate-pulse">
            <Smartphone className="w-8 h-8 text-white rotate-90" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Rotate to Landscape Mode</h2>
          <p className="text-xs text-slate-300 max-w-xs mb-6 leading-relaxed">
            EchoFlip 3D Renovation Editor requires landscape full screen mode for maximum 3D view and touch controls.
          </p>
          <button
            onClick={handleEnterLandscapeFullscreen}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition"
          >
            <Maximize className="w-4 h-4" />
            <span>Enter Fullscreen Landscape ⛶</span>
          </button>
        </div>
      )}

      {/* Mobile-Friendly Room / Block Creation Options Panel */}
      {equippedTool === 'room_builder' && (
        <div className="pointer-events-auto absolute top-16 sm:top-24 left-3 right-3 sm:left-6 sm:right-auto z-40 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 sm:p-4 sm:w-80 max-h-[65vh] overflow-y-auto shadow-2xl backdrop-blur-md space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Box className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">Room / Block Creation</h2>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMobilePanelCollapsed(!isMobilePanelCollapsed)}
                className="px-2 py-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 sm:hidden"
              >
                {isMobilePanelCollapsed ? 'Expand' : 'Hide'}
              </button>
              {/* Undo / Redo Actions */}
              <button
                onClick={() => undo()}
                disabled={undoStack.length === 0}
                className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => redo()}
                disabled={redoStack.length === 0}
                className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {!isMobilePanelCollapsed && (
            <>
              {/* Creation Options Grid */}
              <div>
                <label className="text-[11px] sm:text-xs font-semibold text-slate-300 mb-1.5 block">Creation Target</label>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {[
                    { id: 'full_room' as RoomBlockType, label: 'Full Room Shell' },
                    { id: 'empty_room' as RoomBlockType, label: 'Empty Room' },
                    { id: 'floor' as RoomBlockType, label: 'Floor Block' },
                    { id: 'wall' as RoomBlockType, label: 'Wall Block' },
                    { id: 'ceiling' as RoomBlockType, label: 'Ceiling Block' },
                    { id: 'foundation' as RoomBlockType, label: 'Platform Base' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setActiveRoomBlockType(opt.id)}
                      className={`text-[11px] sm:text-xs px-2 py-1.5 sm:py-2 rounded-xl border text-left font-medium transition ${activeRoomBlockType === opt.id
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold shadow'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Height & Wall Thickness Inputs */}
              <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
                <div>
                  <div className="flex justify-between text-[11px] sm:text-xs text-slate-300 mb-1">
                    <span>Wall / Room Height</span>
                    <span className="font-mono text-emerald-400 font-bold">{roomBlockHeight.toFixed(1)} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={roomBlockHeight}
                    onChange={(e) => setRoomBlockHeight(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-5 sm:h-auto"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] sm:text-xs text-slate-300 mb-1">
                    <span>Wall Thickness</span>
                    <span className="font-mono text-emerald-400 font-bold">{roomBlockWallThickness.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.6"
                    step="0.05"
                    value={roomBlockWallThickness}
                    onChange={(e) => setRoomBlockWallThickness(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-5 sm:h-auto"
                  />
                </div>

                {activeRoomBlockType === 'full_room' && (
                  <label className="flex items-center space-x-2 text-[11px] sm:text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={includeCeiling}
                      onChange={(e) => setIncludeCeiling(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Include Ceiling Slab</span>
                  </label>
                )}
              </div>

              {/* Controls Quick Help */}
              <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] text-slate-400 space-y-0.5 sm:space-y-1">
                <div className="text-emerald-400 font-semibold">🎮 Quick Controls:</div>
                <div>• <span className="text-slate-200">1st Click</span>: Start corner</div>
                <div>• <span className="text-slate-200">Move Mouse/Touch</span>: Area preview</div>
                <div>• <span className="text-slate-200">2nd Click</span>: Confirm room</div>
                <div className="hidden sm:block">• <span className="text-slate-200">Shift</span>: Free drag | <span className="text-slate-200">Ctrl</span>: Fine snap</div>
              </div>

              {/* Selected Block Actions */}
              {selectedPlacedBlockId && (
                <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                  <button
                    onClick={() => duplicateRoomBlock(selectedPlacedBlockId)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl border border-slate-700 flex items-center justify-center space-x-1 transition"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => deleteRoomBlock(selectedPlacedBlockId)}
                    className="flex-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs py-2 rounded-xl border border-red-800/80 flex items-center justify-center space-x-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete Block</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Minecraft Mobile Touch Controls (Left Joystick / D-Pad, Right Touch Look, Action, Jump, Sneak & Sprint) */}
      <MinecraftTouchControls />

      {/* Center Reticle & Action Prompt */}
      {appMode === 'renovation' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none max-w-[90vw]">
          <div className="w-3 h-3 rounded-full border-2 border-white/80 bg-emerald-400/40 shadow-glow" />
          <div className="mt-3 sm:mt-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-200 text-[11px] sm:text-xs px-3 py-1.5 rounded-full shadow-lg font-medium text-center truncate">
            {getToolActionPrompt()}
          </div>
        </div>
      )}

      {/* 3D Object Rotation & Grid Snap Bar (Top-Center under header on mobile, bottom on desktop) */}
      {(equippedTool === 'furniture' || equippedTool === 'wall_builder' || selectedFurniture || selectedPlacedFurnitureId || selectedPlacedWallId) && (
        <div className="pointer-events-auto absolute top-16 sm:top-20 left-1/2 transform -translate-x-1/2 flex items-center space-x-1.5 sm:space-x-2 bg-slate-900/95 border border-slate-700/80 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-2xl backdrop-blur-md max-w-[94vw] overflow-x-auto no-scrollbar z-40">
          <button
            onClick={() => toggleGridSnap()}
            className={`text-[11px] sm:text-xs px-2.5 py-1.5 rounded-xl border font-semibold transition flex items-center gap-1 shrink-0 ${gridSnapEnabled
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
          >
            <Grid className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
            Grid: {gridSnapEnabled ? `${gridSnapSize}m` : 'OFF'}
          </button>
          <button
            onClick={() => {
              const sizes = [0.25, 0.5, 1.0];
              const next = sizes[(sizes.indexOf(gridSnapSize) + 1) % sizes.length];
              setGridSnapSize(next);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] sm:text-xs px-2 py-1.5 rounded-xl border border-slate-700 font-mono transition shrink-0"
          >
            {gridSnapSize}m
          </button>

          <span className="text-slate-600 font-bold shrink-0">|</span>

          <button
            onClick={() => rotatePlacementYaw(45)}
            className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[11px] sm:text-xs px-2.5 py-1.5 rounded-xl border border-emerald-700/60 font-medium transition flex items-center gap-1 shrink-0"
          >
            +45° <span className="hidden sm:inline text-[10px] text-emerald-400 font-mono">[R]</span>
          </button>
          <button
            onClick={() => rotatePlacementYaw(90)}
            className="bg-teal-950/80 hover:bg-teal-900 text-teal-300 text-[11px] sm:text-xs px-2.5 py-1.5 rounded-xl border border-teal-700/60 font-medium transition flex items-center gap-1 shrink-0"
          >
            +90°
          </button>
          <button
            onClick={() => tiltPlacementPitch(45)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] sm:text-xs px-2 py-1.5 rounded-xl border border-slate-700 transition shrink-0"
          >
            Tilt
          </button>
          <button
            onClick={() => rollPlacementRoll(45)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] sm:text-xs px-2 py-1.5 rounded-xl border border-slate-700 transition shrink-0"
          >
            Roll
          </button>
          <button
            onClick={resetPlacementRotation}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] sm:text-xs px-2 py-1.5 rounded-xl border border-slate-700 transition shrink-0"
          >
            Reset
          </button>
          <button
            onClick={() => {
              setSelectedFurniture(null);
              setSelectedPlacedFurnitureId(null);
              setSelectedPlacedWallId(null);
              setEquippedTool('inspect');
              useRenovationStore.getState().showToast('Selection Cancelled');
            }}
            className="bg-red-950/90 hover:bg-red-900 text-red-200 text-[11px] sm:text-xs px-2.5 py-1.5 rounded-xl border border-red-700/80 font-semibold transition shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 sm:top-24 left-1/2 transform -translate-x-1/2 pointer-events-auto bg-emerald-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-2xl font-medium text-xs sm:text-sm flex items-center space-x-2 animate-bounce max-w-[90vw] truncate z-50">
          <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Mobile-Friendly Compact Tool Selector Pill (Bottom-Center on mobile) */}
      {appMode === 'renovation' && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 bg-slate-950/95 border border-slate-800 px-2.5 py-1.5 rounded-full shadow-2xl backdrop-blur-md z-40 sm:hidden max-w-[65vw]">
          <button
            onClick={() => cycleTool('prev')}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-300 font-bold flex items-center justify-center border border-slate-700 text-[10px] shrink-0"
            title="Previous Tool"
          >
            ◄
          </button>
          
          <button
            onClick={() => {
              if (equippedTool === 'furniture') setCatalogOpen(true);
              else if (equippedTool === 'paint_roller' || equippedTool === 'flooring' || equippedTool === 'wall_builder') setPaintMenuOpen(true);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/60 rounded-full text-emerald-300 font-semibold text-[11px] truncate max-w-[130px] active:scale-95 transition"
          >
            {tools.find((t) => t.id === equippedTool)?.icon}
            <span className="truncate">{tools.find((t) => t.id === equippedTool)?.label}</span>
          </button>

          <button
            onClick={() => cycleTool('next')}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-300 font-bold flex items-center justify-center border border-slate-700 text-[10px] shrink-0"
            title="Next Tool"
          >
            ►
          </button>
        </div>
      )}

      {/* Desktop Toolbelt Dock (Bottom-Center on sm+ screens) */}
      {appMode === 'renovation' && (
        <footer className="pointer-events-auto relative z-50 hidden sm:flex justify-center w-full">
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl max-w-[96vw] overflow-x-auto no-scrollbar touch-pan-x flex-nowrap">
            {tools.map((t) => {
              const isEquipped = equippedTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleToolClick(t.id)}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    handleToolClick(t.id);
                  }}
                  className={`relative flex flex-col items-center justify-center min-w-[44px] w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl font-medium transition duration-200 shrink-0 ${isEquipped
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-500 text-white shadow-lg scale-105 border border-emerald-400'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200'
                    }`}
                  title={t.label}
                >
                  {t.icon}
                  <span className="text-[9px] sm:text-[10px] mt-0.5 font-bold opacity-80">{t.key}</span>
                </button>
              );
            })}
          </div>
        </footer>
      )}

      {/* Furniture Catalog Modal */}
      {isCatalogOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Armchair className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
                <h2 className="text-sm sm:text-xl font-bold text-white truncate">Furniture & Catalog</h2>
              </div>
              <button
                onClick={() => setCatalogOpen(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 overflow-y-auto">
              {FURNITURE_CATALOG.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedFurniture(item);
                    setEquippedTool('furniture');
                    setCatalogOpen(false);
                  }}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition flex flex-col justify-between ${selectedFurniture?.id === item.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                >
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {item.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-white mt-0.5">{item.name}</h3>
                  </div>
                  <div className="mt-2 sm:mt-4 flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                      FREE
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">
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
        <div className="pointer-events-auto fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
                <h2 className="text-sm sm:text-xl font-bold text-white truncate">Materials & Paint</h2>
              </div>
              <button
                onClick={() => setPaintMenuOpen(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
              {/* Paint Colors */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-2">Paint Colors</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {PAINT_COLORS.map((paint) => (
                    <button
                      key={paint.id}
                      onClick={() => {
                        setSelectedPaintColor(paint);
                        setEquippedTool('paint_roller');
                        setPaintMenuOpen(false);
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl border flex items-center space-x-2 sm:space-x-3 text-left transition ${selectedPaintColor.id === paint.id
                          ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/40'
                          : 'bg-slate-800/40 border-slate-700'
                        }`}
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/20 shadow shrink-0" style={{ backgroundColor: paint.hex }} />
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-semibold text-white truncate">{paint.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flooring Materials */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-2">Flooring Materials</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {FLOORING_MATERIALS.map((floor) => (
                    <button
                      key={floor.id}
                      onClick={() => {
                        setSelectedFlooring(floor);
                        setEquippedTool('flooring');
                        setPaintMenuOpen(false);
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition ${selectedFlooring.id === floor.id
                          ? 'bg-slate-800 border-emerald-500'
                          : 'bg-slate-800/40 border-slate-700'
                        }`}
                    >
                      <div className="text-[11px] sm:text-xs font-semibold text-white">{floor.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wall Block Presets */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-2">Wall Builder Presets</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {WALL_BLOCK_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedWallBlock(preset);
                        setEquippedTool('wall_builder');
                        setPaintMenuOpen(false);
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition ${selectedWallBlock.id === preset.id
                          ? 'bg-slate-800 border-emerald-500'
                          : 'bg-slate-800/40 border-slate-700'
                        }`}
                    >
                      <div className="text-[11px] sm:text-xs font-semibold text-white">{preset.name}</div>
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
