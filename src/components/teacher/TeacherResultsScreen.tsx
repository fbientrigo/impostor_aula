"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, Panel, Spinner } from "@/components/ui";
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
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel className="lg:col-span-2">
        <h2 className="text-2xl font-bold">{t("results.title")}</h2>
        <p
          className={`mt-2 text-lg font-semibold ${data.impostorCaught ? "text-emerald-600" : "text-rose-600"}`}
        >
          {data.impostorCaught ? t("results.caught") : t("results.notCaught")}
        </p>
        <p className="mt-2 text-slate-700">
          <span className="font-medium">{t("results.impostorWas")}:</span> {data.impostors.join(", ") || "—"}
        </p>
      </Panel>

      {data.concept ? (
        <Panel>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{data.concept.category}</p>
          <p className="text-2xl font-bold text-brand-800">{data.concept.title}</p>
          <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("results.explanation")}
          </h3>
          <p className="mt-1 text-slate-700">{data.concept.explanation}</p>
          {data.concept.teacherNotes ? (
            <>
              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t("results.teacherNotes")}
              </h3>
              <p className="mt-1 text-slate-700">{data.concept.teacherNotes}</p>
            </>
          ) : null}
        </Panel>
      ) : null}

      <Panel>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t("results.voteCounts")}</h3>
        <ul className="space-y-1">
          {data.tally.map((row) => (
            <li key={row.participantId} className="flex items-center justify-between gap-2 text-sm">
              <span className={row.role === "impostor" ? "font-bold text-rose-600" : "font-medium"}>
                {row.role === "impostor" ? "🕵️ " : ""}
                {row.displayName}
              </span>
              <span className="tabular-nums text-slate-600">{row.votes}</span>
            </li>
          ))}
        </ul>
        {data.votes.some((v) => v.justification) ? (
          <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            {data.votes
              .filter((v) => v.justification)
              .map((v, i) => (
                <li key={i}>
                  <span className="font-medium text-slate-700">{v.voter}</span> → {v.target}: “{v.justification}”
                </li>
              ))}
          </ul>
        ) : null}
      </Panel>

      <div className="lg:col-span-2">
        <Button onClick={newRound} disabled={busy}>
          {t("results.newRound")}
        </Button>
      </div>
    </div>
  );
}
