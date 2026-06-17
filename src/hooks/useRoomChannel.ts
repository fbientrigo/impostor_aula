"use client";

// Subscribes to the room's Realtime broadcast channel and invokes `onEvent` (a
// re-fetch) whenever something changes. Realtime is best-effort: a low-frequency
// poll runs alongside it so the UI still updates if Realtime isn't configured.

import { useEffect, useRef } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { roomChannelName } from "@/lib/realtime";
import type { RoomEvent } from "@/lib/types";

const POLL_MS = 4000;
const EVENTS: RoomEvent[] = ["lobby_update", "round_started", "phase_changed", "vote_update"];

export function useRoomChannel(code: string | null, onEvent: () => void) {
  const cb = useRef(onEvent);
  cb.current = onEvent;

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    const fire = () => {
      if (!cancelled) cb.current();
    };

    // Realtime broadcast (if env configured).
    const supabase = getBrowserClient();
    const channel = supabase?.channel(roomChannelName(code));
    if (channel) {
      for (const event of EVENTS) {
        channel.on("broadcast", { event }, fire);
      }
      channel.subscribe();
    }

    // Polling safety net.
    const interval = setInterval(fire, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, [code]);
}
