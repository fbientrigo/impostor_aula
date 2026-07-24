"use client";

import { useLang } from "@/components/LangProvider";
import { CardViewer } from "./CardViewer";
import type { ParticipantIdentity } from "@/lib/storage";

interface Props {
  code: string;
  identity: ParticipantIdentity;
  autoHideSeconds: number;
}

export function StudentDiscussionScreen({ code, identity, autoHideSeconds }: Props) {
  const { t } = useLang();
  return (
    <div className="flex animate-rise flex-col items-center gap-5">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-ink">{t("discuss.title")}</h2>
        <p className="mt-1 text-ink-secondary">{t("discuss.desc")}</p>
      </div>
      <CardViewer code={code} identity={identity} autoHideSeconds={autoHideSeconds} revealLabel={t("discuss.peek")} />
    </div>
  );
}
