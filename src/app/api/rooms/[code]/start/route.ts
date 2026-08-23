// POST /api/rooms/[code]/start — host commits the concept + settings, roles are
// assigned randomly server-side, and the room advances to card_reveal. Host only.

import { handler, ok, fail, loadRoom, isHost } from "@/lib/api";
import { assignRoles, validateImpostorCount } from "@/lib/roles";
import { DEFAULT_SETTINGS, type RoomSettings } from "@/lib/types";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (!isHost(req, ctx)) return fail("not_host", 403);
    if (ctx.room.status !== "lobby") return fail("round_already_started", 409);

    const body = (await req.json().catch(() => ({}))) as {
      conceptId?: string;
      settings?: Partial<RoomSettings>;
    };
    if (!body.conceptId) return fail("concept_required", 400);

    const settings: RoomSettings = { ...DEFAULT_SETTINGS, ...ctx.room.settings, ...(body.settings ?? {}) };

    // Verify the concept exists.
    const { data: concept, error: cErr } = await ctx.supabase
      .from("concepts")
      .select("id")
      .eq("id", body.conceptId)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!concept) return fail("concept_not_found", 404);

    // Load participants and validate the impostor count for this group size.
    const { data: parts, error: pErr } = await ctx.supabase
      .from("participants")
      .select("id, is_bot")
      .eq("room_id", ctx.room.id);
    if (pErr) throw pErr;
    const ids = (parts ?? []).map((p) => p.id);
    const isBotById = new Map((parts ?? []).map((p) => [p.id as string, !!p.is_bot]));

    const valid = validateImpostorCount(settings.impostorCount, ids.length);
    if (!valid.ok) return fail(valid.error!, 400);

    // Assign roles and persist them. Bots count toward room size and can become
    // impostor like anyone else. Bots never view a card, so they start "seen"
    // (keeps the teacher's seen-card tally honest); humans reset to unseen.
    const roles = assignRoles(ids, settings.impostorCount);
    await Promise.all(
      Object.entries(roles).map(([id, role]) =>
        ctx.supabase
          .from("participants")
          .update({ role, has_seen_card: isBotById.get(id) ?? false })
          .eq("id", id),
      ),
    );

    const { error: rErr } = await ctx.supabase
      .from("rooms")
      .update({ status: "card_reveal", concept_id: body.conceptId, settings })
      .eq("id", ctx.room.id);
    if (rErr) throw rErr;

    await broadcastRoomEvent(code, "round_started");
    return ok({ status: "card_reveal" });
  });
}
