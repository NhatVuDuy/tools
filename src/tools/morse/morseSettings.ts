export interface MorseSettings {
  dotMaxMs: number;      // press < this → dot; ≥ this → dash
  autoCommitMs: number;  // idle after press-end → auto-commit current char
  spaceHoldMs: number;   // hold this long → insert word space
}

export const DEFAULT_SETTINGS: MorseSettings = {
  dotMaxMs: 300,
  autoCommitMs: 1000,
  spaceHoldMs: 2000,
};

const SETTINGS_KEY = "morse-settings-v1";

export function loadSettings(): MorseSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: MorseSettings): void {
  if (typeof window !== "undefined")
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
