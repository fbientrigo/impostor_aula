"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Panel, Spinner } from "@/components/ui";
import { QrCode } from "@/components/QrCode";
import { RoomCodeBadge } from "@/components/RoomCodeBadge";
import { SettingsForm } from "@/components/SettingsForm";
import { ConceptForm } from "./ConceptForm";
import { createConcept, getConcepts, startRound, type PublicRoom, type RosterEntry } from "@/lib/client";
import { validateImpostorCount } from "@/lib/roles";
import type { Concept, RoomSettings } from "@/lib/types";

interface Props {
  code: string;
  hostToken: string;
  room: PublicRoom;
  participants: RosterEntry[];
  onChanged: () => void;
}

export function TeacherLobbyScreen({ code, hostToken, room, participants, onChanged }: Props) {
  const { t } = useLang();
  const [settings, setSettings] = useState<RoomSettings>(room.settings);
  const [concepts, setConcepts] = useState<Concept[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    setJoinUrl(`${base}/join/${code}`);
  }, [code]);

  async function loadConcepts() {
    try {
      const { concepts: list } = await getConcepts(code, hostToken);
      setConcepts(list);
      if (!selectedId && list.length) setSelectedId(list[0].id);
    } catch {
      setError(t("common.error"));
    }
  }
  useEffect(() => {
    loadConcepts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(() => concepts?.find((c) => c.id === selectedId) ?? null, [concepts, selectedId]);

  async function onStart() {
    setError("");
    if (!selectedId) return setError(t("lobby.startNeedsConcept"));
    if (participants.length < 2) return setError(t("lobby.startNeedsParticipants"));
    const valid = validateImpostorCount(settings.impostorCount, participants.length);
    if (!valid.ok) return setError(t("common.error"));

    setStarting(true);
    try {
      await startRound(code, hostToken, selectedId, settings);
      onChanged();
    } catch {
      setError(t("common.error"));
      setStarting(false);
    }
  }

  async function onCreateConcept(concept: Omit<Concept, "id">) {
    const { concept: created } = await createConcept(code, hostToken, concept);
    setConcepts((prev) => [...(prev ?? []), created]);
    setSelectedId(created.id);
    setShowForm(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Join column */}
      <Panel className="flex flex-col items-center gap-4">
        <h2 className="text-lg font-bold">{t("lobby.scanToJoin")}</h2>
        {joinUrl ? <QrCode value={joinUrl} /> : <Spinner />}
        <RoomCodeBadge code={code} label={t("lobby.roomCode")} />
        <p className="break-all text-center text-xs text-slate-400">{joinUrl}</p>
      </Panel>

      {/* Participants column */}
      <Panel>
        <h2 className="mb-3 text-lg font-bold">
          {t("lobby.participants")} ({participants.length})
        </h2>
        {participants.length === 0 ? (
          <p className="text-sm text-slate-400">{t("lobby.noParticipants")}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <li key={p.id} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                {p.displayName}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Concept column */}
      <Panel>
        <h2 className="mb-3 text-lg font-bold">{t("lobby.concept")}</h2>
        {concepts === null ? (
          <Spinner label={t("common.loading")} />
        ) : (
          <div className="space-y-3">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="">{t("lobby.pickConcept")}</option>
              {concepts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category} — {c.title}
                </option>
              ))}
            </select>
            {selected ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{selected.explanation}</p>
            ) : null}
            {showForm ? (
              <ConceptForm onCreate={onCreateConcept} onCancel={() => setShowForm(false)} />
            ) : (
              <Button variant="ghost" onClick={() => setShowForm(true)}>
                + {t("lobby.createConcept")}
              </Button>
            )}
          </div>
        )}
      </Panel>

      {/* Settings + start column */}
      <Panel className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">{t("lobby.settings")}</h2>
        <SettingsForm settings={settings} onChange={setSettings} maxImpostors={Math.max(1, participants.length - 1)} />
        <ErrorText>{error}</ErrorText>
        <Button onClick={onStart} disabled={starting}>
          {t("lobby.start")}
        </Button>
      </Panel>
    </div>
  );
}
