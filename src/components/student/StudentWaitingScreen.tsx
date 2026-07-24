"use client";

import { useLang } from "@/components/LangProvider";
import { CheckIcon, Panel, WaitingHint } from "@/components/ui";

export function StudentWaitingScreen({ displayName }: { displayName: string }) {
  const { t } = useLang();
  return (
    <Panel className="mx-auto flex max-w-sm animate-rise flex-col items-center gap-4 text-center">
      <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
        <CheckIcon width={28} height={28} />
      </span>
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">{t("wait.title")}</h2>
        <p className="mt-1 text-ink-secondary">
          {t("wait.joinedAs")}: <span className="font-semibold text-ink">{displayName}</span>
        </p>
      </div>
      <WaitingHint>{t("wait.desc")}</WaitingHint>
    </Panel>
  );
}
