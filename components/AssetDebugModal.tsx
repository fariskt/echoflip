'use client';

import React, { useState, useEffect } from 'react';
import { PRELOADED_ASSETS } from '../game/core/assetRegistry';
import {
  getNormalizedMetadataCache,
  setTargetDimensionOverride,
  getTargetDimensions,
  SPECIFIC_ASSET_TARGETS,
  CATEGORY_TARGET_DIMENSIONS
} from '../game/utils/modelNormalizer';
import type { AssetNormalizedMetadata, FurnitureCategory } from '../types/renovation';

interface AssetDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetDebugModal: React.FC<AssetDebugModalProps> = ({ isOpen, onClose }) => {
  const [cachedList, setCachedList] = useState<AssetNormalizedMetadata[]>([]);
  const [selectedAssetPath, setSelectedAssetPath] = useState<string>('');
  const [customWidth, setCustomWidth] = useState<number>(1.0);
  const [customHeight, setCustomHeight] = useState<number>(1.0);
  const [customDepth, setCustomDepth] = useState<number>(1.0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cache = getNormalizedMetadataCache();
      const list = Array.from(cache.values());
      setCachedList(list);

      if (list.length > 0 && !selectedAssetPath) {
        setSelectedAssetPath(list[0].modelPath);
        setCustomWidth(list[0].targetDimensions.width);
        setCustomHeight(list[0].targetDimensions.height);
        setCustomDepth(list[0].targetDimensions.depth);
      }
    }
  }, [isOpen, selectedAssetPath]);

  if (!isOpen) return null;

  const handleSelectAsset = (item: AssetNormalizedMetadata) => {
    setSelectedAssetPath(item.modelPath);
    setCustomWidth(item.targetDimensions.width);
    setCustomHeight(item.targetDimensions.height);
    setCustomDepth(item.targetDimensions.depth);
  };

  const handleApplyOverride = () => {
    if (!selectedAssetPath) return;

    setTargetDimensionOverride(selectedAssetPath, {
      width: customWidth,
      height: customHeight,
      depth: customDepth
    });

    setToastMsg(`Updated target size to ${customWidth}m x ${customHeight}m x ${customDepth}m. Spawn model to re-normalize.`);

    setTimeout(() => {
      setToastMsg(null);
      const cache = getNormalizedMetadataCache();
      setCachedList(Array.from(cache.values()));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📏</span>
            <div>
              <h2 className="text-lg font-bold text-emerald-400">3D Asset Size & Normalization Inspector</h2>
              <p className="text-xs text-slate-400">View dynamic bounding boxes, target dimensions, uniform scaling factor & floor offsets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold"
          >
            ✕ Close
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Quick Override Controls */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Manual Target Dimension Override Tool</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Width (X, m)</label>
                <input
                  type="number"
                  step="0.05"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Target Height (Y, m)</label>
                <input
                  type="number"
                  step="0.05"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Target Depth (Z, m)</label>
                <input
                  type="number"
                  step="0.05"
                  value={customDepth}
                  onChange={(e) => setCustomDepth(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleApplyOverride}
                  disabled={!selectedAssetPath}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-all"
                >
                  Apply Override
                </button>
              </div>
            </div>
            {toastMsg && <div className="text-xs text-emerald-400 font-medium">{toastMsg}</div>}
          </div>

          {/* Table of Discovered & Normalized Assets */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-300">
              <span>Discovered & Measured Assets ({PRELOADED_ASSETS.filter(a => !!a.url).length} total models)</span>
              <span className="text-emerald-400 font-mono">{cachedList.length} Rendered & Normalized</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-2.5 px-3">Asset Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Model URL</th>
                    <th className="py-2.5 px-3">Original Size (W x H x D)</th>
                    <th className="py-2.5 px-3">Target Size</th>
                    <th className="py-2.5 px-3">Scale Factor</th>
                    <th className="py-2.5 px-3">Floor Offset</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {PRELOADED_ASSETS.filter(a => !!a.url).map((asset) => {
                    const cached = cachedList.find((c) => c.modelPath === asset.url);
                    const isSelected = selectedAssetPath === asset.url;
                    const catTarget = getTargetDimensions(asset.category || 'seating', asset.url, asset.name);

                    return (
                      <tr
                        key={asset.name}
                        onClick={() => cached && handleSelectAsset(cached)}
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-950/40 text-emerald-200' : 'text-slate-300'
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold text-white">{asset.name}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {asset.category || 'general'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400 max-w-[150px] truncate" title={asset.url}>
                          {asset.url}
                        </td>
                        <td className="py-2 px-3 text-amber-300">
                          {cached ? (
                            `${cached.originalDimensions.width.toFixed(2)}m × ${cached.originalDimensions.height.toFixed(2)}m × ${cached.originalDimensions.depth.toFixed(2)}m`
                          ) : (
                            <span className="text-slate-500 italic font-sans">Pending spawn...</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-sky-300">
                          {`${catTarget.width.toFixed(2)}m × ${catTarget.height.toFixed(2)}m × ${catTarget.depth.toFixed(2)}m`}
                        </td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">
                          {cached ? `${cached.normalizedScale.toFixed(3)}x` : '-'}
                        </td>
                        <td className="py-2 px-3 text-violet-300">
                          {cached ? `${cached.floorOffset.toFixed(3)}m` : '-'}
                        </td>
                        <td className="py-2 px-3">
                          {cached ? (
                            <span className="text-emerald-400 font-sans text-[10px] font-semibold flex items-center gap-1">
                              <span>✓</span> Normalized
                            </span>
                          ) : (
                            <span className="text-slate-500 font-sans text-[10px]">Registered</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <span>✨ Automatic THREE.Box3 Bounding Normalizer Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
