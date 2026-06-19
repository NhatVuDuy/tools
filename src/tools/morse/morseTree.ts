// Morse code binary tree: left = dot, right = dash
export interface MorseNode {
  char: string | null;
  dot: MorseNode | null;
  dash: MorseNode | null;
  id: string; // unique path like ".-" or "root"
}

function buildTree(): MorseNode {
  const root: MorseNode = { char: null, dot: null, dash: null, id: "root" };

  const codes: [string, string][] = [
    ["E", "."],
    ["T", "-"],
    ["I", ".."],
    ["A", ".-"],
    ["N", "-."],
    ["M", "--"],
    ["S", "..."],
    ["U", "..-"],
    ["R", ".-."],
    ["W", ".--"],
    ["D", "-.."],
    ["K", "-.−"], // fix below
    ["G", "--."],
    ["O", "---"],
    ["H", "...."],
    ["V", "...-"],
    ["F", "..-."],
    ["L", ".-.."],
    ["P", ".--."],
    ["J", ".---"],
    ["B", "-..."],
    ["X", "-..-"],
    ["C", "-.-."],
    ["Y", "-.--"],
    ["Z", "--.."],
    ["Q", "--.-"],
  ];

  // Fix K
  const fixed: [string, string][] = [
    ["E", "."],
    ["T", "-"],
    ["I", ".."],
    ["A", ".-"],
    ["N", "-."],
    ["M", "--"],
    ["S", "..."],
    ["U", "..-"],
    ["R", ".-."],
    ["W", ".--"],
    ["D", "-.."],
    ["K", "-.-"],
    ["G", "--."],
    ["O", "---"],
    ["H", "...."],
    ["V", "...-"],
    ["F", "..-."],
    ["L", ".-.."],
    ["P", ".--."],
    ["J", ".---"],
    ["B", "-..."],
    ["X", "-..-"],
    ["C", "-.-."],
    ["Y", "-.--"],
    ["Z", "--.."],
    ["Q", "--.-"],
  ];

  for (const [char, code] of fixed) {
    let node = root;
    for (let i = 0; i < code.length; i++) {
      const sym = code[i];
      const pathSoFar = code.slice(0, i + 1);
      if (sym === ".") {
        if (!node.dot) node.dot = { char: null, dot: null, dash: null, id: pathSoFar };
        node = node.dot;
      } else {
        if (!node.dash) node.dash = { char: null, dot: null, dash: null, id: pathSoFar };
        node = node.dash;
      }
    }
    node.char = char;
  }

  return root;
}

export const morseTree = buildTree();

export function getNodeByPath(path: string): MorseNode | null {
  let node = morseTree;
  for (const sym of path) {
    if (sym === ".") {
      if (!node.dot) return null;
      node = node.dot;
    } else if (sym === "-") {
      if (!node.dash) return null;
      node = node.dash;
    }
  }
  return node;
}

// Collect all nodes with their positions for rendering
export interface NodeInfo {
  node: MorseNode;
  path: string;
  depth: number;
  indexAtDepth: number;
  totalAtDepth: number;
}

export function collectAllNodes(): NodeInfo[] {
  const result: NodeInfo[] = [];
  const depthCounts: Map<number, number> = new Map();

  function countAtDepth(n: MorseNode, d: number) {
    if (d > 0) {
      depthCounts.set(d, (depthCounts.get(d) || 0) + 1);
    }
    if (n.dot) countAtDepth(n.dot, d + 1);
    if (n.dash) countAtDepth(n.dash, d + 1);
  }
  countAtDepth(morseTree, 0);

  const depthIndex: Map<number, number> = new Map();

  function traverse(n: MorseNode, d: number, path: string) {
    if (d > 0) {
      const idx = depthIndex.get(d) || 0;
      depthIndex.set(d, idx + 1);
      result.push({
        node: n,
        path,
        depth: d,
        indexAtDepth: idx,
        totalAtDepth: depthCounts.get(d) || 1,
      });
    }
    if (n.dot) traverse(n.dot, d + 1, path + ".");
    if (n.dash) traverse(n.dash, d + 1, path + "-");
  }
  traverse(morseTree, 0, "");

  return result;
}
