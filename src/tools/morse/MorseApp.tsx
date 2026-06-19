"use client";
import React, { useEffect } from "react";
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-6 px-4 select-none">
      <h1 className="text-2xl font-bold tracking-widest text-yellow-400 mb-4">MORSE CODE</h1>

      {/* Text display */}
      <div className="w-full max-w-lg mb-3">
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 min-h-[52px] font-mono text-xl tracking-widest text-green-400 break-all">
          {state.builtString || <span className="text-gray-600">...</span>}
        </div>
      </div>

      {/* Current sequence */}
      <div className="mb-3 h-8 flex gap-1 items-center justify-center min-w-[200px]">
        {state.currentPath.split("").map((sym, i) => (
          <span key={i} className={`text-2xl font-bold leading-none ${sym === "-" ? "text-orange-400" : "text-blue-400"}`}>
            {sym}
          </span>
        ))}
        {currentNode?.char && (
          <span className="text-gray-400 ml-2 text-sm">→ {currentNode.char}</span>
        )}
      </div>

      {/* Tree */}
      <div className="w-full max-w-2xl mb-5">
        <MorseTree currentPath={state.currentPath} antennaFlash={state.antennaFlash} />
      </div>

      {/* Touch button */}
      <button
        className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl transition-all duration-75 mb-5
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
        <button
          onClick={clearString}
          className="px-4 py-2 rounded-lg border border-red-800 text-red-400 hover:bg-red-900/40 text-sm font-semibold transition-all"
        >
          Xoá chuỗi
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm font-semibold transition-all"
        >
          Reset (Esc)
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-600">
        Space = bấm · 1s không bấm = tự thêm ký tự · Esc = reset
      </p>
      <a href="./morse/editor"
        className="mt-3 text-xs text-gray-700 hover:text-gray-500 underline underline-offset-2 transition-colors">
        Chỉnh layout node →
      </a>
    </div>
  );
}
