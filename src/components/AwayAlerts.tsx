"use client";

// Teacher-facing list of soft activity alerts (left the tab / reloaded).

import { useLang } from "./LangProvider";
import type { RosterEntry } from "@/lib/client";

export function AwayAlerts({ participants }: { participants: RosterEntry[] }) {
  const { t } = useLang();
  const flagged = participants.filter((p) => p.awayCount > 0 || p.reloadedCount > 0);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t("away.title")}</h3>
      {flagged.length === 0 ? (
        <p className="text-sm text-slate-400">{t("away.none")}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {flagged.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-amber-700">
              <span aria-hidden>⚠️</span>
              <span className="font-medium">{p.displayName}</span>
              <span className="text-slate-500">
                {p.awayCount > 0 && `${t("away.left")} ${p.awayCount} ${t("away.times")}`}
                {p.awayCount > 0 && p.reloadedCount > 0 && " · "}
                {p.reloadedCount > 0 && `${t("away.reloaded")} ${p.reloadedCount}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
