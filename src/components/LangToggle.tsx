"use client";

import { useLang } from "./LangProvider";

export function LangToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
      aria-label="Toggle language"
    >
      {t("lang.toggle")}
    </button>
  );
}
