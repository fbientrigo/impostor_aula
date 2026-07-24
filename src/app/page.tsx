"use client";

// Landing: one screen, two roles. Students (the majority of visitors) get the
// big code entry first; the teacher's "create room" panel sits below, quieter.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useLang } from "@/components/LangProvider";
import { Button, Field, Panel, TextInput } from "@/components/ui";
import { CreateRoomScreen } from "@/components/teacher/CreateRoomScreen";
import { isValidRoomCode } from "@/lib/roomCode";

export default function LandingPage() {
  const { t } = useLang();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function onJoin() {
    const trimmed = code.trim();
    if (!isValidRoomCode(trimmed)) {
      setError(t("landing.invalidCode"));
      return;
    }
    router.push(`/join/${trimmed}`);
  }

  return (
    <main className="min-h-dvh">
      <AppHeader />
      <div className="mx-auto w-full max-w-md px-4 pb-12 pt-6 sm:pt-10">
        <div className="animate-rise text-center">
          <h1 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {t("landing.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-ink-secondary">{t("landing.lead")}</p>
        </div>

        <Panel className="mt-8 flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-ink">{t("landing.joinRoom")}</h2>
          <Field label={t("landing.joinRoomDesc")} error={error}>
            {(a11y) => (
              <TextInput
                {...a11y}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="00000"
                value={code}
                onChange={(e) => {
                  setError("");
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 5));
                }}
                onKeyDown={(e) => e.key === "Enter" && onJoin()}
                className="text-center font-mono text-3xl tracking-[0.3em]"
              />
            )}
          </Field>
          <Button size="lg" onClick={onJoin}>
            {t("landing.join")}
          </Button>
        </Panel>

        <div className="mt-6">
          <CreateRoomScreen />
        </div>
      </div>
    </main>
  );
}
