"use client";

// Teacher results: outcome, the concept (the educational payoff, given visual
// priority), vote breakdown, and a confirmed "new round" reset.

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ConfirmDialog, Panel, ScreenTitle, SearchIcon, SectionLabel, Spinner } from "@/components/ui";
import { getResults, resetRoom, type ResultsPayload } from "@/lib/client";

interface Props {
  code: string;
  hostToken: string;
  onChanged: () => void;
}

export function TeacherResultsScreen({ code, hostToken, onChanged }: Props) {
  const { t } = useLang();
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    getResults(code).then(setData).catch(() => setData(null));
  }, [code]);

  if (!data) return <Spinner label={t("common.loading")} />;

  async function newRound() {
    setBusy(true);
    try {
      await resetRoom(code, hostToken);
      onChanged();
    } catch {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel className="lg:col-span-2">
        <ScreenTitle>{t("results.title")}</ScreenTitle>
        <p
          className={`mt-2 inline-block rounded-lg px-3 py-1.5 text-lg font-semibold ${
            data.impostorCaught ? "bg-success-soft text-success" : "bg-coral-soft text-coral-deep"
          }`}
        >
          {data.impostorCaught ? t("results.caught") : t("results.notCaught")}
        </p>
        <p className="mt-3 text-ink">
          <span className="font-medium">{t("results.impostorWas")}:</span>{" "}
          <span className="font-semibold text-coral">{data.impostors.join(", ") || "—"}</span>
        </p>
      </Panel>

      {data.concept ? (
        <Panel className="border-l-4 border-l-leaf">
          <p className="text-xs font-semibold uppercase tracking-widest text-leaf">{data.concept.category}</p>
          <p className="font-display text-2xl font-bold text-leaf-deep">{data.concept.title}</p>
          <SectionLabel className="mt-4">{t("results.explanation")}</SectionLabel>
          <p className="mt-1 text-ink">{data.concept.explanation}</p>
          {data.concept.teacherNotes ? (
            <>
              <SectionLabel className="mt-4">{t("results.teacherNotes")}</SectionLabel>
              <p className="mt-1 text-ink-secondary">{data.concept.teacherNotes}</p>
            </>
          ) : null}
        </Panel>
      ) : null}

      <Panel className="self-start">
        <SectionLabel className="mb-2">{t("results.voteCounts")}</SectionLabel>
        <ul className="space-y-1.5">
          {data.tally.map((row) => (
            <li key={row.participantId} className="flex items-center justify-between gap-2 text-sm">
              <span
                className={
                  row.role === "impostor"
                    ? "flex items-center gap-1.5 font-bold text-coral"
                    : "font-medium text-ink"
                }
              >
                {row.role === "impostor" ? <SearchIcon width={15} height={15} /> : null}
                {row.displayName}
              </span>
              <span className="tabular-nums text-ink-secondary">{row.votes}</span>
            </li>
          ))}
        </ul>
        {data.votes.some((v) => v.justification) ? (
          <ul className="mt-4 space-y-2 border-t border-edge pt-3 text-xs text-ink-secondary">
            {data.votes
              .filter((v) => v.justification)
              .map((v, i) => (
                <li key={i}>
                  <span className="font-medium text-ink">{v.voter}</span> → {v.target}: “{v.justification}”
                </li>
              ))}
          </ul>
        ) : null}
      </Panel>

      <div className="lg:col-span-2">
        <Button size="lg" onClick={() => setConfirming(true)} disabled={busy}>
          {t("results.newRound")}
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        title={t("reset.title")}
        body={t("reset.body")}
        confirmLabel={t("reset.confirm")}
        cancelLabel={t("common.cancel")}
        busy={busy}
        onConfirm={newRound}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
