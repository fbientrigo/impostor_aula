"use client";

// Teacher view during card_reveal and discussion. Shows the concept (host-only),
// who has seen their card, activity alerts, and phase navigation.

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Panel } from "@/components/ui";
import { AwayAlerts } from "@/components/AwayAlerts";
import { RoomCodeBadge } from "@/components/RoomCodeBadge";
import { setPhase, type PublicRoom, type RosterEntry } from "@/lib/client";
import { nextPhase, prevPhase } from "@/lib/phases";
import type { Concept } from "@/lib/types";

interface Props {
  code: string;
  hostToken: string;
  room: PublicRoom;
  concept: Concept | null;
  participants: RosterEntry[];
  onChanged: () => void;
}

export function TeacherRoundControlScreen({ code, hostToken, room, concept, participants, onChanged }: Props) {
  const { t } = useLang();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isReveal = room.status === "card_reveal";

  async function go(to: typeof room.status | null) {
    if (!to) return;
    setBusy(true);
    setError("");
    try {
      await setPhase(code, hostToken, to);
      onChanged();
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  const seen = participants.filter((p) => p.hasSeenCard).length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel className="lg:col-span-2">
        <h2 className="text-xl font-bold">{t(isReveal ? "round.cardRevealTitle" : "round.discussionTitle")}</h2>
        <p className="mt-1 text-slate-500">{t(isReveal ? "round.cardRevealDesc" : "round.discussionDesc")}</p>

        {concept ? (
          <div className="mt-4 rounded-xl bg-brand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{concept.category}</p>
            <p className="text-2xl font-bold text-brand-800">{concept.title}</p>
          </div>
        ) : null}

        {isReveal ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-600">
              {t("round.seenCard")}: {seen}/{participants.length}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    p.hasSeenCard ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {p.hasSeenCard ? "✓ " : ""}
                  {p.displayName}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ErrorText>{error}</ErrorText>
        <div className="mt-6 flex gap-3">
          {prevPhase(room.status) && prevPhase(room.status) !== "lobby" ? (
            <Button variant="secondary" onClick={() => go(prevPhase(room.status))} disabled={busy}>
              {t("round.back")}
            </Button>
          ) : null}
          <Button onClick={() => go(nextPhase(room.status))} disabled={busy}>
            {t(isReveal ? "round.toDiscussion" : "round.toVoting")}
          </Button>
        </div>
      </Panel>

      <Panel className="space-y-6">
        <RoomCodeBadge code={code} label={t("lobby.roomCode")} />
        <AwayAlerts participants={participants} />
      </Panel>
    </div>
  );
}
