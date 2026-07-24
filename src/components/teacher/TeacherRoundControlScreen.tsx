"use client";

// Teacher view during card_reveal and discussion. Shows the concept (host-only),
// who has seen their card, activity alerts, and phase navigation.

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, CheckIcon, ErrorText, Panel, ScreenTitle, SectionLabel } from "@/components/ui";
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
        <ScreenTitle sub={t(isReveal ? "round.cardRevealDesc" : "round.discussionDesc")}>
          {t(isReveal ? "round.cardRevealTitle" : "round.discussionTitle")}
        </ScreenTitle>

        {concept ? (
          <div className="mt-4 rounded-lg border-l-4 border-leaf bg-leaf-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf">{concept.category}</p>
            <p className="font-display text-2xl font-bold text-leaf-deep">{concept.title}</p>
          </div>
        ) : null}

        {isReveal ? (
          <div className="mt-5">
            <p aria-live="polite" className="text-sm font-medium text-ink-secondary">
              {t("round.seenCard")}: {seen}/{participants.length}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${
                    p.hasSeenCard ? "bg-success-soft text-success" : "bg-paper text-ink-muted"
                  }`}
                >
                  {p.hasSeenCard ? <CheckIcon width={14} height={14} /> : null}
                  {p.displayName}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ErrorText>{error}</ErrorText>
        <div className="mt-6 flex flex-wrap gap-3">
          {prevPhase(room.status) && prevPhase(room.status) !== "lobby" ? (
            <Button variant="ghost" onClick={() => go(prevPhase(room.status))} disabled={busy}>
              {t("round.back")}
            </Button>
          ) : null}
          <Button size="lg" onClick={() => go(nextPhase(room.status))} disabled={busy}>
            {t(isReveal ? "round.toDiscussion" : "round.toVoting")}
          </Button>
        </div>
      </Panel>

      <Panel className="space-y-6 self-start">
        <RoomCodeBadge code={code} label={t("lobby.roomCode")} size="md" />
        <AwayAlerts participants={participants} />
      </Panel>
    </div>
  );
}
