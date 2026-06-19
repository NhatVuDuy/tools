import { morseTree, MorseNode } from "./morseTree";

export const SVG_W   = 760;
export const SVG_H   = 345;
export const SNAP_GRID = 5; // px

export type PositionMap = Record<string, { x: number; y: number }>;

const ROOT_Y  = 30;
const LEVEL_Y = [ROOT_Y, 95, 160, 225, 300] as const;
const STORAGE_KEY = "morse-node-positions-v1";

function binaryTreePos(path: string): { x: number; y: number } {
  if (!path) return { x: SVG_W / 2, y: ROOT_Y };
  const d = path.length;
  let idx = 0;
  for (const c of path) idx = (idx << 1) | (c === "." ? 1 : 0);
  return { x: (idx + 0.5) * SVG_W / (1 << d), y: LEVEL_Y[d] };
}

function collectPaths(node: MorseNode, path: string, out: string[]) {
  out.push(path);
  if (node.dot)  collectPaths(node.dot,  path + ".", out);
  if (node.dash) collectPaths(node.dash, path + "-", out);
}

export function getAllPaths(): string[] {
  const paths: string[] = [];
  collectPaths(morseTree, "", paths);
  return paths;
}

export function getDefaultPositions(): PositionMap {
  const map: PositionMap = {};
  for (const p of getAllPaths()) map[p] = binaryTreePos(p);
  return map;
}

export function loadPositions(): PositionMap {
  if (typeof window === "undefined") return getDefaultPositions();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...getDefaultPositions(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return getDefaultPositions();
}

export function savePositions(pos: PositionMap): void {
  if (typeof window !== "undefined")
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
}
