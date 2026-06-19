"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useMorse } from "./useMorse";
import { getNodeByPath } from "./morseTree";
import MorseTree from "./MorseTree";

export default function MorseApp() {
  const { state, onPressStart, onPressEnd, reset, clearString } = useMorse();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) { e.preventDefault(); onPressStart(); }
      if (e.code === "Escape") reset();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); onPressEnd(); }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [onPressStart, onPressEnd, reset]);

  const currentNode = state.currentPath ? getNodeByPath(state.currentPath) : null;

  return (
    <div className="h-svh flex flex-col bg-gray-950 text-white select-none overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-none px-4 pt-4 pb-2 flex flex-col items-center gap-2">
        <h1 className="text-lg font-bold tracking-widest text-yellow-400">MORSE CODE</h1>

        {/* Built string */}
        <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-h-[40px] font-mono text-lg tracking-widest text-green-400 break-all">
          {state.builtString || <span className="text-gray-700">...</span>}
        </div>

        {/* Current path */}
        <div className="h-7 flex gap-1 items-center justify-center">
          {state.currentPath.split("").map((sym, i) => (
            <span key={i} className={`text-xl font-bold leading-none ${sym === "-" ? "text-orange-400" : "text-blue-400"}`}>
              {sym}
            </span>
          ))}
          {currentNode?.char && (
            <span className="text-gray-500 ml-2 text-sm">→ {currentNode.char}</span>
          )}
        </div>
      </div>

      {/* ── Tree — fills available vertical space ── */}
      <div className="flex-1 min-h-0 px-3 flex items-center justify-center">
        <MorseTree currentPath={state.currentPath} antennaFlash={state.antennaFlash} />
      </div>

      {/* ── Footer ── */}
      <div className="flex-none px-4 pt-2 pb-4 flex flex-col items-center gap-3">

        {/* Touch button */}
        <button
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl transition-all duration-75
            ${state.isPressed
              ? "bg-yellow-400 border-yellow-300 scale-95 shadow-[0_0_30px_rgba(250,204,21,0.8)]"
              : "bg-gray-800 border-gray-600 hover:border-gray-500 shadow-[0_0_15px_rgba(250,204,21,0.15)]"
            }`}
          onMouseDown={onPressStart}
          onMouseUp={onPressEnd}
          onMouseLeave={() => state.isPressed && onPressEnd()}
          onTouchStart={(e) => { e.preventDefault(); onPressStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onPressEnd(); }}
        >
          <span className={state.isPressed ? "text-gray-900" : "text-yellow-400"}>〜</span>
        </button>

        {/* Controls */}
        <div className="flex gap-3">
          <button onClick={clearString}
            className="px-3 py-1.5 rounded-lg border border-red-800 text-red-400 hover:bg-red-900/40 text-sm font-semibold transition-all">
            Xoá chuỗi
          </button>
          <button onClick={reset}
            className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm font-semibold transition-all">
            Reset (Esc)
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <p className="text-xs text-gray-700">Space = bấm · 1s = tự thêm · Esc = reset</p>
          <Link href="/morse/editor" className="text-xs text-gray-700 hover:text-gray-500 underline underline-offset-2 transition-colors">
            Layout →
          </Link>
        </div>
      </div>
    </div>
  );
}
