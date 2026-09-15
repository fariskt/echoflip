'use client';

import React, { useState } from 'react';
import {
  useRenovationStore
} from '../stores/renovationStore';
import {
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Box,
  Armchair,
  Check,
  Compass,
  Zap
} from 'lucide-react';

interface SchematicMapProps {
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const SchematicMap: React.FC<SchematicMapProps> = ({
  isModal = false,
  onCloseModal
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isModal);
  const [showBlueprintTargets, setShowBlueprintTargets] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const activeProperty = useRenovationStore((state) => state.activeProperty);
  const activeContract = useRenovationStore((state) => state.activeContract);

  if (!activeProperty) return null;

  // Base 60m x 60m Plot Dimensions
  const minX = -30;
  const maxX = 30;
  const minZ = -30;
  const maxZ = 30;

  const toPxX = (x: number) => ((x - minX) / (maxX - minX)) * 100;
  const toPxZ = (z: number) => ((z - minZ) / (maxZ - minZ)) * 100;

  // Real-time Construction Progress Metrics
  const totalWalls = (activeProperty.walls || []).filter((w) => !w.isDemolished).length;
  const totalRoomBlocks = (activeProperty.roomBlocks || []).length;
  const totalFurniture = (activeProperty.furniture || []).length;

  const dirtStains = activeProperty.dirtStains || [];
  const unclearedStains = dirtStains.filter((s) => s.clearedRatio < 1.0).length;
  const clearedStains = dirtStains.length - unclearedStains;

  const fixtures = activeProperty.fixtures || [];
  const brokenFixtures = fixtures.filter((f) => f.isBroken).length;

  // Contract progress percentage
  let progressPercent = 100;
  if (activeContract && activeContract.tasks.length > 0) {
    const totalTarget = activeContract.tasks.reduce((sum, t) => sum + (t.targetCount || 1), 0);
    const totalCurrent = activeContract.tasks.reduce((sum, t) => sum + Math.min(t.targetCount || 1, t.currentCount || 0), 0);
    progressPercent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 100;
  }

  // Contract Target Blueprint Locations (Reference Plan)
  const targetBlueprints = [
    { name: 'Living Room Zone', bounds: { minX: -10, maxX: 10, minZ: -10, maxZ: 10 }, color: '#38bdf8' },
    { name: 'Bedroom Zone', bounds: { minX: 10, maxX: 25, minZ: 5, maxZ: 25 }, color: '#a78bfa' },
    { name: 'Kitchen Zone', bounds: { minX: -25, maxX: -10, minZ: 5, maxZ: 25 }, color: '#f59e0b' }
  ];

  return (
    <div
      className={`relative flex flex-col bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans select-none transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 sm:inset-10 z-50 bg-slate-950/98 backdrop-blur-xl border-blue-500/50' : 'w-full h-full'
      }`}
    >
      {/* Schematic Map Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <h3 className="text-xs font-bold text-white tracking-wide">
            Schematic Map
          </h3>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowBlueprintTargets(!showBlueprintTargets)}
            className={`text-[10px] px-2 py-0.5 rounded font-bold border transition ${
              showBlueprintTargets
                ? 'bg-blue-950 text-blue-300 border-blue-500/80'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Original Base Reference Plan"
          >
            Base Plan
          </button>

          <button
            onClick={() => {
              if (isModal && onCloseModal) {
                onCloseModal();
              } else {
                setIsExpanded(!isExpanded);
              }
            }}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title={isExpanded ? 'Minimize Map' : 'Expand Drone View'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 2D Drone Schematic Canvas (SVG Blueprint) */}
      <div className="relative flex-1 bg-[#091322] overflow-hidden min-h-[160px] flex items-center justify-center p-2">
        {/* Background Grid Pattern */}
        {showGrid && (
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-60" />
        )}

        <svg className="w-full h-full max-h-[100%]" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.3" />
            </pattern>
            <pattern id="blueprint-hatch" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#38bdf8" strokeWidth="0.3" opacity="0.3" />
            </pattern>
          </defs>

          {/* 60m x 60m Base Plot Perimeter Border */}
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="url(#grid-pattern)"
            stroke="#3b82f6"
            strokeWidth="0.8"
            strokeDasharray="2 1"
          />

          {/* 1. ORIGINAL BASE PLAN / REFERENCE BLUEPRINT LAYOUT (GHOSTED DASHED) */}
          {showBlueprintTargets &&
            targetBlueprints.map((bp, idx) => {
              const x1 = toPxX(bp.bounds.minX);
              const x2 = toPxX(bp.bounds.maxX);
              const z1 = toPxZ(bp.bounds.minZ);
              const z2 = toPxZ(bp.bounds.maxZ);
              const w = Math.max(2, x2 - x1);
              const h = Math.max(2, z2 - z1);

              return (
                <rect
                  key={idx}
                  x={x1}
                  y={z1}
                  width={w}
                  height={h}
                  fill={bp.color}
                  fillOpacity="0.08"
                  stroke={bp.color}
                  strokeWidth="0.5"
                  strokeDasharray="1.5 1"
                />
              );
            })}

          {/* 2. REAL-TIME PLACED ROOM BLOCKS */}
          {(activeProperty.roomBlocks || []).map((blk) => {
            const x1 = toPxX(Math.min(blk.start[0], blk.end[0]));
            const x2 = toPxX(Math.max(blk.start[0], blk.end[0]));
            const z1 = toPxZ(Math.min(blk.start[2], blk.end[2]));
            const z2 = toPxZ(Math.max(blk.start[2], blk.end[2]));
            const w = Math.max(1, x2 - x1);
            const h = Math.max(1, z2 - z1);

            return (
              <rect
                key={blk.id}
                x={x1}
                y={z1}
                width={w}
                height={h}
                fill={blk.color || '#38bdf8'}
                fillOpacity="0.25"
                stroke={blk.color || '#38bdf8'}
                strokeWidth="0.7"
              />
            );
          })}

          {/* 3. REAL-TIME PLACED WALLS */}
          {(activeProperty.walls || []).map((wall) => {
            if (wall.isDemolished) return null;
            const x1 = toPxX(wall.startPoint[0]);
            const z1 = toPxZ(wall.startPoint[2]);
            const x2 = toPxX(wall.endPoint[0]);
            const z2 = toPxZ(wall.endPoint[2]);

            return (
              <line
                key={wall.id}
                x1={x1}
                y1={z1}
                x2={x2}
                y2={z2}
                stroke={wall.color || '#cbd5e1'}
                strokeWidth="2.0"
                strokeLinecap="round"
              />
            );
          })}

          {/* 4. REAL-TIME PLACED FURNITURE OBJECTS */}
          {(activeProperty.furniture || []).map((item) => {
            const cx = toPxX(item.position[0]);
            const cz = toPxZ(item.position[2]);
            const rotY = item.rotation ? item.rotation[1] : 0;

            return (
              <g key={item.id} transform={`rotate(${rotY}, ${cx}, ${cz})`}>
                <rect
                  x={cx - 2}
                  y={cz - 2}
                  width="4"
                  height="4"
                  rx="0.8"
                  fill="#06b6d4"
                  fillOpacity="0.7"
                  stroke="#38bdf8"
                  strokeWidth="0.4"
                />
                <circle cx={cx} cy={cz} r="0.8" fill="#ffffff" />
              </g>
            );
          })}

          {/* 5. REAL-TIME DIRT STAINS (Fades as cleared) */}
          {dirtStains.map((stain) => {
            if (stain.clearedRatio >= 1.0) return null;
            const sx = toPxX(stain.position[0]);
            const sz = toPxZ(stain.position[2]);
            const opacity = (1.0 - stain.clearedRatio) * 0.8;

            return (
              <circle
                key={stain.id}
                cx={sx}
                cy={sz}
                r="1.8"
                fill={stain.type === 'graffiti' ? '#ef4444' : '#b45309'}
                fillOpacity={opacity}
              />
            );
          })}

          {/* 6. FIXTURES */}
          {fixtures.map((fx) => {
            const fxX = toPxX(fx.position[0]);
            const fxZ = toPxZ(fx.position[2]);

            return (
              <circle
                key={fx.id}
                cx={fxX}
                cy={fxZ}
                r="1.2"
                fill={fx.isBroken ? '#ef4444' : '#eab308'}
                stroke="#ffffff"
                strokeWidth="0.3"
              />
            );
          })}

          {/* North Direction Indicator Arrow */}
          <g transform="translate(8, 8)">
            <circle cx="0" cy="0" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.5" />
            <path d="M 0 -2 L 1.5 1 L -1.5 1 Z" fill="#38bdf8" />
          </g>
        </svg>

        {/* Live Construction Legend / Summary Badge */}
        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 backdrop-blur-md flex items-center justify-between text-[10px] text-slate-300">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1 font-semibold text-sky-400">
              <Box className="w-3 h-3" /> {totalWalls} Walls
            </span>
            <span className="flex items-center gap-1 font-semibold text-cyan-400">
              <Armchair className="w-3 h-3" /> {totalFurniture} Furniture
            </span>
          </div>

          <div className="flex items-center space-x-1 font-mono font-bold text-emerald-400">
            <span>{progressPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
