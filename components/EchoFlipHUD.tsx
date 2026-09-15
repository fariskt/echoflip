'use client';

import React from 'react';
import {
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
  X,
  Edit3,
  Palette,
  Maximize,
  Smartphone,
  Wrench,
  Image,
  DoorOpen,
  AppWindow,
  Map
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
import { AssetDebugModal } from './AssetDebugModal';
import { SchematicMap } from './SchematicMap';

export const EchoFlipHUD: React.FC = () => {
  const [isAssetDebugOpen, setIsAssetDebugOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'draw' | 'finish' | 'furniture' | 'doors'>('draw');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = React.useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 850;
    }
    return false;
  });

  const appMode = useRenovationStore((state) => state.appMode);
  const setAppMode = useRenovationStore((state) => state.setAppMode);
  const equippedTool = useRenovationStore((state) => state.equippedTool);
  const setEquippedTool = useRenovationStore((state) => state.setEquippedTool);

  const activeProperty = useRenovationStore((state) => state.activeProperty);
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

  const undo = useRenovationStore((state) => state.undo);
  const redo = useRenovationStore((state) => state.redo);
  const undoStack = useRenovationStore((state) => state.undoStack);
  const redoStack = useRenovationStore((state) => state.redoStack);

  const rotatePlacementYaw = useRenovationStore((state) => state.rotatePlacementYaw);
  const tiltPlacementPitch = useRenovationStore((state) => state.tiltPlacementPitch);
  const rollPlacementRoll = useRenovationStore((state) => state.rollPlacementRoll);
  const resetPlacementRotation = useRenovationStore((state) => state.resetPlacementRotation);

  const isCatalogOpen = useRenovationStore((state) => state.isCatalogOpen);
  const setCatalogOpen = useRenovationStore((state) => state.setCatalogOpen);

  const isPaintMenuOpen = useRenovationStore((state) => state.isPaintMenuOpen);
  const setPaintMenuOpen = useRenovationStore((state) => state.setPaintMenuOpen);

  const roomBlockStartPoint = useRenovationStore((state) => state.roomBlockStartPoint);
  const setRoomBlockStartPoint = useRenovationStore((state) => state.setRoomBlockStartPoint);

  const toastMessage = useRenovationStore((state) => state.toastMessage);
  const gridSnapEnabled = useRenovationStore((state) => state.gridSnapEnabled);
  const gridSnapSize = useRenovationStore((state) => state.gridSnapSize);
  const toggleGridSnap = useRenovationStore((state) => state.toggleGridSnap);
  const setGridSnapSize = useRenovationStore((state) => state.setGridSnapSize);

  const [isPortrait, setIsPortrait] = React.useState<boolean>(false);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = React.useState<string>('all');

  const handleEnterLandscapeFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch { }

    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch { }
  };

  React.useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 850;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
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
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [equippedTool, selectedFurniture, selectedPlacedFurnitureId, selectedPlacedWallId, selectedPlacedBlockId, setEquippedTool, setSelectedFurniture, setSelectedPlacedFurnitureId, setSelectedPlacedWallId, setSelectedPlacedBlockId, undo, redo]);

  const handleToolClick = (toolId: RenovationTool) => {
    setEquippedTool(toolId);
    if (toolId === 'furniture') {
      setCatalogOpen(true);
    } else if (toolId === 'paint_roller' || toolId === 'flooring' || toolId === 'wall_builder') {
      setPaintMenuOpen(true);
    }
    if (window.innerWidth < 850) {
      setIsLeftPanelOpen(false);
    }
  };

  const getToolActionPrompt = () => {
    switch (equippedTool) {
      case 'inspect':
        return 'Tap object to inspect details';
      case 'paint_roller':
        return `Tap wall to paint with ${selectedPaintColor.name}`;
      case 'flooring':
        return `Tap floor to install ${selectedFlooring.name}`;
      case 'hammer':
        return 'Tap wall block to demolish';
      case 'wall_builder':
        return `Aim crosshair & tap ACTION / Left-Click to place ${selectedWallBlock.name}`;
      case 'room_builder':
        return roomBlockStartPoint
          ? '🎯 Corner 1 set! Aim to resize & tap ACTION / Left-Click to finish'
          : 'Aim crosshair at floor & tap ACTION / Left-Click to set 1st Corner!';
      case 'furniture':
        return selectedFurniture
          ? `Tap floor to place ${selectedFurniture.name}`
          : 'Select item from catalog';
      default:
        return 'Tap to interact';
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* Minecraft Center Crosshair Reticle Target Pointer */}
      <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_rgba(0,0,0,0.9)]" />
          <div className="absolute w-3.5 h-[1.5px] bg-white/80 shadow-sm" />
          <div className="absolute h-3.5 w-[1.5px] bg-white/80 shadow-sm" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CLEAN TOP HEADER TOOLBAR */}
      {/* ========================================================================= */}
      <header className="pointer-events-auto bg-white/95 text-slate-800 shadow-sm border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-2 backdrop-blur-md z-40">
        {/* Left Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-sm text-white shadow-md">
              EF
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">ECHOFlIP</span>
              <span className="text-[10px] text-blue-600 font-bold ml-1 uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Studio</span>
            </div>
          </div>
        </div>

        {/* Center Working Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => undo()}
            disabled={undoStack.length === 0}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-semibold text-xs transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5 text-slate-600" />
            <span>Undo</span>
          </button>
          <button
            onClick={() => redo()}
            disabled={redoStack.length === 0}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-semibold text-xs transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5 text-slate-600" />
            <span>Redo</span>
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />

          {/* Working 3D Inspector Modal Trigger */}
          <button
            onClick={() => setIsAssetDebugOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-semibold text-xs transition"
            title="3D Asset Normalizer Inspector"
          >
            <Wrench className="w-3.5 h-3.5 text-sky-600" />
            <span>3D Asset Inspector</span>
          </button>

          {/* Working Furniture Catalog Modal Trigger */}
          <button
            onClick={() => setCatalogOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow font-semibold text-xs transition"
            title="Furniture Catalog & Gallery"
          >
            <Image className="w-3.5 h-3.5" />
            <span>Furniture Gallery</span>
          </button>
        </div>

        {/* Right Working Mode Switcher */}
        <div className="flex items-center space-x-2">
          {/* Toggle 2D Schematic Map Button */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition ${
              isRightPanelOpen
                ? 'bg-blue-600 text-white border-blue-600 shadow'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Toggle 2D Drone Schematic Map & Inspector"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2D Map</span>
          </button>

          <button
            onClick={() => setAppMode(appMode === 'renovation' ? 'editor' : 'renovation')}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>{appMode === 'editor' ? 'Game View' : '3D Studio'}</span>
          </button>
        </div>
      </header>

      {/* Top Floating Action Prompt Banner (Mobile & Desktop) */}
      <div className="pointer-events-auto fixed top-14 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2 bg-slate-900/90 text-white px-4 py-1.5 rounded-full border border-slate-700/80 shadow-2xl text-xs font-semibold backdrop-blur-md max-w-[92vw] truncate">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="truncate">{getToolActionPrompt()}</span>
        {roomBlockStartPoint && (
          <button
            onClick={() => setRoomBlockStartPoint(null)}
            className="ml-2 px-2 py-0.5 rounded bg-red-500/80 hover:bg-red-600 text-[10px] font-bold text-white shrink-0 shadow"
          >
            Cancel [ESC]
          </button>
        )}
      </div>

      {/* Mobile Portrait Landscape Overlay */}
      {isPortrait && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-2xl animate-pulse">
            <Smartphone className="w-8 h-8 text-white rotate-90" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Rotate to Landscape Mode</h2>
          <p className="text-xs text-slate-300 max-w-xs mb-6 leading-relaxed">
            EchoFlip ECHOFlIP 3D Editor requires landscape mode for full architectural controls.
          </p>
          <button
            onClick={handleEnterLandscapeFullscreen}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition"
          >
            <Maximize className="w-4 h-4" />
            <span>Enter Fullscreen Landscape ⛶</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (LEFT TOOL PANEL + CENTER VIEWPORT + RIGHT INSPECTOR) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex justify-between pointer-events-none relative overflow-hidden">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT TOOLBOX / SIDEBAR PANEL */}
        {/* ----------------------------------------------------------------------- */}
        <div className="pointer-events-auto flex h-full z-30">
          {/* Vertical Icon Rail */}
          <div className="w-12 bg-white border-r border-slate-200 shadow-sm flex flex-col justify-between items-center py-3 text-slate-600">
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => { setActiveTab('draw'); setIsLeftPanelOpen(true); }}
                className={`p-2 rounded-xl transition ${activeTab === 'draw' && isLeftPanelOpen ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200' : 'hover:bg-slate-100'}`}
                title="Floor Plan & Building Tools"
              >
                <Box className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setActiveTab('doors'); setIsLeftPanelOpen(true); }}
                className={`p-2 rounded-xl transition ${activeTab === 'doors' && isLeftPanelOpen ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200' : 'hover:bg-slate-100'}`}
                title="Doors & Windows"
              >
                <DoorOpen className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setActiveTab('furniture'); setIsLeftPanelOpen(true); setCatalogOpen(true); }}
                className={`p-2 rounded-xl transition ${activeTab === 'furniture' && isLeftPanelOpen ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200' : 'hover:bg-slate-100'}`}
                title="Furniture & Decor Library"
              >
                <Armchair className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setActiveTab('finish'); setIsLeftPanelOpen(true); setPaintMenuOpen(true); }}
                className={`p-2 rounded-xl transition ${activeTab === 'finish' && isLeftPanelOpen ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200' : 'hover:bg-slate-100'}`}
                title="Finishes, Paint & Flooring"
              >
                <Palette className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={handleEnterLandscapeFullscreen}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
                title="Toggle Fullscreen Landscape View"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expandable Left Drawer Panel */}
          {isLeftPanelOpen && (
            <div className="w-64 bg-white/95 border-r border-slate-200 shadow-xl backdrop-blur-md flex flex-col justify-between overflow-y-auto p-4 text-slate-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">Floor plan</h2>
                  <button onClick={() => setIsLeftPanelOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Working Architectural Draw Tools */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Draw room</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleToolClick('wall_builder')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition ${equippedTool === 'wall_builder' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                    >
                      <SquarePlus className="w-6 h-6 text-slate-700 mb-1" />
                      <span className="text-xs font-medium">Straight wall (B)</span>
                    </button>
                    <button
                      onClick={() => handleToolClick('room_builder')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition ${equippedTool === 'room_builder' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                    >
                      <Box className="w-6 h-6 text-slate-700 mb-1" />
                      <span className="text-xs font-medium">Wall Side (F)</span>
                    </button>
                    <button
                      onClick={() => handleToolClick('hammer')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition ${equippedTool === 'hammer' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                    >
                      <Hammer className="w-6 h-6 text-slate-700 mb-1" />
                      <span className="text-xs font-medium">Demolish</span>
                    </button>
                  </div>
                </div>

                {/* Place Doors and Windows Category */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Place doors and windows</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setCatalogOpen(true); setSelectedCatalogCategory('doors'); }}
                      className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 hover:bg-slate-100 flex flex-col items-center text-center"
                    >
                      <DoorOpen className="w-5 h-5 text-slate-700 mb-1" />
                      <span className="text-[11px] font-medium text-slate-700">Door Catalog</span>
                    </button>
                    <button
                      onClick={() => { setCatalogOpen(true); setSelectedCatalogCategory('windows'); }}
                      className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 hover:bg-slate-100 flex flex-col items-center text-center"
                    >
                      <AppWindow className="w-5 h-5 text-slate-700 mb-1" />
                      <span className="text-[11px] font-medium text-slate-700">Window Catalog</span>
                    </button>
                  </div>
                </div>

                {/* Working Catalog & Finishes Shortcuts */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catalog & Finishes</h3>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setPaintMenuOpen(true)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-between border border-blue-200 transition"
                    >
                      <span>🎨 Paint & Wall Finishes</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => setCatalogOpen(true)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-between border border-indigo-200 transition"
                    >
                      <span>🛋️ Furniture Catalog</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Action Prompt Reticle */}
        {appMode === 'renovation' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-20">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-900/80 bg-white/90 shadow-lg" />
            <div className="mt-3 bg-white/95 backdrop-blur-md border border-slate-300 text-slate-800 text-xs px-3.5 py-1.5 rounded-full shadow-lg font-bold text-center truncate">
              {getToolActionPrompt()}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PROPERTY & FLOOR INSPECTOR PANEL */}
        {/* ----------------------------------------------------------------------- */}
        <div className="pointer-events-auto flex h-full z-30">
          {isRightPanelOpen && (
            <div className="w-72 max-w-[85vw] bg-white/95 border-l border-slate-200 shadow-xl backdrop-blur-md flex flex-col justify-between overflow-y-auto p-4 text-slate-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center space-x-1.5 font-extrabold text-sm text-slate-900">
                    <Map className="w-4 h-4 text-blue-600" />
                    <span>2D Schematic Map</span>
                  </div>
                  <button onClick={() => setIsRightPanelOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Top Real-Time 2D Drone Schematic Map */}
                <div className="w-full h-52 rounded-2xl overflow-hidden shadow-md border border-slate-300">
                  <SchematicMap />
                </div>

                {/* Working Basic Parameters Section */}
                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Basic Parameters</h3>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Interior area</span>
                    <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">3,600 m²</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                      <span>Room height</span>
                      <span className="font-mono font-bold text-blue-600">{(roomBlockHeight * 1000).toFixed(0)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="6.0"
                      step="0.1"
                      value={roomBlockHeight}
                      onChange={(e) => setRoomBlockHeight(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
                      <span>Slab thickness</span>
                      <span className="font-mono font-bold text-blue-600">{(roomBlockWallThickness * 1000).toFixed(0)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.05"
                      value={roomBlockWallThickness}
                      onChange={(e) => setRoomBlockWallThickness(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Working Grid Snap Controls */}
                <div className="border-t border-slate-200 pt-3 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Grid Controls</h3>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Grid Snap</span>
                    <button
                      onClick={() => toggleGridSnap()}
                      className={`px-2.5 py-1 rounded-lg border font-bold text-xs ${gridSnapEnabled ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-300'}`}
                    >
                      {gridSnapEnabled ? `${gridSnapSize}m` : 'OFF'}
                    </button>
                  </div>

                  {gridSnapEnabled && (
                    <div className="flex items-center space-x-1">
                      {[0.25, 0.5, 1.0].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setGridSnapSize(sz)}
                          className={`flex-1 py-1 rounded border text-xs font-mono font-bold ${gridSnapSize === sz ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                        >
                          {sz}m
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Working Object Rotation & Transforms */}
                {(equippedTool === 'furniture' || equippedTool === 'wall_builder' || selectedFurniture) && (
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Transform</h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button onClick={() => rotatePlacementYaw(45)} className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border">
                        Rotate +45° (R)
                      </button>
                      <button onClick={() => rotatePlacementYaw(90)} className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border">
                        Rotate +90°
                      </button>
                      <button onClick={() => tiltPlacementPitch(45)} className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border">
                        Tilt Pitch (T)
                      </button>
                      <button onClick={() => rollPlacementRoll(45)} className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border">
                        Roll Roll (G)
                      </button>
                    </div>
                    <button onClick={resetPlacementRotation} className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border">
                      Reset Rotation
                    </button>
                  </div>
                )}

                {/* Rect Wall Options Panel */}
                {equippedTool === 'room_builder' && (
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Rect Wall Settings</h3>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">Block Type</label>
                      <div className="grid grid-cols-2 gap-1 text-xs font-semibold">
                        {[
                          { id: 'full_room', label: 'Full Room' },
                          { id: 'empty_room', label: 'Perimeter' },
                          { id: 'wall', label: 'Wall Block' },
                          { id: 'floor', label: 'Floor Slab' },
                          { id: 'foundation', label: 'Foundation' }
                        ].map((typeItem) => (
                          <button
                            key={typeItem.id}
                            onClick={() => setActiveRoomBlockType(typeItem.id as any)}
                            className={`px-2 py-1 rounded border text-[11px] font-bold transition ${activeRoomBlockType === typeItem.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                          >
                            {typeItem.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">Wall Height ({roomBlockHeight}m)</label>
                      <div className="flex items-center space-x-1">
                        {[2.0, 2.8, 3.5, 4.0].map((h) => (
                          <button
                            key={h}
                            onClick={() => setRoomBlockHeight(h)}
                            className={`flex-1 py-1 rounded border text-xs font-mono font-bold ${roomBlockHeight === h ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                          >
                            {h}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Touch Controls for Mobile */}
      <MinecraftTouchControls />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 pointer-events-auto bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs sm:text-sm flex items-center space-x-2 animate-bounce z-50 border border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CLEAN BOTTOM BAR VIEWPORT CONTROLS */}
      {/* ========================================================================= */}
      <footer className="hidden sm:flex pointer-events-auto bg-white/95 text-slate-800 shadow-sm border-t border-slate-200 px-4 py-2 items-center justify-between backdrop-blur-md z-40">
        <div className="flex items-center space-x-2 text-xs text-slate-600 font-semibold">
          <span>60m × 60m Base Plot</span>
        </div>

        {/* Working Fullscreen Landscape Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEnterLandscapeFullscreen}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 font-bold text-xs border border-slate-300 transition"
            title="Toggle Fullscreen Landscape View"
          >
            <Maximize className="w-3.5 h-3.5 text-blue-600" />
            <span>Fullscreen ⛶</span>
          </button>
        </div>
      </footer>

      {/* Working Furniture Catalog Modal */}
      {isCatalogOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Armchair className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-extrabold text-slate-900">ECHOFlIP Furniture Library</h2>
              </div>
              <button onClick={() => setCatalogOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto">
              {['all', 'seating', 'tables', 'beds', 'storage', 'kitchen', 'bathroom', 'doors', 'windows', 'lighting'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCatalogCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-bold uppercase tracking-wider transition ${selectedCatalogCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto">
              {FURNITURE_CATALOG.filter((item) => selectedCatalogCategory === 'all' || item.category === selectedCatalogCategory).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedFurniture(item);
                    setEquippedTool('furniture');
                    setCatalogOpen(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${selectedFurniture?.id === item.id ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'}`}
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">{item.category}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-extrabold">${item.price}</span>
                    <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">Select</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Working Paint & Materials Modal */}
      {isPaintMenuOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Palette className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-extrabold text-slate-900">Wall Paint & Flooring Presets</h2>
              </div>
              <button onClick={() => setPaintMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Paint Colors</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PAINT_COLORS.map((paint) => (
                    <button
                      key={paint.id}
                      onClick={() => {
                        setSelectedPaintColor(paint);
                        setEquippedTool('paint_roller');
                        setPaintMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center space-x-3 text-left transition ${selectedPaintColor.id === paint.id ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="w-6 h-6 rounded-full border border-slate-300 shadow shrink-0" style={{ backgroundColor: paint.hex }} />
                      <span className="text-xs font-bold text-slate-800 truncate">{paint.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Flooring Materials</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FLOORING_MATERIALS.map((floor) => (
                    <button
                      key={floor.id}
                      onClick={() => {
                        setSelectedFlooring(floor);
                        setEquippedTool('flooring');
                        setPaintMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition ${selectedFlooring.id === floor.id ? 'bg-blue-50 border-blue-500 font-bold' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <span className="text-xs font-bold text-slate-800">{floor.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Wall Presets</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WALL_BLOCK_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedWallBlock(preset);
                        setEquippedTool('wall_builder');
                        setPaintMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition ${selectedWallBlock.id === preset.id ? 'bg-blue-50 border-blue-500 font-bold' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <span className="text-xs font-bold text-slate-800">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Inspector Modal */}
      <AssetDebugModal isOpen={isAssetDebugOpen} onClose={() => setIsAssetDebugOpen(false)} />
    </div>
  );
};
