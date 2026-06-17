// POST /api/rooms/[code]/away — soft classroom safeguard. The student client posts
// here when the tab is left ({type:'away'}) or the page is reloaded
// ({type:'reload'}); we bump the matching counter so the teacher dashboard can
// surface activity. Not exam-locking — purely informational.

import { handler, ok, fail, loadRoom, authParticipant } from "@/lib/api";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);

    const me = await authParticipant(req, ctx.supabase, ctx.room.id);
    if (!me) return fail("not_authorized", 401);

    const body = (await req.json().catch(() => ({}))) as { type?: "away" | "reload" };
    const isReload = body.type === "reload";
    const column = isReload ? "reloaded_count" : "away_count";
    const current = Number(me.row[column] ?? 0);

    const { error } = await ctx.supabase
      .from("participants")
      .update({ [column]: current + 1 })
      .eq("id", me.id);
    if (error) throw error;

    await broadcastRoomEvent(code, "lobby_update");
    return ok({ ok: true });
  });
}
