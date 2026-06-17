"use client";

import { useLang } from "@/components/LangProvider";
import { Panel } from "@/components/ui";

export function StudentWaitingScreen({ displayName }: { displayName: string }) {
  const { t } = useLang();
  return (
    <Panel className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
      <span className="text-5xl">✅</span>
      <h2 className="text-xl font-bold">{t("wait.title")}</h2>
      <p className="text-slate-500">{t("wait.desc")}</p>
      <p className="text-sm text-slate-400">
        {t("wait.joinedAs")}: <span className="font-semibold text-slate-600">{displayName}</span>
      </p>
    </Panel>
  );
}
