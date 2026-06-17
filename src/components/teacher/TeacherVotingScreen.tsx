"use client";

// Teacher view during voting: a live tally (counts only — roles stay hidden until
// the reveal), how many students have voted, activity alerts, and the Reveal
// button that advances to results.

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Panel } from "@/components/ui";
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
        <h2 className="text-xl font-bold">{t("voting.title")}</h2>
        <p className="mt-1 text-slate-500">{t("voting.desc")}</p>
        <p className="mt-2 text-sm font-medium text-slate-600">
          {t("voting.votesIn")}: {total}/{participants.length}
        </p>

        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{t("voting.liveTally")}</h3>
        <ul className="mt-2 space-y-2">
          {sorted.map((p) => {
            const c = counts[p.id] ?? 0;
            return (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm font-medium">{p.displayName}</span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(c / max) * 100}%` }} />
                </span>
                <span className="w-6 text-right text-sm tabular-nums text-slate-600">{c}</span>
              </li>
            );
          })}
        </ul>

        <ErrorText>{error}</ErrorText>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={() => setPhase(code, hostToken, "discussion").then(onChanged)} disabled={busy}>
            {t("round.back")}
          </Button>
          <Button onClick={reveal} disabled={busy}>
            {t("voting.reveal")}
          </Button>
        </div>
      </Panel>

      <Panel>
        <AwayAlerts participants={participants} />
      </Panel>
    </div>
  );
}
