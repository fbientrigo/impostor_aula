"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Panel, TextInput } from "@/components/ui";
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
    <Panel className="mx-auto flex max-w-sm flex-col gap-4">
      <h2 className="text-xl font-bold">{t("join.title")}</h2>
      <TextInput
        placeholder={t("join.namePlaceholder")}
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
      />
      <ErrorText>{error}</ErrorText>
      <Button onClick={submit} disabled={busy}>
        {busy ? t("join.joining") : t("join.join")}
      </Button>
    </Panel>
  );
}
