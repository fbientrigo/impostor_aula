"use client";

// Teacher view during voting: a live tally (counts only — roles stay hidden until
// the reveal), how many students have voted, activity alerts, and the Reveal
// button that advances to results.

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Panel, ScreenTitle, SectionLabel } from "@/components/ui";
import { AwayAlerts } from "@/components/AwayAlerts";
import { getVotes, setPhase, type RosterEntry } from "@/lib/client";

interface Props {
  code: string;
  hostToken: string;
  participants: RosterEntry[];
  onChanged: () => void;
}

export function TeacherVotingScreen({ code, hostToken, participants, onChanged }: Props) {
  const { t } = useLang();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { counts, total } = await getVotes(code, hostToken);
        if (active) {
          setCounts(counts);
          setTotal(total);
        }
      } catch {
        /* transient */
      }
    };
    load();
    const id = setInterval(load, 2500);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [code, hostToken]);

  const max = Math.max(1, ...Object.values(counts));
  const sorted = [...participants].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));

  async function reveal() {
    setBusy(true);
    setError("");
    try {
      await setPhase(code, hostToken, "results");
      onChanged();
    } catch {
      setError(t("common.error"));
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel className="lg:col-span-2">
        <ScreenTitle sub={t("voting.desc")}>{t("voting.title")}</ScreenTitle>
        <p aria-live="polite" className="mt-3 text-sm font-medium text-ink-secondary">
          {t("voting.votesIn")}: {total}/{participants.length}
        </p>

        <SectionLabel className="mt-5">{t("voting.liveTally")}</SectionLabel>
        <ul className="mt-2 space-y-2">
          {sorted.map((p) => {
            const c = counts[p.id] ?? 0;
            return (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm font-medium text-ink">{p.displayName}</span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-paper">
                  <span
                    className="block h-full rounded-full bg-leaf transition-[width] duration-300"
                    style={{ width: `${(c / max) * 100}%` }}
                  />
                </span>
                <span className="w-6 text-right text-sm tabular-nums text-ink-secondary">{c}</span>
              </li>
            );
          })}
        </ul>

        <ErrorText>{error}</ErrorText>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="ghost"
            onClick={() => setPhase(code, hostToken, "discussion").then(onChanged)}
            disabled={busy}
          >
            {t("round.back")}
          </Button>
          <Button size="lg" onClick={reveal} disabled={busy}>
            {t("voting.reveal")}
          </Button>
        </div>
      </Panel>

      <Panel className="self-start">
        <AwayAlerts participants={participants} />
      </Panel>
    </div>
  );
}
