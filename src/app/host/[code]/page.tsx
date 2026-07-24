"use client";

// Teacher dashboard controller. Loads room + roster (host-authenticated), keeps
// them fresh via the realtime channel, and renders the screen for the current
// phase. Only the browser that created the room (and thus holds the host token)
// can drive it.

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Panel, PhaseIndicator, Spinner } from "@/components/ui";
import { useLang } from "@/components/LangProvider";
import { useRoomChannel } from "@/hooks/useRoomChannel";
import { getParticipants, getRoom, type PublicRoom, type RosterEntry } from "@/lib/client";
import { getHostToken } from "@/lib/storage";
import { PHASE_STEPS, phaseStepIndex } from "@/lib/presentation";
import type { Concept } from "@/lib/types";
import { TeacherLobbyScreen } from "@/components/teacher/TeacherLobbyScreen";
import { TeacherRoundControlScreen } from "@/components/teacher/TeacherRoundControlScreen";
import { TeacherVotingScreen } from "@/components/teacher/TeacherVotingScreen";
import { TeacherResultsScreen } from "@/components/teacher/TeacherResultsScreen";

export default function HostPage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useLang();
  const [hostToken, setHostTokenState] = useState<string | null | undefined>(undefined);
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [participants, setParticipants] = useState<RosterEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHostTokenState(getHostToken(code));
  }, [code]);

  const refresh = useCallback(async () => {
    if (!hostToken) return;
    try {
      const [r, p] = await Promise.all([getRoom(code, hostToken), getParticipants(code)]);
      setRoom(r.room);
      setConcept(r.concept ?? null);
      setParticipants(p.participants);
    } catch {
      /* transient */
    } finally {
      setLoaded(true);
    }
  }, [code, hostToken]);

  useEffect(() => {
    if (hostToken) refresh();
  }, [hostToken, refresh]);

  useRoomChannel(hostToken ? code : null, refresh);

  let body: React.ReactNode;
  if (hostToken === undefined) {
    body = <Spinner label={t("common.loading")} />;
  } else if (hostToken === null) {
    body = (
      <Panel>
        <p className="text-ink-secondary">
          {t("common.error")} (no host token for room {code})
        </p>
      </Panel>
    );
  } else if (!loaded || !room) {
    body = <Spinner label={t("common.loading")} />;
  } else if (room.status === "lobby") {
    body = (
      <TeacherLobbyScreen code={code} hostToken={hostToken} room={room} participants={participants} onChanged={refresh} />
    );
  } else if (room.status === "card_reveal" || room.status === "discussion") {
    body = (
      <TeacherRoundControlScreen
        code={code}
        hostToken={hostToken}
        room={room}
        concept={concept}
        participants={participants}
        onChanged={refresh}
      />
    );
  } else if (room.status === "voting") {
    body = <TeacherVotingScreen code={code} hostToken={hostToken} participants={participants} onChanged={refresh} />;
  } else {
    body = <TeacherResultsScreen code={code} hostToken={hostToken} onChanged={refresh} />;
  }

  return (
    <main className="min-h-dvh">
      <AppHeader />
      <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-2">
        {room ? (
          <div className="mb-4">
            <PhaseIndicator
              steps={PHASE_STEPS.map((s) => ({ key: s.status, label: t(s.label) }))}
              currentIndex={phaseStepIndex(room.status)}
            />
          </div>
        ) : null}
        {body}
      </div>
    </main>
  );
}
