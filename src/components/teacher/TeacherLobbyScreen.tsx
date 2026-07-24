"use client";

// Teacher lobby, split in two zones:
// - Projection zone (left): QR, room code, participants — what the class sees.
// - Preparation zone (right): concept choice, settings behind a disclosure,
//   and the single primary action ("Start round").

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/components/LangProvider";
import {
  Button,
  CheckIcon,
  CopyIcon,
  Disclosure,
  EmptyState,
  ErrorText,
  Panel,
  SectionLabel,
  Select,
  Spinner,
  UsersIcon,
} from "@/components/ui";
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
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [copied, setCopied] = useState(false);

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
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the URL is printed below the QR anyway */
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Projection zone */}
      <Panel className="flex flex-col items-center gap-5 lg:col-span-3">
        <RoomCodeBadge code={code} label={t("lobby.roomCode")} />
        {joinUrl ? <QrCode value={joinUrl} size={240} /> : <Spinner />}
        <p className="text-sm font-medium text-ink-secondary">{t("lobby.scanToJoin")}</p>
        <div className="flex items-center gap-2">
          <p className="break-all text-center text-xs text-ink-muted">{joinUrl}</p>
          <button
            onClick={copyLink}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-leaf hover:bg-leaf-soft"
          >
            {copied ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
            {copied ? t("lobby.copied") : t("lobby.copyLink")}
          </button>
        </div>

        <div className="w-full border-t border-edge pt-4">
          <div aria-live="polite" className="flex items-center gap-2">
            <UsersIcon className="text-ink-muted" />
            <SectionLabel>
              {t("lobby.participants")} · {participants.length}
            </SectionLabel>
          </div>
          {participants.length === 0 ? (
            <EmptyState>{t("lobby.noParticipants")}</EmptyState>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className="animate-rise rounded-full bg-leaf-soft px-3 py-1.5 text-sm font-medium text-leaf-deep"
                >
                  {p.displayName}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      {/* Preparation zone */}
      <Panel className="flex flex-col gap-4 self-start lg:col-span-2">
        <h2 className="font-display text-xl font-bold text-ink">{t("lobby.prepare")}</h2>

        <div>
          <SectionLabel className="mb-2">{t("lobby.concept")}</SectionLabel>
          {concepts === null ? (
            <Spinner label={t("common.loading")} />
          ) : (
            <div className="space-y-3">
              <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                <option value="">{t("lobby.pickConcept")}</option>
                {concepts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category} — {c.title}
                  </option>
                ))}
              </Select>
              {selected ? (
                <p className="rounded-lg bg-paper p-3 text-sm text-ink-secondary">{selected.explanation}</p>
              ) : null}
              <Disclosure summary={t("lobby.createConcept")}>
                <ConceptForm onCreate={onCreateConcept} />
              </Disclosure>
            </div>
          )}
        </div>

        <Disclosure summary={t("lobby.settings")}>
          <SettingsForm settings={settings} onChange={setSettings} maxImpostors={Math.max(1, participants.length - 1)} />
        </Disclosure>

        <ErrorText>{error}</ErrorText>
        <Button size="lg" onClick={onStart} disabled={starting}>
          {t("lobby.start")}
        </Button>
      </Panel>
    </div>
  );
}
