"use client";
import { useCallback, useRef, useState } from "react";
import { getNodeByPath } from "./morseTree";

export type SignalType = "dot" | "dash";

export interface MorseState {
  currentPath: string;       // e.g. ".-"
  builtString: string;       // decoded chars so far
  lastSignal: SignalType | null;
  isPressed: boolean;
  antennaFlash: boolean;
}

const DOT_MAX_MS = 300; // press shorter than this = dot

export function useMorse() {
  const [state, setState] = useState<MorseState>({
    currentPath: "",
    builtString: "",
    lastSignal: null,
    isPressed: false,
    antennaFlash: false,
  });

  const pressStartRef = useRef<number | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const antennaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashAntenna = useCallback(() => {
    setState(s => ({ ...s, antennaFlash: true }));
    if (antennaTimerRef.current) clearTimeout(antennaTimerRef.current);
    antennaTimerRef.current = setTimeout(() => {
      setState(s => ({ ...s, antennaFlash: false }));
    }, 200);
  }, []);

  const onPressStart = useCallback(() => {
    pressStartRef.current = Date.now();
    setState(s => ({ ...s, isPressed: true }));
    flashAntenna();

    // 3s hold = reset
    holdTimerRef.current = setTimeout(() => {
      setState(s => ({
        ...s,
        currentPath: "",
        lastSignal: null,
        isPressed: false,
      }));
      pressStartRef.current = null;
    }, 3000);
  }, [flashAntenna]);

  const onPressEnd = useCallback(() => {
    if (pressStartRef.current === null) return;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const duration = Date.now() - pressStartRef.current;
    pressStartRef.current = null;
    const signal: SignalType = duration < DOT_MAX_MS ? "dot" : "dash";
    const sym = signal === "dot" ? "." : "-";

    setState(s => {
      const newPath = s.currentPath + sym;
      const node = getNodeByPath(newPath);
      // If no node exists, stay at current (dead path)
      if (!node) return { ...s, isPressed: false, lastSignal: signal };
      return { ...s, currentPath: newPath, lastSignal: signal, isPressed: false };
    });
  }, []);

  const commitChar = useCallback(() => {
    setState(s => {
      const node = getNodeByPath(s.currentPath);
      if (!node || !node.char) return { ...s, currentPath: "", lastSignal: null };
      return {
        ...s,
        builtString: s.builtString + node.char,
        currentPath: "",
        lastSignal: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setState(s => ({ ...s, currentPath: "", lastSignal: null, isPressed: false }));
  }, []);

  const clearString = useCallback(() => {
    setState(s => ({ ...s, builtString: "", currentPath: "", lastSignal: null }));
  }, []);

  return { state, onPressStart, onPressEnd, commitChar, reset, clearString };
}
