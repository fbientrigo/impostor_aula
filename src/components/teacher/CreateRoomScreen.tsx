"use client";

// Teacher entry point: creates a room, stores the host token in this browser, and
// navigates to the host dashboard.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText, Panel } from "@/components/ui";
import { createRoom } from "@/lib/client";
import { setHostToken } from "@/lib/storage";

export function CreateRoomScreen() {
  const { t } = useLang();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function onCreate() {
    setCreating(true);
    setError("");
    try {
      const { code, hostToken } = await createRoom();
      setHostToken(code, hostToken);
      router.push(`/host/${code}`);
    } catch {
      setError(t("common.error"));
      setCreating(false);
    }
  }

  return (
    <Panel className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">{t("landing.createRoom")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("landing.createRoomDesc")}</p>
      </div>
      <Button onClick={onCreate} disabled={creating}>
        {creating ? t("create.creating") : t("landing.createRoom")}
      </Button>
      <ErrorText>{error}</ErrorText>
    </Panel>
  );
}
