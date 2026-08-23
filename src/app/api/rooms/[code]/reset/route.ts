// POST /api/rooms/[code]/reset — host starts a fresh round: clears votes, resets
// roles/seen-card, clears any classroom timer, and returns the room to the lobby
// while keeping the same participants. Host only.

import { handler, ok, fail, loadRoom, isHost } from "@/lib/api";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (!isHost(req, ctx)) return fail("not_host", 403);

    await ctx.supabase.from("votes").delete().eq("room_id", ctx.room.id);
    await ctx.supabase
      .from("participants")
      .update({ role: "student", has_seen_card: false })
      .eq("room_id", ctx.room.id);

    const settings = {
      ...ctx.room.settings,
      timerEndsAt: null,
      timerDurationSeconds: null,
    };

    const { error } = await ctx.supabase
      .from("rooms")
      .update({ status: "lobby", concept_id: null, settings })
      .eq("id", ctx.room.id);
    if (error) throw error;

    await broadcastRoomEvent(code, "phase_changed");
    return ok({ status: "lobby" });
  });
}
