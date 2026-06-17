"use client";

import { useLang } from "@/components/LangProvider";
import { CardViewer } from "./CardViewer";
import type { ParticipantIdentity } from "@/lib/storage";

interface Props {
  code: string;
  identity: ParticipantIdentity;
  autoHideSeconds: number;
}

export function StudentCardScreen({ code, identity, autoHideSeconds }: Props) {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center gap-4">
      <CardViewer code={code} identity={identity} autoHideSeconds={autoHideSeconds} revealLabel={t("card.tapToReveal")} />
    </div>
  );
}
