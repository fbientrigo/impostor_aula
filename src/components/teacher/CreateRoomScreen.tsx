"use client";

// Teacher entry point: creates a room, stores the host token in this browser,
// and navigates to the host dashboard. Presented as the landing page's
// secondary path — students join above it.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { Button, ErrorText } from "@/components/ui";
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
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-edge-strong p-5 text-center">
      <p className="text-sm text-ink-secondary">{t("landing.createRoomDesc")}</p>
      <Button variant="secondary" onClick={onCreate} disabled={creating}>
        {creating ? t("create.creating") : t("landing.createRoom")}
      </Button>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
