// GET /api/rooms/[code] — public room state. Returns status + settings only.
// Crucially it does NOT expose conceptId or the host token to clients, so a
// student can never learn which concept is in play. The host (verified by token)
// additionally receives the selected concept so the teacher UI can display it.

import { handler, ok, fail, loadRoom, isHost } from "@/lib/api";
import { rowToConcept } from "@/lib/serialize";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);

    const { room } = ctx;
    const publicRoom = {
      code: room.code,
      status: room.status,
      settings: room.settings,
      createdAt: room.createdAt,
    };

    if (!isHost(req, ctx)) {
      return ok({ room: publicRoom });
    }

    // Host view: include the chosen concept.
    let concept = null;
    if (room.conceptId) {
      const { data } = await ctx.supabase.from("concepts").select("*").eq("id", room.conceptId).maybeSingle();
      concept = data ? rowToConcept(data) : null;
    }
    return ok({ room: { ...publicRoom, conceptId: room.conceptId }, concept });
  });
}
