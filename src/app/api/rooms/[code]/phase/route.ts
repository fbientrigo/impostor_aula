// POST /api/rooms/[code]/phase — host advances/steps the round between adjacent
// phases (card_reveal <-> discussion <-> voting <-> results). The lobby ->
// card_reveal transition is handled by /start (it assigns roles); going back to
// lobby is handled by /reset (it clears the round). Host only.

import { handler, ok, fail, loadRoom, isHost } from "@/lib/api";
import { canTransition } from "@/lib/phases";
import { broadcastRoomEvent } from "@/lib/realtime";
import type { RoomStatus } from "@/lib/types";

const CONTROLLABLE: RoomStatus[] = ["card_reveal", "discussion", "voting", "results"];

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (!isHost(req, ctx)) return fail("not_host", 403);

    const body = (await req.json().catch(() => ({}))) as { to?: RoomStatus };
    const to = body.to;
    if (!to) return fail("target_required", 400);

    // Round-control transitions only; lobby is entered/left via start/reset.
    if (!CONTROLLABLE.includes(ctx.room.status) || !CONTROLLABLE.includes(to)) {
      return fail("invalid_transition", 400);
    }
    if (!canTransition(ctx.room.status, to)) return fail("invalid_transition", 400);

    const { error } = await ctx.supabase.from("rooms").update({ status: to }).eq("id", ctx.room.id);
    if (error) throw error;

    await broadcastRoomEvent(code, "phase_changed");
    return ok({ status: to });
  });
}
