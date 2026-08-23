// DELETE /api/rooms/[code]/bots/[botId] — the host removes a bot from the lobby
// before the round starts. Only bots can be removed here (never a human
// participant), and only while the room is in the lobby.

import { handler, ok, fail, loadRoom, isHost } from "@/lib/api";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function DELETE(req: Request, { params }: { params: Promise<{ code: string; botId: string }> }) {
  return handler(async () => {
    const { code, botId } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (!isHost(req, ctx)) return fail("not_host", 403);
    if (ctx.room.status !== "lobby") return fail("room_locked", 409);

    // Confirm the target is a bot in this room before deleting.
    const { data: target, error: tErr } = await ctx.supabase
      .from("participants")
      .select("id, is_bot")
      .eq("id", botId)
      .eq("room_id", ctx.room.id)
      .maybeSingle();
    if (tErr) throw tErr;
    if (!target) return fail("participant_not_found", 404);
    if (!target.is_bot) return fail("not_a_bot", 400);

    const { error } = await ctx.supabase.from("participants").delete().eq("id", botId).eq("room_id", ctx.room.id);
    if (error) throw error;

    await broadcastRoomEvent(code, "lobby_update");
    return ok({ ok: true });
  });
}
