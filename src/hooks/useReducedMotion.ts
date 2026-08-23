"use client";

// Tracks the user's `prefers-reduced-motion` setting. When true, the Balatro
// card drops pointer tilt, glare and spring — respecting the OS accessibility
// preference instead of forcing motion on everyone.

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  // Default to `true` (calm) so the very first paint never flashes motion for a
  // reduced-motion user; it corrects on mount for everyone else.
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
