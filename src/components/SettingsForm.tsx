"use client";

// Controlled editor for RoomSettings, used in the teacher lobby before starting.

import { useLang } from "./LangProvider";
import { NumberRow, ToggleRow } from "@/components/ui";
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
    <div className="space-y-3">
      <NumberRow
        label={t("settings.impostorCount")}
        value={settings.impostorCount}
        min={1}
        max={Math.max(1, maxImpostors)}
        onChange={(v) => set("impostorCount", Math.max(1, v || 1))}
      />

      {toggles.map(({ key, label }) => (
        <ToggleRow
          key={key}
          label={t(label)}
          checked={Boolean(settings[key])}
          onChange={(checked) => set(key, checked as RoomSettings[typeof key])}
        />
      ))}

      <NumberRow
        label={t("settings.cardAutoHideSeconds")}
        value={settings.cardAutoHideSeconds}
        min={0}
        onChange={(v) => set("cardAutoHideSeconds", Math.max(0, v))}
      />
    </div>
  );
}
