// GET /api/rooms/[code]/card — returns the requesting participant's OWN role card,
// built server-side. This is the enforcement point for the core invariant: an
// impostor's response never contains the concept title (see buildCardPayload).
// Participant identity is proven by the x-participant-id / x-participant-secret
// headers.

import { handler, ok, fail, loadRoom, authParticipant } from "@/lib/api";
import { buildCardPayload } from "@/lib/cards";
import { broadcastRoomEvent } from "@/lib/realtime";
import { rowToConcept } from "@/lib/serialize";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (ctx.room.status === "lobby") return fail("round_not_started", 409);

    const me = await authParticipant(req, ctx.supabase, ctx.room.id);
    if (!me) return fail("not_authorized", 401);
    if (!ctx.room.conceptId) return fail("no_concept", 409);

    const { data: conceptRow, error } = await ctx.supabase
      .from("concepts")
      .select("*")
      .eq("id", ctx.room.conceptId)
      .maybeSingle();
    if (error) throw error;
    if (!conceptRow) return fail("concept_not_found", 404);

    const concept = rowToConcept(conceptRow);
    const payload = buildCardPayload({
      role: me.role as "student" | "impostor",
      concept,
      settings: ctx.room.settings,
    });

    // Mark the card as seen (first view) so the teacher dashboard can track it.
    if (!me.row.has_seen_card) {
      await ctx.supabase.from("participants").update({ has_seen_card: true }).eq("id", me.id);
      await broadcastRoomEvent(code, "lobby_update");
    }

    return ok({ card: payload });
  });
}
