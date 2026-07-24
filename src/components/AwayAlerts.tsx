"use client";

// Teacher-facing list of soft activity alerts (left the tab / reloaded).

import { useLang } from "./LangProvider";
import { AlertIcon, SectionLabel } from "@/components/ui";
import type { RosterEntry } from "@/lib/client";

export function AwayAlerts({ participants }: { participants: RosterEntry[] }) {
  const { t } = useLang();
  const flagged = participants.filter((p) => p.awayCount > 0 || p.reloadedCount > 0);

  return (
    <div>
      <SectionLabel className="mb-2">{t("away.title")}</SectionLabel>
      {flagged.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("away.none")}</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {flagged.map((p) => (
            <li key={p.id} className="flex items-start gap-2">
              <AlertIcon width={16} height={16} className="mt-0.5 shrink-0 text-warning" />
              <span>
                <span className="font-medium text-ink">{p.displayName}</span>{" "}
                <span className="text-ink-secondary">
                  {p.awayCount > 0 && `${t("away.left")} ${p.awayCount} ${t("away.times")}`}
                  {p.awayCount > 0 && p.reloadedCount > 0 && " · "}
                  {p.reloadedCount > 0 && `${t("away.reloaded")} ${p.reloadedCount}`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
