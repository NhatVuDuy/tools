"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useMorse } from "./useMorse";
import { getNodeByPath } from "./morseTree";
import MorseTree from "./MorseTree";

function BroadcastIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <path d="M8.5 8.5 a5 5 0 0 0 0 7" />
      <path d="M15.5 8.5 a5 5 0 0 1 0 7" />
      <path d="M5 5 a9.9 9.9 0 0 0 0 14" />
      <path d="M19 5 a9.9 9.9 0 0 1 0 14" />
    </svg>
  );
}


export default function MorseApp() {
  const { state, onPressStart, onPressEnd, reset, clearString, deleteLastChar } = useMorse();

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
      <div className="flex-none px-4 pt-3 pb-1 flex flex-col items-center gap-1.5">
        {/* String — single line, horizontal scroll */}
        <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 font-mono text-lg text-green-400 overflow-x-auto whitespace-nowrap scrollbar-none">
          {state.builtString || <span className="text-gray-700">...</span>}
        </div>

        {/* Current path */}
        <div className="h-6 flex gap-0.5 items-center justify-center">
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

      {/* ── Tree ── */}
      <div className="flex-1 min-h-0 px-2 flex items-center justify-center">
        <MorseTree currentPath={state.currentPath} antennaFlash={state.antennaFlash} />
      </div>

      {/* ── Footer ── */}
      <div className="flex-none px-4 pt-1 pb-3 flex flex-col gap-2">

        {/* Button row: [Reset] ←  [◉]  → [⌫] */}
        <div className="flex items-center justify-between">
          <button onClick={clearString}
            className="px-3 py-1.5 rounded-lg border border-red-800 text-red-400 hover:bg-red-900/40 text-sm font-semibold transition-all">
            Làm lại
          </button>

          {/* Touch button */}
          <button
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-75
              ${state.isPressed
                ? "bg-yellow-400 border-yellow-300 scale-95 text-gray-900 shadow-[0_0_20px_rgba(250,204,21,0.8)]"
                : "bg-gray-800 border-gray-600 hover:border-gray-500 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.15)]"
              }`}
            onMouseDown={onPressStart}
            onMouseUp={onPressEnd}
            onMouseLeave={() => state.isPressed && onPressEnd()}
            onTouchStart={(e) => { e.preventDefault(); onPressStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); onPressEnd(); }}
          >
            <BroadcastIcon />
          </button>

          <button onClick={deleteLastChar}
            className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm font-semibold transition-all">
            Xoá
          </button>
        </div>

        {/* Hint text */}
        <div className="text-xs text-gray-700 text-center">Space = bấm · 1s = tự thêm · Esc = reset</div>

        {/* CTA row */}
        <div>
          <Link href="/morse/editor"
            className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors">
            Layout →
          </Link>
        </div>
      </div>
    </div>
  );
}
