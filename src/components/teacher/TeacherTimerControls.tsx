"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Panel } from "@/components/ui";
import { setRoomTimer } from "@/lib/client";
import type { TimerDurationSeconds } from "@/lib/types";

interface Props {
  code: string;
  hostToken: string;
  onChanged: () => void;
}

export function TeacherTimerControls({ code, hostToken, onChanged }: Props) {
  const { lang } = useLang();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start(durationSeconds: TimerDurationSeconds) {
    setBusy(true);
    setError("");
    try {
      await setRoomTimer(code, hostToken, "start", durationSeconds);
      onChanged();
    } catch {
      setError(lang === "es" ? "No se pudo iniciar el cronómetro." : "Could not start the timer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="mb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-ink">
            {lang === "es" ? "Cronómetro de discusión" : "Discussion timer"}
          </p>
          <p className="mt-1 text-sm text-ink-secondary">
            {lang === "es"
              ? "Actívalo cuando quieras dar tiempo a los grupos para conversar."
              : "Start it whenever you want to give groups time to discuss."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => start(30)} disabled={busy}>
            30 s
          </Button>
          <Button size="sm" onClick={() => start(120)} disabled={busy}>
            2 min
          </Button>
          <Button variant="secondary" size="sm" onClick={() => start(300)} disabled={busy}>
            5 min
          </Button>
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
    </Panel>
  );
}
