"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getNodeByPath } from "./morseTree";
import { loadSettings } from "./morseSettings";

export type SignalType = "dot" | "dash";

export interface MorseState {
  currentPath: string;
  builtString: string;
  lastSignal: SignalType | null;
  isPressed: boolean;
  antennaFlash: boolean;
}

export function useMorse() {
  const [state, setState] = useState<MorseState>({
    currentPath: "", builtString: "", lastSignal: null, isPressed: false, antennaFlash: false,
  });

  const settingsRef     = useRef(loadSettings());
  const pressStartRef   = useRef<number | null>(null);
  const holdTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const antennaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCommitRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    settingsRef.current = loadSettings();
    const update = () => { settingsRef.current = loadSettings(); };
    window.addEventListener("storage", update);
    window.addEventListener("morse-settings-saved", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("morse-settings-saved", update);
    };
  }, []);

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
    }, settingsRef.current.autoCommitMs);
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
    // Hold spaceHoldMs → commit pending char + insert word space
    holdTimerRef.current = setTimeout(() => {
      clearAutoCommit();
      setState(s => {
        let built = s.builtString;
        if (s.currentPath) {
          const node = getNodeByPath(s.currentPath);
          if (node?.char) built += node.char;
        }
        return { ...s, builtString: built + " ", currentPath: "", lastSignal: null, isPressed: false };
      });
      pressStartRef.current = null;
    }, settingsRef.current.spaceHoldMs);
  }, [clearAutoCommit, flashAntenna]);

  const onPressEnd = useCallback(() => {
    if (pressStartRef.current === null) return;
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }

    const duration = Date.now() - pressStartRef.current;
    pressStartRef.current = null;
    const sym = duration < settingsRef.current.dotMaxMs ? "." : "-";
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
