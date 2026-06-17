"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";
import { LangToggle } from "./LangToggle";

export function AppHeader({ subtitle }: { subtitle?: string }) {
  const { t } = useLang();
  return (
    <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
      <Link href="/" className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-brand-700">{t("app.name")}</span>
        <span className="hidden text-sm text-slate-400 sm:inline">{subtitle ?? t("app.tagline")}</span>
      </Link>
      <LangToggle />
    </header>
  );
}
