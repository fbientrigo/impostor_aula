"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button } from "@/components/ui";
import { setRoomTimer } from "@/lib/client";
import type { TimerDurationSeconds } from "@/lib/types";

interface Props {
  endsAt: string | null;
  durationSeconds: TimerDurationSeconds | null;
  code?: string;
  hostToken?: string;
  onChanged?: () => void;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function RoundTimerOverlay({ endsAt, durationSeconds, code, hostToken, onChanged }: Props) {
  const { lang } = useLang();
  const [now, setNow] = useState(() => Date.now());
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    if (!endsAt) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [endsAt]);

  const endMs = endsAt ? Date.parse(endsAt) : Number.NaN;
  const remainingSeconds = Number.isFinite(endMs) ? Math.max(0, Math.ceil((endMs - now) / 1000)) : 0;
  if (!endsAt || remainingSeconds <= 0) return null;

  const progress = durationSeconds
    ? Math.max(0, Math.min(100, (remainingSeconds / durationSeconds) * 100))
    : 0;
  const canStop = !!code && !!hostToken;

  async function stop() {
    if (!code || !hostToken) return;
    setStopping(true);
    try {
      await setRoomTimer(code, hostToken, "stop");
      onChanged?.();
    } finally {
      setStopping(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-paper/55 px-4 pt-[10vh] backdrop-blur-lg">
      <section
        role="timer"
        aria-label={lang === "es" ? "Cronómetro de discusión" : "Discussion timer"}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-edge-strong bg-surface/95 shadow-xl"
      >
        <div className="px-6 pb-6 pt-5 text-center sm:px-10 sm:pb-8">
          <p className="font-handwritten text-base font-semibold text-leaf-deep">
            {lang === "es" ? "Tiempo para conversar" : "Time to discuss"}
          </p>
          <p className="mt-2 font-display text-7xl font-bold tabular-nums tracking-tight text-ink sm:text-8xl">
            {formatClock(remainingSeconds)}
          </p>
          <p className="mt-2 text-sm text-ink-secondary">
            {lang === "es"
              ? "Conversen en su grupo y preparen qué van a decir."
              : "Discuss with your group and prepare what you will say."}
          </p>

          {canStop ? (
            <Button className="mt-5" variant="secondary" onClick={stop} disabled={stopping}>
              {lang === "es" ? "Detener cronómetro" : "Stop timer"}
            </Button>
          ) : null}
        </div>

        <div className="h-2 bg-paper" aria-hidden="true">
          <div className="h-full bg-leaf transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
      </section>
    </div>
  );
}
