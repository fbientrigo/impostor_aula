"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Panel, SearchIcon, SectionLabel, Spinner } from "@/components/ui";
import { getResults, type ResultsPayload } from "@/lib/client";

export function StudentResultsScreen({ code }: { code: string }) {
  const { t } = useLang();
  const [data, setData] = useState<ResultsPayload | null>(null);

  useEffect(() => {
    getResults(code).then(setData).catch(() => setData(null));
  }, [code]);

  if (!data) return <Spinner label={t("common.loading")} />;

  return (
    <div className="mx-auto flex max-w-md animate-rise flex-col gap-4">
      <Panel className="text-center">
        <h2 className="font-display text-2xl font-bold text-ink">{t("sresults.title")}</h2>
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
          <SectionLabel className="mt-3">{t("results.explanation")}</SectionLabel>
          <p className="mt-1 text-ink">{data.concept.explanation}</p>
        </Panel>
      ) : null}

      <Panel>
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
      </Panel>
    </div>
  );
}
