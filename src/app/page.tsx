"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Panel, TextInput } from "@/components/ui";
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
      <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 md:grid-cols-2">
        <CreateRoomScreen />

        <Panel className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold">{t("landing.joinRoom")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("landing.joinRoomDesc")}</p>
          </div>
          <TextInput
            inputMode="numeric"
            placeholder={t("landing.codePlaceholder")}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
            onKeyDown={(e) => e.key === "Enter" && onJoin()}
            className="text-center font-mono text-2xl tracking-[0.3em]"
          />
          <Button variant="secondary" onClick={onJoin}>
            {t("landing.join")}
          </Button>
          <ErrorText>{error}</ErrorText>
        </Panel>
      </div>
    </main>
  );
}
