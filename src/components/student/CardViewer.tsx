"use client";

// Privacy-aware role card. The card is fetched lazily on first reveal (which also
// marks it "seen" server-side) and hidden automatically on tab switch / blur and,
// if configured, after a countdown.

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText } from "@/components/ui";
import { useCardVisibility } from "@/hooks/useCardVisibility";
import { getCard } from "@/lib/client";
import type { ParticipantIdentity } from "@/lib/storage";
import type { CardPayload } from "@/lib/types";

interface Props {
  code: string;
  identity: ParticipantIdentity;
  autoHideSeconds: number;
  revealLabel: string;
}

export function CardViewer({ code, identity, autoHideSeconds, revealLabel }: Props) {
  const { t } = useLang();
  const [card, setCard] = useState<CardPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { visible, secondsLeft, reveal, hide } = useCardVisibility(autoHideSeconds);

  async function onReveal() {
    setError("");
    if (!card) {
      setLoading(true);
      try {
        const res = await getCard(code, identity.participantId, identity.secret);
        setCard(res.card);
      } catch {
        setError(t("common.error"));
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    reveal();
  }

  if (!visible || !card) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={onReveal} disabled={loading} className="px-8 py-6 text-xl">
          {loading ? t("common.loading") : revealLabel}
        </Button>
        <p className="max-w-xs text-center text-sm text-slate-400">{t("card.holdNote")}</p>
        <ErrorText>{error}</ErrorText>
      </div>
    );
  }

  const isImpostor = card.role === "impostor";

  return (
    <div className="w-full max-w-sm">
      <div
        className={`rounded-3xl p-8 text-center shadow-lg ${
          isImpostor ? "bg-rose-600 text-white" : "bg-brand-600 text-white"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-wide opacity-80">{t("card.youAre")}</p>
        <p className="mt-1 text-3xl font-extrabold">
          {t(isImpostor ? "card.role.impostor" : "card.role.student")}
        </p>

        {card.role === "student" ? (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide opacity-80">{t("card.concept")}</p>
            <p className="text-2xl font-bold">{card.title}</p>
            <p className="mt-2 text-sm opacity-90">
              {t("card.category")}: {card.category}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            <p className="text-sm opacity-90">{t("card.impostorMsg")}</p>
            {card.category ? (
              <p className="text-base font-semibold">
                {t("card.category")}: {card.category}
              </p>
            ) : null}
            {card.hint ? (
              <p className="text-sm opacity-90">
                {t("card.hint")}: {card.hint}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <Button variant="secondary" onClick={hide}>
          {t("card.hide")}
        </Button>
        {secondsLeft !== null ? <p className="text-sm text-slate-400">{secondsLeft}s</p> : null}
      </div>
    </div>
  );
}
