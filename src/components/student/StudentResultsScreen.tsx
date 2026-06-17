"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Panel, Spinner } from "@/components/ui";
import { getResults, type ResultsPayload } from "@/lib/client";

export function StudentResultsScreen({ code }: { code: string }) {
  const { t } = useLang();
  const [data, setData] = useState<ResultsPayload | null>(null);

  useEffect(() => {
    getResults(code).then(setData).catch(() => setData(null));
  }, [code]);

  if (!data) return <Spinner label={t("common.loading")} />;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Panel className="text-center">
        <h2 className="text-2xl font-bold">{t("sresults.title")}</h2>
        <p className={`mt-2 text-lg font-semibold ${data.impostorCaught ? "text-emerald-600" : "text-rose-600"}`}>
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
          <h3 className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("results.explanation")}
          </h3>
          <p className="mt-1 text-slate-700">{data.concept.explanation}</p>
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
      </Panel>
    </div>
  );
}
