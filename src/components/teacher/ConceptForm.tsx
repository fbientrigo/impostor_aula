"use client";

// Inline form to author a new concept, shown inside a disclosure in the lobby.

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Label, Select, TextArea, TextInput } from "@/components/ui";
import type { Concept, Difficulty } from "@/lib/types";

interface Props {
  onCreate: (concept: Omit<Concept, "id">) => Promise<void>;
}

export function ConceptForm({ onCreate }: Props) {
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
      setCategory("");
      setTitle("");
      setExplanation("");
      setImpostorHint("");
      setTeacherNotes("");
      setTags("");
    } catch {
      setError(t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>{t("conceptForm.category")}</Label>
        <TextInput className="text-base" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <Label>{t("conceptForm.titleField")}</Label>
        <TextInput className="text-base" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label>{t("conceptForm.explanation")}</Label>
        <TextArea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} />
      </div>
      <div>
        <Label>{t("conceptForm.impostorHint")}</Label>
        <TextInput className="text-base" value={impostorHint} onChange={(e) => setImpostorHint(e.target.value)} />
      </div>
      <div>
        <Label>{t("conceptForm.teacherNotes")}</Label>
        <TextInput className="text-base" value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Label>{t("conceptForm.difficulty")}</Label>
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            <option value="basic">{t("difficulty.basic")}</option>
            <option value="intermediate">{t("difficulty.intermediate")}</option>
            <option value="advanced">{t("difficulty.advanced")}</option>
          </Select>
        </div>
        <div className="flex-1">
          <Label>{t("conceptForm.tags")}</Label>
          <TextInput className="text-base" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <Button variant="secondary" onClick={submit} disabled={saving}>
        {t("conceptForm.save")}
      </Button>
    </div>
  );
}
