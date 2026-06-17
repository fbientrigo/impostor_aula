// POST /api/rooms/[code]/join — a student joins the lobby with a display/group
// name. Returns an opaque participant id + secret the browser stores to prove
// identity on later requests (card fetch, voting, away events).

import { handler, ok, fail, loadRoom } from "@/lib/api";
import { randomToken } from "@/lib/tokens";
import { validateDisplayName, normalizeName } from "@/lib/participants";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (ctx.room.status !== "lobby") return fail("room_not_joinable", 409);

    const body = (await req.json().catch(() => ({}))) as { displayName?: string };
    const rawName = body.displayName ?? "";

    const { data: existing, error: exErr } = await ctx.supabase
      .from("participants")
      .select("display_name")
      .eq("room_id", ctx.room.id);
    if (exErr) throw exErr;

    const check = validateDisplayName(rawName, (existing ?? []).map((p) => p.display_name));
    if (!check.ok) return fail(check.error!, 400);

    const secret = randomToken();
    const { data, error } = await ctx.supabase
      .from("participants")
      .insert({
        room_id: ctx.room.id,
        display_name: normalizeName(rawName),
        role: "student",
        secret,
      })
      .select("id")
      .single();

    // Lost the race against the case-insensitive unique index.
    if (error?.code === "23505") return fail("name_taken", 409);
    if (error) throw error;

    await broadcastRoomEvent(code, "lobby_update");
    return ok({ participantId: data.id, secret }, 201);
  });
}
