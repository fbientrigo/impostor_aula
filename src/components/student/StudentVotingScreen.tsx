"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { BallotIcon, Button, CheckIcon, ErrorText, Panel, TextArea } from "@/components/ui";
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
      <Panel className="mx-auto flex max-w-sm animate-rise flex-col items-center gap-3 text-center">
        <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckIcon width={28} height={28} />
        </span>
        <h2 className="font-display text-xl font-bold text-ink">{t("svote.submitted")}</h2>
        <Button variant="ghost" onClick={() => setSubmitted(false)}>
          {t("svote.changeVote")}
        </Button>
      </Panel>
    );
  }

  return (
    <Panel className="mx-auto flex max-w-sm animate-rise flex-col gap-4">
      <div className="flex items-center gap-2">
        <BallotIcon className="text-leaf" />
        <h2 className="font-display text-xl font-bold text-ink">{t("svote.title")}</h2>
      </div>
      <p className="text-sm text-ink-secondary">{t("svote.pick")}</p>
      <ul className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("svote.pick")}>
        {candidates.map((p) => (
          <li key={p.id}>
            <button
              role="radio"
              aria-checked={selected === p.id}
              onClick={() => setSelected(p.id)}
              className={`min-h-11 w-full rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                selected === p.id
                  ? "border-leaf bg-leaf-soft text-leaf-deep"
                  : "border-edge bg-surface text-ink-secondary hover:bg-paper"
              }`}
            >
              {p.displayName}
            </button>
          </li>
        ))}
      </ul>

      {requireJustification ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-secondary">{t("svote.justification")}</label>
          <TextArea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={2}
            placeholder={t("svote.justificationPlaceholder")}
          />
        </div>
      ) : null}

      <ErrorText>{error}</ErrorText>
      <Button size="lg" onClick={submit} disabled={busy || !selected}>
        {t("svote.submit")}
      </Button>
    </Panel>
  );
}
