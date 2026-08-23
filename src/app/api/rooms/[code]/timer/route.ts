// POST /api/rooms/[code]/timer — host controls the shared classroom timer.
// Timer state lives inside rooms.settings (jsonb), so no schema migration is
// required. Students only receive the public deadline/duration and calculate the
// countdown locally from the server-authored ISO timestamp.

import { handler, ok, fail, loadRoom, isHost } from "@/lib/api";
import { broadcastRoomEvent } from "@/lib/realtime";
import type { TimerDurationSeconds } from "@/lib/types";

const DURATIONS: TimerDurationSeconds[] = [30, 120, 300];
const ACTIVE_PHASES = new Set(["card_reveal", "discussion", "voting"]);

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (!isHost(req, ctx)) return fail("not_host", 403);

    const body = (await req.json().catch(() => ({}))) as {
      action?: "start" | "stop";
      durationSeconds?: TimerDurationSeconds;
    };

    if (body.action !== "start" && body.action !== "stop") {
      return fail("invalid_timer_action", 400);
    }

    let timerEndsAt: string | null = null;
    let timerDurationSeconds: TimerDurationSeconds | null = null;

    if (body.action === "start") {
      if (!ACTIVE_PHASES.has(ctx.room.status)) return fail("timer_not_available", 409);
      if (!body.durationSeconds || !DURATIONS.includes(body.durationSeconds)) {
        return fail("invalid_timer_duration", 400);
      }

      timerDurationSeconds = body.durationSeconds;
      timerEndsAt = new Date(Date.now() + body.durationSeconds * 1000).toISOString();
    }

    const settings = {
      ...ctx.room.settings,
      timerEndsAt,
      timerDurationSeconds,
    };

    const { error } = await ctx.supabase.from("rooms").update({ settings }).eq("id", ctx.room.id);
    if (error) throw error;

    await broadcastRoomEvent(code, "timer_changed");
    return ok({ timerEndsAt, timerDurationSeconds });
  });
}
