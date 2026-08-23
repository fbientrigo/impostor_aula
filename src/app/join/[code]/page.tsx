"use client";

// Student flow controller. Resolves identity from localStorage (or shows the join
// screen), keeps room + roster fresh via the realtime channel, reports soft
// activity events, and renders the screen for the current phase.

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { RoundTimerOverlay } from "@/components/RoundTimerOverlay";
import { ConfirmDialog, DrawerItem, ExitIcon, Panel, Spinner } from "@/components/ui";
import { useLang } from "@/components/LangProvider";
import { useRoomChannel } from "@/hooks/useRoomChannel";
import { useAwayTracking } from "@/hooks/useAwayTracking";
import { getParticipants, getRoom, postAway, type PublicRoom, type RosterEntry } from "@/lib/client";
import { clearParticipant, getParticipant, type ParticipantIdentity } from "@/lib/storage";
import { JoinRoomScreen } from "@/components/student/JoinRoomScreen";
import { StudentWaitingScreen } from "@/components/student/StudentWaitingScreen";
import { StudentCardScreen } from "@/components/student/StudentCardScreen";
import { StudentDiscussionScreen } from "@/components/student/StudentDiscussionScreen";
import { StudentVotingScreen } from "@/components/student/StudentVotingScreen";
import { StudentResultsScreen } from "@/components/student/StudentResultsScreen";

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useLang();
  const router = useRouter();
  const [identity, setIdentity] = useState<ParticipantIdentity | null | undefined>(undefined);
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [participants, setParticipants] = useState<RosterEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  useEffect(() => {
    setIdentity(getParticipant(code) ?? null);
  }, [code]);

  const refresh = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([getRoom(code), getParticipants(code)]);
      setRoom(r.room);
      setParticipants(p.participants);
    } catch {
      /* transient */
    } finally {
      setLoaded(true);
    }
  }, [code]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useRoomChannel(code, refresh);

  // Soft safeguard: report tab-leaving/reload while a round is active.
  const roundActive = !!identity && !!room && room.status !== "lobby" && room.status !== "results";
  useAwayTracking(roundActive, (type) => {
    if (identity) postAway(code, identity.participantId, identity.secret, type).catch(() => {});
  });

  function leaveRoom() {
    clearParticipant(code);
    router.push("/");
  }

  let body: React.ReactNode;
  if (identity === undefined || !loaded || !room) {
    body = <Spinner label={t("common.loading")} />;
  } else if (identity === null) {
    body = <JoinRoomScreen code={code} onJoined={(id) => setIdentity(id)} />;
  } else if (room.status === "lobby") {
    body = <StudentWaitingScreen displayName={identity.displayName} />;
  } else if (room.status === "card_reveal") {
    body = <StudentCardScreen code={code} identity={identity} autoHideSeconds={room.settings.cardAutoHideSeconds} />;
  } else if (room.status === "discussion") {
    body = <StudentDiscussionScreen code={code} identity={identity} autoHideSeconds={room.settings.cardAutoHideSeconds} />;
  } else if (room.status === "voting") {
    body = (
      <StudentVotingScreen
        code={code}
        identity={identity}
        participants={participants}
        requireJustification={room.settings.requireVoteJustification}
      />
    );
  } else {
    body = <StudentResultsScreen code={code} />;
  }

  // A joined student whose room can't be found (e.g., reset) still gets a frame.
  if (identity && loaded && !room) {
    body = (
      <Panel>
        <p className="text-ink-secondary">{t("common.error")}</p>
      </Panel>
    );
  }

  return (
    <main className="app-shell-frame min-h-dvh">
      <AppHeader
        drawerExtras={
          identity ? (
            <DrawerItem icon={<ExitIcon />} tone="danger" onClick={() => setConfirmingLeave(true)}>
              {t("nav.leaveRoom")}
            </DrawerItem>
          ) : null
        }
      />
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-2">{body}</div>

      <ConfirmDialog
        open={confirmingLeave}
        title={t("leave.title")}
        body={t("leave.body")}
        confirmLabel={t("leave.confirm")}
        cancelLabel={t("common.cancel")}
        danger
        onConfirm={leaveRoom}
        onCancel={() => setConfirmingLeave(false)}
      />

      {identity && room ? (
        <RoundTimerOverlay
          endsAt={room.settings.timerEndsAt}
          durationSeconds={room.settings.timerDurationSeconds}
        />
      ) : null}
    </main>
  );
}
