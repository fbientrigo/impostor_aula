"use client";

// Drives the role-card's show/hide state. The decision logic lives in the pure
// reducer (src/lib/autohide.ts); this hook only wires it to the DOM:
//  - reveal() when the student chooses to view the card
//  - auto-hide countdown via a 1s tick
//  - immediate hide on tab switch (visibilitychange -> hidden) and window blur,
//    so a projected/peeked card disappears the moment focus leaves.

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  cardVisibilityReducer,
  initialCardVisState,
  type CardVisEvent,
  type CardVisState,
} from "@/lib/autohide";

export function useCardVisibility(autoHideSeconds: number) {
  const opts = useRef({ autoHideSeconds });
  opts.current.autoHideSeconds = autoHideSeconds;

  const [state, dispatch] = useReducer(
    (s: CardVisState, e: CardVisEvent) => cardVisibilityReducer(s, e, opts.current),
    undefined,
    initialCardVisState,
  );

  const reveal = useCallback(() => dispatch({ type: "reveal" }), []);
  const hide = useCallback(() => dispatch({ type: "hide" }), []);

  // Auto-hide countdown.
  useEffect(() => {
    if (!state.visible || state.secondsLeft === null) return;
    const id = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(id);
  }, [state.visible, state.secondsLeft]);

  // Privacy: hide whenever focus leaves the tab/window.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") dispatch({ type: "hide" });
    };
    const onBlur = () => dispatch({ type: "hide" });
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return { visible: state.visible, secondsLeft: state.secondsLeft, reveal, hide };
}
