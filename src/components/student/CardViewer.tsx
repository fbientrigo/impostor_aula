"use client";

// Privacy-aware role card. The card is fetched lazily on first reveal (which also
// marks it "seen" server-side) and hidden automatically on tab switch / blur and,
// if configured, after a countdown. The impostor card differs from the student
// card by color, icon AND label — never color alone.

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, EyeIcon, EyeOffIcon, LeafIcon, SearchIcon } from "@/components/ui";
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
        <Button size="lg" onClick={onReveal} disabled={loading} className="px-10 py-5 text-xl">
          <EyeIcon />
          {loading ? t("common.loading") : revealLabel}
        </Button>
        <p className="max-w-xs text-center text-sm text-ink-muted">{t("card.holdNote")}</p>
        <ErrorText>{error}</ErrorText>
      </div>
    );
  }

  const isImpostor = card.role === "impostor";

  return (
    <div className="w-full max-w-sm">
      <div
        className={`animate-card-reveal rounded-2xl p-7 text-center text-white shadow-lg ${
          isImpostor ? "bg-coral" : "bg-leaf"
        }`}
      >
        <span
          aria-hidden
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
        >
          {isImpostor ? <SearchIcon width={26} height={26} /> : <LeafIcon width={26} height={26} />}
        </span>
        <p className="mt-3 text-sm font-semibold uppercase tracking-widest opacity-80">{t("card.youAre")}</p>
        <p className="font-display text-3xl font-bold">
          {t(isImpostor ? "card.role.impostor" : "card.role.student")}
        </p>

        {card.role === "student" ? (
          <div className="mt-6 rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-widest opacity-80">{t("card.concept")}</p>
            <p className="font-display text-2xl font-bold">{card.title}</p>
            <p className="mt-2 text-sm opacity-90">
              {t("card.category")}: {card.category}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-2 rounded-xl bg-white/10 p-4">
            <p className="text-sm opacity-95">{t("card.impostorMsg")}</p>
            {card.category ? (
              <p className="text-base font-semibold">
                {t("card.category")}: {card.category}
              </p>
            ) : null}
            {card.hint ? (
              <p className="text-sm opacity-95">
                {t("card.hint")}: {card.hint}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <Button variant="secondary" onClick={hide}>
          <EyeOffIcon />
          {t("card.hide")}
        </Button>
        {secondsLeft !== null ? (
          <p className="text-sm tabular-nums text-ink-muted" aria-live="off">
            {secondsLeft}s
          </p>
        ) : null}
      </div>
    </div>
  );
}
