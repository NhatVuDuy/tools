"use client";
import React, { useEffect, useMemo, useState } from "react";
import { morseTree, MorseNode } from "./morseTree";
import { getAllPaths, getDefaultPositions, loadPositions, PositionMap, SVG_W, SVG_H } from "./nodeLayout";

interface Props {
  currentPath: string;
  antennaFlash: boolean;
}

const ROOT_X = SVG_W / 2;
const ROOT_Y = 30;

// Node visual sizes by depth
const NODE_R = [0, 17, 15, 13, 10] as const;
const RECT_W = [0, 32, 28, 24, 20] as const;
const RECT_H = [0, 20, 18, 15, 13] as const;
const FONT   = [0, 14, 13, 11, 10] as const;

interface LayoutNode {
  path: string;
  char: string | null;
  isDash: boolean;
}

function buildNodes(): LayoutNode[] {
  const nodes: LayoutNode[] = [];
  function traverse(node: MorseNode, path: string) {
    if (path) nodes.push({ path, char: node.char, isDash: path.at(-1) === "-" });
    if (node.dot)  traverse(node.dot,  path + ".");
    if (node.dash) traverse(node.dash, path + "-");
  }
  traverse(morseTree, "");
  return nodes;
}

type NodeState = "inactive" | "onPath" | "endpoint";
function nodeState(path: string, cur: string): NodeState {
  if (!cur) return "inactive";
  if (path === cur) return "endpoint";
  if (cur.startsWith(path)) return "onPath";
  return "inactive";
}

interface Style { fill: string; stroke: string; sw: number; text: string; glow: boolean }
function styleFor(s: NodeState, isDash: boolean): Style {
  if (s === "inactive")
    return { fill: "#0f172a", stroke: "#94a3b8", sw: 1.5, text: "#e2e8f0", glow: false };
  if (s === "endpoint")
    return isDash
      ? { fill: "#1a0000", stroke: "#ef4444", sw: 2.5, text: "#fff", glow: true }
      : { fill: "#001a00", stroke: "#22c55e", sw: 2.5, text: "#fff", glow: true };
  return isDash
    ? { fill: "#1a0800", stroke: "#f97316", sw: 2, text: "#fff", glow: true }
    : { fill: "#000e2a", stroke: "#60a5fa", sw: 2, text: "#fff", glow: true };
}

const staticNodes = buildNodes();

export default function MorseTree({ currentPath, antennaFlash }: Props) {
  const [positions, setPositions] = useState<PositionMap>(getDefaultPositions);

  useEffect(() => {
    setPositions(loadPositions());
    const onStorage = () => setPositions(loadPositions());
    window.addEventListener("storage", onStorage);
    // Also listen to custom event fired by editor on same tab
    window.addEventListener("morse-layout-saved", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("morse-layout-saved", onStorage);
    };
  }, []);

  const allPaths = useMemo(() => getAllPaths(), []);

  const pos = (path: string) => positions[path] ?? { x: SVG_W / 2, y: SVG_H / 2 };

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full rounded-xl bg-gray-950 border border-gray-800"
      style={{ fontFamily: "monospace" }}
    >
      <defs>
        <filter id="mt-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges — always dim */}
      {allPaths.filter(p => p !== "").map(path => {
        const { x: x2, y: y2 } = pos(path);
        const { x: x1, y: y1 } = pos(path.slice(0, -1));
        return <line key={`e${path}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e293b" strokeWidth={1} />;
      })}

      {/* Antenna root */}
      {(() => {
        const { x, y } = pos("");
        return (
          <g>
            <line x1={x}    y1={y - 22} x2={x - 11} y2={y - 8}  stroke="#4b5563" strokeWidth={1.5} />
            <line x1={x}    y1={y - 22} x2={x + 11} y2={y - 8}  stroke="#4b5563" strokeWidth={1.5} />
            <line x1={x-11} y1={y - 8}  x2={x + 11} y2={y - 8}  stroke="#4b5563" strokeWidth={1} />
            <line x1={x-7}  y1={y - 14} x2={x + 7}  y2={y - 14} stroke="#4b5563" strokeWidth={1} />
            <circle cx={x} cy={y} r={10}
              fill={antennaFlash ? "#fbbf24" : "#0f172a"}
              stroke={antennaFlash ? "#fde68a" : "#374151"}
              strokeWidth={2}
              style={{ transition: "fill 0.1s" }}
            />
          </g>
        );
      })()}

      {/* Nodes */}
      {staticNodes.map(({ path, char, isDash }) => {
        const d = path.length as 1 | 2 | 3 | 4;
        const s = styleFor(nodeState(path, currentPath), isDash);
        const { x, y } = pos(path);
        const fs = FONT[d];
        return (
          <g key={path} filter={s.glow ? "url(#mt-glow)" : undefined}>
            {isDash ? (
              <rect
                x={x - RECT_W[d] / 2} y={y - RECT_H[d] / 2}
                width={RECT_W[d]} height={RECT_H[d]} rx={4}
                fill={s.fill} stroke={s.stroke} strokeWidth={s.sw}
              />
            ) : (
              <circle cx={x} cy={y} r={NODE_R[d]} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
            )}
            {char && (
              <text x={x} y={y + fs * 0.38}
                textAnchor="middle" fontSize={fs} fontWeight="bold" fill={s.text}
                style={{ pointerEvents: "none" }}>
                {char}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
