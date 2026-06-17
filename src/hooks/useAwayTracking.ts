"use client";

// Soft classroom safeguard. While `enabled`, reports when the student leaves the
// tab (visibilitychange -> hidden, window blur) and once on a page reload. These
// are informational counters for the teacher dashboard — never exam-locking.

import { useEffect, useRef } from "react";

type AwayType = "away" | "reload";

export function useAwayTracking(enabled: boolean, report: (type: AwayType) => void) {
  const cb = useRef(report);
  cb.current = report;

  // Report a reload once per mount (Navigation Timing).
  useEffect(() => {
    if (!enabled) return;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "reload") cb.current("reload");
  }, [enabled]);

  // Report leaving the tab/window, debounced so a single switch doesn't double-fire
  // from both visibilitychange and blur.
  useEffect(() => {
    if (!enabled) return;
    let lockedUntil = 0;
    const fire = () => {
      const now = performance.now();
      if (now < lockedUntil) return;
      lockedUntil = now + 1000;
      cb.current("away");
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") fire();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("blur", fire);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("blur", fire);
    };
  }, [enabled]);
}
