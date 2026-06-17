"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Panel } from "@/components/ui";
import { castVote, type RosterEntry } from "@/lib/client";
import type { ParticipantIdentity } from "@/lib/storage";

interface Props {
  code: string;
  identity: ParticipantIdentity;
  participants: RosterEntry[];
  requireJustification: boolean;
}

export function StudentVotingScreen({ code, identity, participants, requireJustification }: Props) {
  const { t } = useLang();
  const [selected, setSelected] = useState("");
  const [justification, setJustification] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const candidates = participants.filter((p) => p.id !== identity.participantId);

  async function submit() {
    setError("");
    if (!selected) return;
    if (requireJustification && !justification.trim()) {
      setError(t("svote.justification"));
      return;
    }
    setBusy(true);
    try {
      await castVote(code, identity.participantId, identity.secret, selected, justification.trim() || undefined);
      setSubmitted(true);
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <Panel className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
        <span className="text-5xl">🗳️</span>
        <h2 className="text-xl font-bold">{t("svote.submitted")}</h2>
        <Button variant="ghost" onClick={() => setSubmitted(false)}>
          {t("svote.changeVote")}
        </Button>
      </Panel>
    );
  }

  return (
    <Panel className="mx-auto flex max-w-sm flex-col gap-4">
      <h2 className="text-xl font-bold">{t("svote.title")}</h2>
      <p className="text-sm text-slate-500">{t("svote.pick")}</p>
      <ul className="grid grid-cols-2 gap-2">
        {candidates.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => setSelected(p.id)}
              className={`w-full rounded-xl border px-3 py-3 text-sm font-medium transition ${
                selected === p.id
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p.displayName}
            </button>
          </li>
        ))}
      </ul>

      {requireJustification ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t("svote.justification")}</label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={2}
            placeholder={t("svote.justificationPlaceholder")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
      ) : null}

      <ErrorText>{error}</ErrorText>
      <Button onClick={submit} disabled={busy || !selected}>
        {t("svote.submit")}
      </Button>
    </Panel>
  );
}
