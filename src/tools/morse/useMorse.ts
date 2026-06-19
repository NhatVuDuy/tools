"use client";
import { useCallback, useRef, useState } from "react";
import { getNodeByPath } from "./morseTree";

export type SignalType = "dot" | "dash";

export interface MorseState {
  currentPath: string;
  builtString: string;
  lastSignal: SignalType | null;
  isPressed: boolean;
  antennaFlash: boolean;
}

const DOT_MAX_MS     = 300;
const AUTO_COMMIT_MS = 1000;

export function useMorse() {
  const [state, setState] = useState<MorseState>({
    currentPath: "", builtString: "", lastSignal: null, isPressed: false, antennaFlash: false,
  });

  const pressStartRef    = useRef<number | null>(null);
  const holdTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const antennaTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCommitRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoCommit = useCallback(() => {
    if (autoCommitRef.current) { clearTimeout(autoCommitRef.current); autoCommitRef.current = null; }
  }, []);

  const scheduleAutoCommit = useCallback(() => {
    clearAutoCommit();
    autoCommitRef.current = setTimeout(() => {
      setState(s => {
        if (!s.currentPath) return s;
        const node = getNodeByPath(s.currentPath);
        if (node?.char)
          return { ...s, builtString: s.builtString + node.char, currentPath: "", lastSignal: null };
        return { ...s, currentPath: "", lastSignal: null };
      });
    }, AUTO_COMMIT_MS);
  }, [clearAutoCommit]);

  const flashAntenna = useCallback(() => {
    setState(s => ({ ...s, antennaFlash: true }));
    if (antennaTimerRef.current) clearTimeout(antennaTimerRef.current);
    antennaTimerRef.current = setTimeout(() => setState(s => ({ ...s, antennaFlash: false })), 200);
  }, []);

  const onPressStart = useCallback(() => {
    clearAutoCommit();
    pressStartRef.current = Date.now();
    setState(s => ({ ...s, isPressed: true }));
    flashAntenna();
    holdTimerRef.current = setTimeout(() => {
      clearAutoCommit();
      setState(s => ({ ...s, currentPath: "", lastSignal: null, isPressed: false }));
      pressStartRef.current = null;
    }, 3000);
  }, [clearAutoCommit, flashAntenna]);

  const onPressEnd = useCallback(() => {
    if (pressStartRef.current === null) return;
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }

    const duration = Date.now() - pressStartRef.current;
    pressStartRef.current = null;
    const sym = duration < DOT_MAX_MS ? "." : "-";
    const signal: SignalType = sym === "." ? "dot" : "dash";

    setState(s => {
      const newPath = s.currentPath + sym;
      const node = getNodeByPath(newPath);
      if (!node) return { ...s, isPressed: false, lastSignal: signal };
      return { ...s, currentPath: newPath, lastSignal: signal, isPressed: false };
    });

    scheduleAutoCommit();
  }, [scheduleAutoCommit]);

  const reset = useCallback(() => {
    clearAutoCommit();
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setState(s => ({ ...s, currentPath: "", lastSignal: null, isPressed: false }));
  }, [clearAutoCommit]);

  const clearString = useCallback(() => {
    clearAutoCommit();
    setState(s => ({ ...s, builtString: "", currentPath: "", lastSignal: null }));
  }, [clearAutoCommit]);

  // Remove last dot/dash from current input path
  const backspace = useCallback(() => {
    clearAutoCommit();
    setState(s => {
      if (!s.currentPath) return s;
      return { ...s, currentPath: s.currentPath.slice(0, -1), lastSignal: null };
    });
    scheduleAutoCommit();
  }, [clearAutoCommit, scheduleAutoCommit]);

  return { state, onPressStart, onPressEnd, reset, clearString, backspace };
}
