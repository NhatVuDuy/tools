"use client";
import React, { useMemo } from "react";
import { morseTree, MorseNode } from "./morseTree";

interface Props {
  currentPath: string;
  antennaFlash: boolean;
}

const W = 760;
const H = 345;
const ROOT_X = W / 2;
const ROOT_Y = 30;
// y position per depth level
const LEVEL_Y = [ROOT_Y, 95, 160, 225, 300];
// dash=0 (left), dot=1 (right) → matching image: O-M-T-ant-E-I-S-H left to right
const NODE_R  = [0, 13, 12, 10, 9] as const;
const RECT_W  = [0, 26, 24, 20, 18] as const;
const RECT_H  = [0, 16, 15, 13, 12] as const;
const FONT    = [0, 11, 10,  9,  9] as const;

function getPos(path: string): { x: number; y: number } {
  if (!path) return { x: ROOT_X, y: ROOT_Y };
  const d = path.length;
  let idx = 0;
  for (const c of path) idx = (idx << 1) | (c === "." ? 1 : 0);
  return { x: (idx + 0.5) * W / (1 << d), y: LEVEL_Y[d] };
}

interface LayoutNode {
  path: string;
  char: string | null;
  x: number;
  y: number;
  isDash: boolean;
  px: number; // parent x
  py: number; // parent y
}

function buildLayout(): LayoutNode[] {
  const nodes: LayoutNode[] = [];
  function traverse(node: MorseNode, path: string) {
    if (path) {
      const { x, y } = getPos(path);
      const { x: px, y: py } = getPos(path.slice(0, -1));
      nodes.push({ path, char: node.char, x, y, isDash: path.at(-1) === "-", px, py });
    }
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
function styleFor(state: NodeState, isDash: boolean): Style {
  if (state === "inactive")
    return { fill: "#111827", stroke: "#d1d5db", sw: 1.2, text: "#e5e7eb", glow: false };
  if (state === "endpoint")
    return isDash
      ? { fill: "#7f1d1d", stroke: "#fca5a5", sw: 2.5, text: "#fff", glow: true }
      : { fill: "#14532d", stroke: "#86efac", sw: 2.5, text: "#fff", glow: true };
  return isDash
    ? { fill: "#7c2d12", stroke: "#fb923c", sw: 2, text: "#fff", glow: true }
    : { fill: "#1e3a8a", stroke: "#60a5fa", sw: 2, text: "#fff", glow: true };
}

export default function MorseTree({ currentPath, antennaFlash }: Props) {
  const layout = useMemo(() => buildLayout(), []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-xl bg-gray-950 border border-gray-800"
      style={{ fontFamily: "monospace" }}
    >
      <defs>
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges — always dim */}
      {layout.map(({ path, x, y, px, py }) => (
        <line key={`e${path}`} x1={px} y1={py} x2={x} y2={y} stroke="#1f2937" strokeWidth={1} />
      ))}

      {/* Antenna root */}
      <g>
        <line x1={ROOT_X} y1={ROOT_Y - 22} x2={ROOT_X - 11} y2={ROOT_Y - 6}  stroke="#6b7280" strokeWidth={1.5} />
        <line x1={ROOT_X} y1={ROOT_Y - 22} x2={ROOT_X + 11} y2={ROOT_Y - 6}  stroke="#6b7280" strokeWidth={1.5} />
        <line x1={ROOT_X - 11} y1={ROOT_Y - 6} x2={ROOT_X + 11} y2={ROOT_Y - 6} stroke="#6b7280" strokeWidth={1} />
        <line x1={ROOT_X - 7}  y1={ROOT_Y - 14} x2={ROOT_X + 7} y2={ROOT_Y - 14} stroke="#6b7280" strokeWidth={1} />
        <circle
          cx={ROOT_X} cy={ROOT_Y} r={9}
          fill={antennaFlash ? "#fbbf24" : "#111827"}
          stroke={antennaFlash ? "#fde68a" : "#374151"}
          strokeWidth={2}
          style={{ transition: "fill 0.1s" }}
        />
      </g>

      {/* Nodes */}
      {layout.map(({ path, char, x, y, isDash }) => {
        const d = path.length as 1 | 2 | 3 | 4;
        const s = styleFor(nodeState(path, currentPath), isDash);
        const fs = FONT[d];
        return (
          <g key={path} filter={s.glow ? "url(#glow)" : undefined}>
            {isDash ? (
              <rect
                x={x - RECT_W[d] / 2} y={y - RECT_H[d] / 2}
                width={RECT_W[d]} height={RECT_H[d]} rx={3}
                fill={s.fill} stroke={s.stroke} strokeWidth={s.sw}
              />
            ) : (
              <circle cx={x} cy={y} r={NODE_R[d]} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
            )}
            {char && (
              <text
                x={x} y={y + fs * 0.38}
                textAnchor="middle" fontSize={fs} fontWeight="bold" fill={s.text}
                style={{ pointerEvents: "none" }}
              >
                {char}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
