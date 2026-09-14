'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRenovationStore } from '../../stores/renovationStore';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Hammer,
  ArrowUp,
  ArrowDown,
  Compass
} from 'lucide-react';

interface TouchPoint {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const MinecraftTouchControls: React.FC = () => {
  const setMobileMove = useRenovationStore((state) => state.setMobileMove);
  const setMobileAnalog = useRenovationStore((state) => state.setMobileAnalog);
  const triggerMobileAction = useRenovationStore((state) => state.triggerMobileAction);
  const mobileMoveState = useRenovationStore((state) => state.mobileMoveState);

  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [joystickActive, setJoystickActive] = useState<boolean>(false);
  const [joystickPos, setJoystickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);

  // Detect if user is on touch screen device
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch || window.innerWidth < 850);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  if (!isTouchDevice) {
    return null;
  }

  // --- JOYSTICK TOUCH HANDLERS ---
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current !== null) return;

    const touch = e.changedTouches[0];
    if (!touch || !joystickBaseRef.current) return;

    joystickTouchIdRef.current = touch.identifier;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    updateJoystickPos(touch.clientX, touch.clientY, centerX, centerY, rect.width / 2);
    setJoystickActive(true);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current === null || !joystickBaseRef.current) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        const rect = joystickBaseRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        updateJoystickPos(touch.clientX, touch.clientY, centerX, centerY, rect.width / 2);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setJoystickActive(false);
        setJoystickPos({ x: 0, y: 0 });
        setMobileAnalog(0, 0);
        break;
      }
    }
  };

  const updateJoystickPos = (
    clientX: number,
    clientY: number,
    centerX: number,
    centerY: number,
    maxRadius: number
  ) => {
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setJoystickPos({ x: dx, y: dy });

    const normX = dx / maxRadius;
    const normY = dy / maxRadius;

    // Analog strafe & forward
    // dy < 0 is forward, dy > 0 is backward
    setMobileAnalog(normX, -normY);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden touch-none">
      {/* --- MINECRAFT LEFT SIDE D-PAD / JOYSTICK ZONE --- */}
      <div className="pointer-events-auto absolute bottom-6 left-6 flex items-center justify-center">
        {/* Analog Joystick Touch Container */}
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className="relative w-36 h-36 rounded-full bg-slate-950/70 border-2 border-emerald-500/50 backdrop-blur-md flex items-center justify-center shadow-2xl active:border-emerald-400"
        >
          {/* Classic Minecraft D-Pad Button Guides (Tactile overlays) */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-1 pointer-events-none opacity-40">
            <div />
            <div className="flex items-center justify-center font-bold text-emerald-400">▲</div>
            <div />
            <div className="flex items-center justify-center font-bold text-emerald-400">◄</div>
            <div className="flex items-center justify-center text-[10px] text-slate-400 font-mono">D-PAD</div>
            <div className="flex items-center justify-center font-bold text-emerald-400">►</div>
            <div />
            <div className="flex items-center justify-center font-bold text-emerald-400">▼</div>
            <div />
          </div>

          {/* Dynamic Joystick Thumb Knob */}
          <div
            className={`w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-white/80 shadow-lg flex items-center justify-center transition-transform duration-75 ${
              joystickActive ? 'scale-110 shadow-emerald-500/50' : ''
            }`}
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
            }}
          >
            <div className="w-5 h-5 rounded-full bg-white/40 border border-white/60" />
          </div>
        </div>
      </div>

      {/* --- MINECRAFT RIGHT SIDE ACTION BUTTONS (Jump, Sneak, Use Tool, Sprint) --- */}
      <div className="pointer-events-auto absolute bottom-6 right-6 flex flex-col items-end gap-3">
        {/* Top Row: Action / Use Tool Button & Sprint Toggle */}
        <div className="flex items-center gap-3">
          {/* Sprint Toggle Button */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              setMobileMove('sprint', !mobileMoveState.sprint);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setMobileMove('sprint', !mobileMoveState.sprint);
            }}
            className={`w-12 h-12 rounded-2xl border flex flex-col items-center justify-center shadow-xl backdrop-blur-md active:scale-95 transition ${
              mobileMoveState.sprint
                ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold shadow-amber-500/40'
                : 'bg-slate-900/80 border-slate-700 text-amber-400 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-5 h-5 fill-current" />
            <span className="text-[8px] font-bold tracking-tighter uppercase mt-0.5">
              {mobileMoveState.sprint ? 'FAST' : 'WALK'}
            </span>
          </button>

          {/* Main Minecraft PE Action / Use Tool Button */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              triggerMobileAction();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              triggerMobileAction();
            }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white font-bold border-2 border-emerald-300 shadow-2xl flex flex-col items-center justify-center space-y-0.5"
          >
            <Hammer className="w-6 h-6 text-white" />
            <span className="text-[9px] font-black tracking-wide text-emerald-100 uppercase">ACTION</span>
          </button>
        </div>

        {/* Bottom Row: Minecraft PE Elevation / Jump & Sneak Buttons */}
        <div className="flex items-center gap-2">
          {/* Fly Down / Sneak Button */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              setMobileMove('down', true);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              setMobileMove('down', false);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setMobileMove('down', true);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              setMobileMove('down', false);
            }}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/90 border border-slate-700 active:bg-emerald-600 text-slate-200 font-bold flex flex-col items-center justify-center shadow-lg backdrop-blur-md"
          >
            <ArrowDown className="w-5 h-5 text-emerald-400" />
            <span className="text-[8px] text-slate-400 font-mono">DOWN</span>
          </button>

          {/* Jump / Fly Up Button */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              setMobileMove('up', true);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              setMobileMove('up', false);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setMobileMove('up', true);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              setMobileMove('up', false);
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/90 border border-slate-700 active:bg-emerald-600 text-slate-200 font-bold flex flex-col items-center justify-center shadow-lg backdrop-blur-md"
          >
            <ArrowUp className="w-6 h-6 text-emerald-400" />
            <span className="text-[9px] text-emerald-300 font-bold font-mono">JUMP / UP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
