"use client";
import React, { useMemo } from "react";
import { morseTree, MorseNode } from "./morseTree";

interface Props {
  currentPath: string;
  antennaFlash: boolean;
  hasChar: boolean;
}

interface LayoutNode {
  node: MorseNode;
  path: string;
  x: number;
  y: number;
  isDash: boolean; // how we arrived here (true=dash, false=dot)
}

const W = 560;
const H = 380;
const DEPTH_Y = [0, 60, 120, 180, 240, 300];
const ROOT_X = W / 2;
const ROOT_Y = 20;

function buildLayout(): LayoutNode[] {
  const nodes: LayoutNode[] = [];

  function place(
    node: MorseNode,
    path: string,
    depth: number,
    xMin: number,
    xMax: number,
    isDash: boolean
  ) {
    const x = (xMin + xMax) / 2;
    const y = ROOT_Y + DEPTH_Y[depth];
    if (depth > 0) {
      nodes.push({ node, path, x, y, isDash });
    }
    const mid = (xMin + xMax) / 2;
    if (node.dot) place(node.dot, path + ".", depth + 1, xMin, mid, false);
    if (node.dash) place(node.dash, path + "-", depth + 1, mid, xMax, true);
  }

  // Root's dot subtree = left half, dash subtree = right half
  if (morseTree.dot)
    place(morseTree.dot, ".", 1, 0, ROOT_X, false);
  if (morseTree.dash)
    place(morseTree.dash, "-", 1, ROOT_X, W, true);

  return nodes;
}

function buildEdges(layout: LayoutNode[]): { x1: number; y1: number; x2: number; y2: number; path: string }[] {
  const byPath = new Map(layout.map(n => [n.path, n]));
  const edges: { x1: number; y1: number; x2: number; y2: number; path: string }[] = [];

  for (const n of layout) {
    const parentPath = n.path.slice(0, -1);
    const parent = parentPath === "" ? { x: ROOT_X, y: ROOT_Y } : byPath.get(parentPath);
    if (parent) {
      edges.push({ x1: parent.x, y1: parent.y, x2: n.x, y2: n.y, path: n.path });
    }
  }
  return edges;
}

export default function MorseTree({ currentPath, antennaFlash, hasChar }: Props) {
  const layout = useMemo(() => buildLayout(), []);
  const edges = useMemo(() => buildEdges(layout), [layout]);

  function nodeColor(path: string, isDash: boolean, char: string | null) {
    const isActive = currentPath === path;
    const isOnPath = currentPath.startsWith(path) || path.startsWith(currentPath);
    const isInPath = currentPath.startsWith(path);

    if (isActive) {
      // last node in current path
      if (isDash) return "#ef4444"; // red for dash endpoint
      return "#22c55e"; // green for dot endpoint
    }
    if (isInPath) {
      // on the active path but not the end
      if (isDash) return "#f97316"; // orange
      return "#3b82f6"; // blue
    }
    // default
    if (isDash) return "#78350f"; // dark orange
    return "#1e3a5f"; // dark blue
  }

  function nodeStroke(path: string) {
    if (currentPath.startsWith(path)) return "#fbbf24";
    return "#374151";
  }

  function edgeColor(path: string) {
    if (currentPath.startsWith(path)) return "#fbbf24";
    return "#374151";
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-xl bg-gray-900 border border-gray-700"
      style={{ fontFamily: "monospace" }}
    >
      {/* Edges */}
      {edges.map(e => (
        <line
          key={e.path}
          x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke={edgeColor(e.path)}
          strokeWidth={currentPath.startsWith(e.path) ? 2.5 : 1.5}
          strokeOpacity={0.8}
        />
      ))}

      {/* Antenna / root */}
      <g transform={`translate(${ROOT_X}, ${ROOT_Y})`}>
        {/* Antenna shape */}
        <line x1={0} y1={0} x2={-8} y2={-16} stroke="#9ca3af" strokeWidth={2} />
        <line x1={0} y1={0} x2={8} y2={-16} stroke="#9ca3af" strokeWidth={2} />
        <line x1={-8} y1={-16} x2={8} y2={-16} stroke="#9ca3af" strokeWidth={1} />
        <circle
          cx={0} cy={0} r={10}
          fill={antennaFlash ? "#fbbf24" : "#1f2937"}
          stroke={antennaFlash ? "#fde68a" : "#4b5563"}
          strokeWidth={2}
          style={{ transition: "fill 0.1s" }}
        />
      </g>

      {/* Nodes */}
      {layout.map(({ node, path, x, y, isDash }) => {
        const fill = nodeColor(path, isDash, node.char);
        const stroke = nodeStroke(path);
        const isActive = currentPath === path;
        const r = isDash ? 0 : 9; // circle for dot, rect for dash

        return (
          <g key={path} transform={`translate(${x}, ${y})`}>
            {isDash ? (
              <rect
                x={-13} y={-8} width={26} height={16} rx={4}
                fill={fill}
                stroke={stroke}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{ transition: "fill 0.15s" }}
              />
            ) : (
              <circle
                cx={0} cy={0} r={9}
                fill={fill}
                stroke={stroke}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{ transition: "fill 0.15s" }}
              />
            )}
            {node.char && (
              <text
                x={0} y={4}
                textAnchor="middle"
                fontSize={9}
                fontWeight="bold"
                fill={isActive ? "#ffffff" : "#d1d5db"}
              >
                {node.char}
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(8, ${H - 50})`}>
        <rect x={0} y={0} width={16} height={10} rx={2} fill="#f97316" />
        <text x={20} y={9} fontSize={9} fill="#9ca3af">Dash (—)</text>
        <circle cx={8} cy={20} r={5} fill="#3b82f6" />
        <text x={20} y={24} fontSize={9} fill="#9ca3af">Dot (·)</text>
      </g>
    </svg>
  );
}
