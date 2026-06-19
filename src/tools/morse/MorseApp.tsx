"use client";
import React, { useCallback, useEffect } from "react";
import { useMorse } from "./useMorse";
import { getNodeByPath, morseTree } from "./morseTree";
import MorseTree from "./MorseTree";

export default function MorseApp() {
  const { state, onPressStart, onPressEnd, commitChar, reset, clearString } = useMorse();

  // Space key = commit, Escape = reset
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        onPressStart();
      }
      if (e.code === "Escape") reset();
      if (e.code === "Enter") commitChar();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        onPressEnd();
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onPressStart, onPressEnd, reset, commitChar]);

  const currentNode = state.currentPath ? getNodeByPath(state.currentPath) : null;
  const hasChar = currentNode?.char != null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-6 px-4 select-none">
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-widest text-yellow-400 mb-4">
        MORSE CODE
      </h1>

      {/* Text display */}
      <div className="w-full max-w-lg mb-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 min-h-[52px] font-mono text-xl tracking-widest text-green-400 break-all">
          {state.builtString || <span className="text-gray-600">...</span>}
        </div>
      </div>

      {/* Current path display */}
      <div className="mb-4 flex gap-2 items-center h-8">
        {state.currentPath.split("").map((sym, i) => (
          <span
            key={i}
            className={`text-2xl font-bold ${sym === "-" ? "text-orange-400" : "text-blue-400"}`}
          >
            {sym}
          </span>
        ))}
        {state.currentPath && (
          <span className="text-gray-400 ml-2 text-sm">
            → {currentNode?.char ?? "?"}
          </span>
        )}
      </div>

      {/* Morse tree visualization */}
      <div className="w-full max-w-2xl mb-6">
        <MorseTree
          currentPath={state.currentPath}
          antennaFlash={state.antennaFlash}
          hasChar={hasChar}
        />
      </div>

      {/* Touch button */}
      <div className="flex gap-4 items-center mb-6">
        {/* Main touch button */}
        <button
          className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl transition-all duration-75
            ${state.isPressed
              ? "bg-yellow-400 border-yellow-300 scale-95 shadow-[0_0_30px_rgba(250,204,21,0.8)]"
              : "bg-gray-800 border-gray-600 hover:border-gray-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            }`}
          onMouseDown={onPressStart}
          onMouseUp={onPressEnd}
          onMouseLeave={() => state.isPressed && onPressEnd()}
          onTouchStart={(e) => { e.preventDefault(); onPressStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onPressEnd(); }}
        >
          <span className={state.isPressed ? "text-gray-900" : "text-yellow-400"}>
            〜
          </span>
        </button>

        {/* Commit char button */}
        <button
          onClick={commitChar}
          disabled={!hasChar}
          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all
            ${hasChar
              ? "border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
              : "border-gray-700 text-gray-600 cursor-not-allowed"
            }`}
        >
          + Thêm ký tự
        </button>
      </div>

      {/* Bottom controls */}
      <div className="flex gap-4">
        {/* Clear string */}
        <button
          onClick={clearString}
          className="px-4 py-2 rounded-lg border border-red-800 text-red-400 hover:bg-red-900 text-sm font-semibold transition-all"
        >
          Xoá chuỗi
        </button>

        {/* Reset current sequence */}
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-800 text-sm font-semibold transition-all"
        >
          Reset (Esc)
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="mt-4 text-xs text-gray-600">
        Space = bấm • Enter = thêm ký tự • Esc = reset chuỗi hiện tại
      </p>
    </div>
  );
}
