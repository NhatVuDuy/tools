import { morseTree, MorseNode } from "./morseTree";

// Coordinate space for the full editor canvas
export const SVG_W    = 650;
export const SVG_H    = 380;
export const SNAP_GRID = 5;

// ViewBox used in the main tree view — cropped tightly to content + padding
export const TREE_VIEWBOX = "225 5 400 380";

export type PositionMap = Record<string, { x: number; y: number }>;

const STORAGE_KEY = "morse-node-positions-v1";

// Hardcoded positions from user layout
const HARDCODED: PositionMap = {
  "":      { x: 400, y: 30  },
  ".":     { x: 450, y: 50  },
  "..":    { x: 500, y: 50  },
  "...":   { x: 550, y: 50  },
  "....":  { x: 600, y: 50  },
  "...-":  { x: 550, y: 100 },
  "..-":   { x: 500, y: 100 },
  "..-." : { x: 500, y: 150 },
  ".-":    { x: 450, y: 200 },
  ".-.":   { x: 500, y: 200 },
  ".-..":  { x: 550, y: 200 },
  ".--":   { x: 450, y: 300 },
  ".--." : { x: 500, y: 300 },
  ".---":  { x: 450, y: 350 },
  "-":     { x: 350, y: 50  },
  "-.":    { x: 350, y: 200 },
  "-..":   { x: 350, y: 300 },
  "-...":  { x: 350, y: 350 },
  "-..-":  { x: 300, y: 300 },
  "-.-":   { x: 300, y: 200 },
  "-.-.":  { x: 300, y: 250 },
  "-.--":  { x: 250, y: 200 },
  "--":    { x: 300, y: 50  },
  "--.":   { x: 300, y: 100 },
  "--..":  { x: 300, y: 150 },
  "--.-":  { x: 250, y: 100 },
  "---":   { x: 250, y: 50  },
};

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
  // Build binary-tree fallback, then overlay hardcoded values
  const ROOT_Y  = 30;
  const LEVEL_Y = [ROOT_Y, 95, 160, 225, 300] as const;
  const fallback: PositionMap = {};
  for (const p of getAllPaths()) {
    if (!p) { fallback[p] = { x: SVG_W / 2, y: ROOT_Y }; continue; }
    const d = p.length;
    let idx = 0;
    for (const c of p) idx = (idx << 1) | (c === "." ? 1 : 0);
    fallback[p] = { x: (idx + 0.5) * SVG_W / (1 << d), y: LEVEL_Y[d] };
  }
  return { ...fallback, ...HARDCODED };
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
