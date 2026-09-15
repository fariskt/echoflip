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
  Map,
  ChevronDown,
  ChevronUp,
  Move,
  RotateCw
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
  const [isTopBarOpen, setIsTopBarOpen] = React.useState<boolean>(true);
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

  const moveSelectedObject = useRenovationStore((state) => state.moveSelectedObject);
  const duplicateSelectedObject = useRenovationStore((state) => state.duplicateSelectedObject);
  const deleteSelectedObject = useRenovationStore((state) => state.deleteSelectedObject);
  const transformGizmoMode = useRenovationStore((state) => state.transformGizmoMode);
  const setTransformGizmoMode = useRenovationStore((state) => state.setTransformGizmoMode);

  const selectedPlacedFurniture = activeProperty?.furniture.find((f) => f.id === selectedPlacedFurnitureId);
  const selectedPlacedWall = activeProperty?.walls.find((w) => w.id === selectedPlacedWallId);
  const selectedPlacedBlock = activeProperty?.roomBlocks?.find((b) => b.id === selectedPlacedBlockId);

  const hasSelectedObject = !!(selectedPlacedFurniture || selectedPlacedWall || selectedPlacedBlock);
  const selectedObjectName = selectedPlacedFurniture?.name || (selectedPlacedWall ? `Wall Block (${selectedPlacedWall.blockType || 'Drywall'})` : (selectedPlacedBlock ? `Room Block (${selectedPlacedBlock.name || selectedPlacedBlock.type})` : null));

  React.useEffect(() => {
    if (hasSelectedObject) {
      setIsRightPanelOpen(true);
    }
  }, [hasSelectedObject]);

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
      <header
        className={`pointer-events-auto transition-all duration-300 z-40 ${
          isTopBarOpen
            ? 'bg-white/95 text-slate-800 shadow-sm border-b border-slate-200 px-3 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 backdrop-blur-md'
            : 'bg-transparent border-none shadow-none p-2.5 flex items-center justify-start'
        }`}
      >
        {/* Left Brand Logo - Clickable to toggle top bar on all devices (PC & Mobile) */}
        <div className="flex items-center justify-between sm:justify-start">
          <button
            type="button"
            onClick={() => setIsTopBarOpen((prev) => !prev)}
            className={`flex items-center space-x-2 cursor-pointer focus:outline-none select-none group text-left transition-all ${
              !isTopBarOpen
                ? 'bg-white/95 hover:bg-white text-slate-900 px-3 py-1.5 rounded-full border border-slate-200/90 shadow-lg backdrop-blur-md'
                : ''
            }`}
            title="Click logo to toggle top toolbar"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-sm text-white shadow-md group-hover:scale-105 transition-transform">
              EF
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">ECHOFlIP</span>
            {/* Smooth UI Toggle Switch */}
            <div className="flex items-center ml-2">
              <div
                className={`relative w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                  isTopBarOpen ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    isTopBarOpen ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </button>
        </div>

        {/* Action Controls & Mode Switchers (toggled on all devices by clicking logo) */}
        {isTopBarOpen && (
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 border-t border-slate-100 sm:border-t-0 pt-2 sm:pt-0 transition-all">
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
                <span>Inspector</span>
              </button>

              {/* Working Furniture Catalog Modal Trigger */}
              <button
                onClick={() => setCatalogOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow font-semibold text-xs transition"
                title="Furniture Catalog & Gallery"
              >
                <Image className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </button>
            </div>

            {/* Right Working Mode Switcher */}
            <div className="flex items-center space-x-2">
              {/* Toggle 2D Schematic Map Button */}
              <button
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition ${isRightPanelOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                title="Toggle 2D Drone Schematic Map & Inspector"
              >
                <Map className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">2D Map</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEnterLandscapeFullscreen}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 font-bold text-xs border border-slate-300 transition"
                  title="Toggle Fullscreen Landscape View"
                >
                  <Maximize className="w-3.5 h-3.5 text-blue-600" />
                  <span className='hidden sm:inline'>Fullscreen ⛶</span>
                </button>
              </div>

              <button
                onClick={() => setAppMode(appMode === 'renovation' ? 'editor' : 'renovation')}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>{appMode === 'editor' ? 'Game View' : '3D Studio'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Top Floating Action Prompt Banner (Mobile & Desktop) */}
      <div className={`pointer-events-auto fixed ${isTopBarOpen ? 'top-28 sm:top-14' : 'top-3.5'} left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2 bg-slate-900/90 text-white px-4 py-1.5 rounded-full border border-slate-700/80 shadow-2xl text-xs font-semibold backdrop-blur-md max-w-[92vw] truncate transition-all duration-300`}>
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
        {/* RIGHT PROPERTY & FLOOR INSPECTOR PANEL / BLENDER 3D OBJECT INSPECTOR */}
        {/* ----------------------------------------------------------------------- */}
        <div className="pointer-events-auto flex h-full z-30">
          {isRightPanelOpen && (
            <div className="w-80 max-w-[85vw] bg-white/95 border-l border-slate-200 shadow-xl backdrop-blur-md flex flex-col justify-between overflow-y-auto p-4 text-slate-800 transition-all">
              {hasSelectedObject ? (
                /* ======================================================================= */
                /* BLENDER 3D OBJECT INSPECTOR (Replaces 2D Map when object is selected)  */
                /* ======================================================================= */
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
                        {selectedPlacedFurniture ? '🛋️' : selectedPlacedWall ? '🧱' : '📦'}
                      </div>
                      <div className="truncate max-w-[170px]">
                        <span className="text-[10px] uppercase font-extrabold text-blue-600 tracking-wider">Blender 3D Inspector</span>
                        <h3 className="text-sm font-bold text-slate-900 truncate">{selectedObjectName}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPlacedFurnitureId(null);
                        setSelectedPlacedWallId(null);
                        setSelectedPlacedBlockId(null);
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
                      title="Deselect (ESC)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Blender Transform Mode Switcher */}
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => setTransformGizmoMode('translate')}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition ${
                        transformGizmoMode === 'translate' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Move className="w-3.5 h-3.5" />
                      <span>Move (G)</span>
                    </button>
                    <button
                      onClick={() => setTransformGizmoMode('rotate')}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition ${
                        transformGizmoMode === 'rotate' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate (R)</span>
                    </button>
                  </div>

                  {/* Visual Axis Arrow Controls for Move */}
                  {transformGizmoMode === 'translate' && (
                    <div className="space-y-3 border-t border-slate-200 pt-3">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Visual Axis Move Hints</h4>

                      {/* X Axis Red */}
                      <div className="bg-red-50/80 border border-red-200 rounded-2xl p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-red-700">
                          <span className="flex items-center space-x-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                            <span>X Axis (Side ↔)</span>
                          </span>
                          <span className="font-mono text-[11px]">Red Arrow</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <button onClick={() => moveSelectedObject(-0.5, 0, 0)} className="py-1 rounded bg-white hover:bg-red-100 border border-red-200 text-red-800 font-bold text-xs shadow-sm">
                            ◄ -0.5m Left
                          </button>
                          <button onClick={() => moveSelectedObject(0.5, 0, 0)} className="py-1 rounded bg-white hover:bg-red-100 border border-red-200 text-red-800 font-bold text-xs shadow-sm">
                            +0.5m Right ►
                          </button>
                          <button onClick={() => moveSelectedObject(-0.1, 0, 0)} className="py-1 rounded bg-white hover:bg-red-100 border border-red-200 text-red-800 font-semibold text-[11px]">
                            ◄ -0.1m
                          </button>
                          <button onClick={() => moveSelectedObject(0.1, 0, 0)} className="py-1 rounded bg-white hover:bg-red-100 border border-red-200 text-red-800 font-semibold text-[11px]">
                            +0.1m ►
                          </button>
                        </div>
                      </div>

                      {/* Y Axis Green */}
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                          <span className="flex items-center space-x-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                            <span>Y Axis (Height ↕)</span>
                          </span>
                          <span className="font-mono text-[11px]">Green Arrow</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <button onClick={() => moveSelectedObject(0, 0.5, 0)} className="py-1 rounded bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs shadow-sm">
                            ▲ +0.5m Up
                          </button>
                          <button onClick={() => moveSelectedObject(0, -0.5, 0)} className="py-1 rounded bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs shadow-sm">
                            -0.5m Down ▼
                          </button>
                          <button onClick={() => moveSelectedObject(0, 0.1, 0)} className="py-1 rounded bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
                            ▲ +0.1m
                          </button>
                          <button onClick={() => moveSelectedObject(0, -0.1, 0)} className="py-1 rounded bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
                            -0.1m ▼
                          </button>
                        </div>
                      </div>

                      {/* Z Axis Blue */}
                      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-blue-700">
                          <span className="flex items-center space-x-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                            <span>Z Axis (Depth ⤢)</span>
                          </span>
                          <span className="font-mono text-[11px]">Blue Arrow</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <button onClick={() => moveSelectedObject(0, 0, -0.5)} className="py-1 rounded bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs shadow-sm">
                            ⇱ -0.5m Fwd
                          </button>
                          <button onClick={() => moveSelectedObject(0, 0, 0.5)} className="py-1 rounded bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs shadow-sm">
                            +0.5m Back ⇲
                          </button>
                          <button onClick={() => moveSelectedObject(0, 0, -0.1)} className="py-1 rounded bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 font-semibold text-[11px]">
                            ⇱ -0.1m
                          </button>
                          <button onClick={() => moveSelectedObject(0, 0, 0.1)} className="py-1 rounded bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 font-semibold text-[11px]">
                            +0.1m ⇲
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Rotation Arc Controls */}
                  {transformGizmoMode === 'rotate' && (
                    <div className="space-y-3 border-t border-slate-200 pt-3">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Visual Rotation Controls</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 text-[11px] mb-1 block">Yaw Y-Axis (Horizontal Turn)</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button onClick={() => rotatePlacementYaw(-45)} className="py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border">↺ -45°</button>
                            <button onClick={() => rotatePlacementYaw(45)} className="py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border">+45° ↻</button>
                            <button onClick={() => rotatePlacementYaw(-90)} className="py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border">↺ -90°</button>
                            <button onClick={() => rotatePlacementYaw(90)} className="py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border">+90° ↻</button>
                          </div>
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 text-[11px] mb-1 block">Pitch X-Axis (Tilt Up/Down)</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button onClick={() => tiltPlacementPitch(-15)} className="py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border">↶ -15° Pitch</button>
                            <button onClick={() => tiltPlacementPitch(15)} className="py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border">+15° Pitch ↷</button>
                          </div>
                        </div>
                        <button onClick={resetPlacementRotation} className="w-full py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-amber-600 font-extrabold text-xs border border-amber-300">
                          Reset Rotation to [0°, 0°, 0°]
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Footer */}
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <button
                      onClick={() => duplicateSelectedObject()}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Duplicate Object</span>
                    </button>
                    <button
                      onClick={() => deleteSelectedObject()}
                      className="w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete / Demolish</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ======================================================================= */
                /* DEFAULT 2D SCHEMATIC MAP & HOUSE PARAMETERS (When no object selected)   */
                /* ======================================================================= */
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
                </div>
              )}
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
