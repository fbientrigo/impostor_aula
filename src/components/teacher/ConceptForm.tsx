"use client";

// Inline form to author a new concept from the lobby.

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Label, TextInput } from "@/components/ui";
import type { Concept, Difficulty } from "@/lib/types";

interface Props {
  onCreate: (concept: Omit<Concept, "id">) => Promise<void>;
  onCancel: () => void;
}

export function ConceptForm({ onCreate, onCancel }: Props) {
  const { t } = useLang();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [impostorHint, setImpostorHint] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("basic");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!category.trim() || !title.trim() || !explanation.trim()) {
      setError(t("common.error"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreate({
        category: category.trim(),
        title: title.trim(),
        explanation: explanation.trim(),
        impostorHint: impostorHint.trim() || undefined,
        teacherNotes: teacherNotes.trim() || undefined,
        difficulty,
        tags: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
    } catch {
      setError(t("common.error"));
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <Label>{t("conceptForm.category")}</Label>
        <TextInput value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <Label>{t("conceptForm.titleField")}</Label>
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label>{t("conceptForm.explanation")}</Label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div>
        <Label>{t("conceptForm.impostorHint")}</Label>
        <TextInput value={impostorHint} onChange={(e) => setImpostorHint(e.target.value)} />
      </div>
      <div>
        <Label>{t("conceptForm.teacherNotes")}</Label>
        <TextInput value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Label>{t("conceptForm.difficulty")}</Label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="basic">{t("difficulty.basic")}</option>
            <option value="intermediate">{t("difficulty.intermediate")}</option>
            <option value="advanced">{t("difficulty.advanced")}</option>
          </select>
        </div>
        <div className="flex-1">
          <Label>{t("conceptForm.tags")}</Label>
          <TextInput value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button onClick={submit} disabled={saving}>
          {t("conceptForm.save")}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
