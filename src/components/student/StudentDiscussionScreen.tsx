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
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t("discuss.title")}</h2>
        <p className="text-slate-500">{t("discuss.desc")}</p>
      </div>
      <CardViewer code={code} identity={identity} autoHideSeconds={autoHideSeconds} revealLabel={t("discuss.peek")} />
    </div>
  );
}
