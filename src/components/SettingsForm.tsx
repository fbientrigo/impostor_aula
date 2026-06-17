"use client";

// Controlled editor for RoomSettings, used in the teacher lobby before starting.

import { useLang } from "./LangProvider";
import type { RoomSettings } from "@/lib/types";
import type { MessageKey } from "@/lib/i18n";

interface Props {
  settings: RoomSettings;
  onChange: (settings: RoomSettings) => void;
  maxImpostors: number;
}

export function SettingsForm({ settings, onChange, maxImpostors }: Props) {
  const { t } = useLang();
  const set = <K extends keyof RoomSettings>(key: K, value: RoomSettings[K]) =>
    onChange({ ...settings, [key]: value });

  const toggles: { key: keyof RoomSettings; label: MessageKey }[] = [
    { key: "showCategoryToImpostor", label: "settings.showCategoryToImpostor" },
    { key: "showHintToImpostor", label: "settings.showHintToImpostor" },
    { key: "requireVoteJustification", label: "settings.requireVoteJustification" },
    { key: "trackTabLeaving", label: "settings.trackTabLeaving" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-700">{t("settings.impostorCount")}</span>
        <input
          type="number"
          min={1}
          max={Math.max(1, maxImpostors)}
          value={settings.impostorCount}
          onChange={(e) => set("impostorCount", Math.max(1, Number(e.target.value) || 1))}
          className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center"
        />
      </div>

      {toggles.map(({ key, label }) => (
        <label key={key} className="flex cursor-pointer items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-700">{t(label)}</span>
          <input
            type="checkbox"
            checked={Boolean(settings[key])}
            onChange={(e) => set(key, e.target.checked as RoomSettings[typeof key])}
            className="h-5 w-5 accent-brand-600"
          />
        </label>
      ))}

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-700">{t("settings.cardAutoHideSeconds")}</span>
        <input
          type="number"
          min={0}
          value={settings.cardAutoHideSeconds}
          onChange={(e) => set("cardAutoHideSeconds", Math.max(0, Number(e.target.value) || 0))}
          className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center"
        />
      </div>
    </div>
  );
}
