"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { morseTree, getNodeByPath } from "./morseTree";
import {
  getAllPaths, getDefaultPositions, loadPositions, savePositions,
  PositionMap, SVG_W, SVG_H, SNAP_GRID,
} from "./nodeLayout";

function snap(v: number, g: number) { return Math.round(v / g) * g; }

interface DragState {
  path: string;
  startCX: number; startCY: number;
  origX: number; origY: number;
}

const ALL_PATHS = getAllPaths();
const GRID_MAJOR = 50;

export default function MorseEditor() {
  const [positions, setPositions] = useState<PositionMap>(getDefaultPositions);
  const [drag, setDrag]     = useState<DragState | null>(null);
  const [gridSize, setGridSize] = useState(SNAP_GRID);
  const [saved, setSaved]   = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => { setPositions(loadPositions()); }, []);

  const svgCoords = useCallback((cx: number, cy: number) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: cx * SVG_W / r.width, y: cy * SVG_H / r.height };
  }, []);

  const onNodeDown = useCallback((e: React.PointerEvent, path: string) => {
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = positions[path] ?? getDefaultPositions()[path];
    setDrag({ path, startCX: e.clientX, startCY: e.clientY, origX: p.x, origY: p.y });
    setSaved(false);
  }, [positions]);

  const onSVGMove = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    const dxClient = e.clientX - drag.startCX;
    const dyClient = e.clientY - drag.startCY;
    const { x: dxSVG, y: dySVG } = svgCoords(dxClient, dyClient);
    const newX = Math.max(gridSize, Math.min(SVG_W - gridSize, snap(drag.origX + dxSVG, gridSize)));
    const newY = Math.max(gridSize, Math.min(SVG_H - gridSize, snap(drag.origY + dySVG, gridSize)));
    setPositions(prev => ({ ...prev, [drag.path]: { x: newX, y: newY } }));
  }, [drag, svgCoords, gridSize]);

  const onSVGUp = useCallback(() => setDrag(null), []);

  const handleSubmit = () => {
    savePositions(positions);
    window.dispatchEvent(new Event("morse-layout-saved"));
    setSaved(true);
  };

  const handleReset = () => {
    const d = getDefaultPositions();
    setPositions(d);
    savePositions(d);
    window.dispatchEvent(new Event("morse-layout-saved"));
    setSaved(false);
  };

  // Build grid lines
  const gridLines: React.ReactElement[] = [];
  for (let x = 0; x <= SVG_W; x += gridSize) {
    gridLines.push(
      <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={SVG_H}
        stroke="#1e293b" strokeWidth={x % GRID_MAJOR === 0 ? 0.6 : 0.25} />
    );
  }
  for (let y = 0; y <= SVG_H; y += gridSize) {
    gridLines.push(
      <line key={`gy${y}`} x1={0} y1={y} x2={SVG_W} y2={y}
        stroke="#1e293b" strokeWidth={y % GRID_MAJOR === 0 ? 0.6 : 0.25} />
    );
  }

  const pos = (path: string) => positions[path] ?? { x: SVG_W / 2, y: SVG_H / 2 };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-6 px-4 select-none">
      <h1 className="text-xl font-bold tracking-widest text-yellow-400 mb-1">
        MORSE CODE — Layout Editor
      </h1>
      <p className="text-xs text-gray-500 mb-4">
        Kéo node để đặt lại vị trí · Snap theo grid · Nhấn Submit để lưu
      </p>

      {/* Toolbar */}
      <div className="flex gap-3 items-center mb-4 flex-wrap justify-center">
        <label className="text-xs text-gray-400 flex items-center gap-2">
          Grid
          <select
            value={gridSize}
            onChange={e => setGridSize(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
          >
            <option value={5}>5 px</option>
            <option value={10}>10 px</option>
            <option value={20}>20 px</option>
          </select>
        </label>
        <button onClick={handleReset}
          className="px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 text-xs">
          ↺ Reset mặc định
        </button>
        <button onClick={handleSubmit}
          className="px-4 py-1.5 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 text-sm font-bold">
          ✓ Submit & Lưu
        </button>
        {saved && <span className="text-green-400 text-xs">✓ Đã lưu!</span>}
      </div>

      {/* SVG canvas */}
      <div className="w-full max-w-5xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full rounded-xl bg-gray-950 border border-gray-700"
          style={{ fontFamily: "monospace", touchAction: "none" }}
          onPointerMove={onSVGMove}
          onPointerUp={onSVGUp}
          onPointerLeave={onSVGUp}
        >
          {/* Grid */}
          {gridLines}

          {/* Edges */}
          {ALL_PATHS.filter(p => p !== "").map(path => {
            const { x: x2, y: y2 } = pos(path);
            const { x: x1, y: y1 } = pos(path.slice(0, -1));
            return <line key={`e${path}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#334155" strokeWidth={1} />;
          })}

          {/* Nodes */}
          {ALL_PATHS.map(path => {
            const node = path === "" ? morseTree : getNodeByPath(path);
            if (!node) return null;
            const { x, y } = pos(path);
            const isDragging = drag?.path === path;
            const isRoot = path === "";
            const isDash = path.at(-1) === "-";

            const baseStyle = {
              cursor: isDragging ? "grabbing" : "grab",
            } as React.CSSProperties;

            if (isRoot) {
              return (
                <g key={path} style={baseStyle} onPointerDown={e => onNodeDown(e, path)}>
                  <line x1={x}   y1={y-22} x2={x-11} y2={y-8}  stroke="#6b7280" strokeWidth={1.5} />
                  <line x1={x}   y1={y-22} x2={x+11} y2={y-8}  stroke="#6b7280" strokeWidth={1.5} />
                  <line x1={x-11} y1={y-8} x2={x+11} y2={y-8}  stroke="#6b7280" strokeWidth={1} />
                  <circle cx={x} cy={y} r={13}
                    fill={isDragging ? "#fbbf24" : "#1f2937"}
                    stroke={isDragging ? "#fde68a" : "#6b7280"}
                    strokeWidth={2}
                  />
                  <text x={x} y={y+4} textAnchor="middle" fontSize={9} fill="#9ca3af"
                    style={{ pointerEvents: "none" }}>ANT</text>
                </g>
              );
            }

            const fillDash  = isDragging ? "#c2410c" : "#7c2d12";
            const strokeDash = isDragging ? "#fed7aa" : "#fb923c";
            const fillDot   = isDragging ? "#1d4ed8" : "#1e3a8a";
            const strokeDot = isDragging ? "#bfdbfe" : "#60a5fa";

            return (
              <g key={path} style={baseStyle} onPointerDown={e => onNodeDown(e, path)}>
                {isDash ? (
                  <rect x={x-16} y={y-10} width={32} height={20} rx={5}
                    fill={fillDash} stroke={strokeDash} strokeWidth={isDragging ? 2.5 : 1.5} />
                ) : (
                  <circle cx={x} cy={y} r={14}
                    fill={fillDot} stroke={strokeDot} strokeWidth={isDragging ? 2.5 : 1.5} />
                )}
                {node.char && (
                  <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#f1f5f9"
                    style={{ pointerEvents: "none" }}>
                    {node.char}
                  </text>
                )}
                {/* coordinate tooltip on drag */}
                {isDragging && (
                  <text x={x} y={y - 18} textAnchor="middle" fontSize={8} fill="#fbbf24"
                    style={{ pointerEvents: "none" }}>
                    {Math.round(x)},{Math.round(y)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* JSON output */}
      <div className="w-full max-w-5xl mt-4">
        <p className="text-xs text-gray-500 mb-1">
          JSON toạ độ — gửi cho Claude để hardcode vĩnh viễn vào code:
        </p>
        <textarea
          readOnly
          value={JSON.stringify(positions, null, 2)}
          className="w-full h-36 bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-xs text-gray-400 resize-y"
        />
      </div>
    </div>
  );
}
