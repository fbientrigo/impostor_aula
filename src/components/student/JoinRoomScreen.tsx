"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, Field, Panel, TextInput } from "@/components/ui";
import { RoomCodeBadge } from "@/components/RoomCodeBadge";
import { joinRoom } from "@/lib/client";
import { setParticipant, type ParticipantIdentity } from "@/lib/storage";

interface Props {
  code: string;
  onJoined: (identity: ParticipantIdentity) => void;
}

export function JoinRoomScreen({ code, onJoined }: Props) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { participantId, secret } = await joinRoom(code, name);
      const identity: ParticipantIdentity = { participantId, secret, displayName: name.trim() };
      setParticipant(code, identity);
      onJoined(identity);
    } catch (e) {
      const err = e instanceof Error ? e.message : "";
      setError(err === "name_taken" ? `${t("join.namePlaceholder")}: ${name}` : t("common.error"));
      setBusy(false);
    }
  }

  return (
    <Panel className="mx-auto flex max-w-sm animate-rise flex-col gap-5">
      <RoomCodeBadge code={code} size="md" />
      <h2 className="text-center font-display text-xl font-bold text-ink">{t("join.title")}</h2>
      <Field label={t("join.namePlaceholder")} error={error}>
        {(a11y) => (
          <TextInput
            {...a11y}
            value={name}
            maxLength={40}
            autoComplete="off"
            onChange={(e) => {
              setError("");
              setName(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />
        )}
      </Field>
      <Button size="lg" onClick={submit} disabled={busy || !name.trim()} aria-live="polite">
        {busy ? t("join.joining") : t("join.join")}
      </Button>
    </Panel>
  );
}
