// POST /api/rooms/[code]/phase — host advances/steps the round between adjacent
// phases (card_reveal <-> discussion <-> voting <-> results). The lobby ->
// card_reveal transition is handled by /start (it assigns roles); going back to
// lobby is handled by /reset (it clears the round). Host only.

import { handler, ok, fail, loadRoom, isHost } from "@/lib/api";
import { canTransition } from "@/lib/phases";
import { broadcastRoomEvent } from "@/lib/realtime";
import { makeRng } from "@/lib/rng";
import { runBotVotes, type BotRosterEntry } from "@/lib/bots";
import type { ResponsePool } from "@/lib/botResponses";
import type { Room, RoomStatus } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

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

    // Bots vote automatically the moment voting opens. Deterministic per round
    // (seeded by room + concept), so the same room replays identically and
    // tests are reproducible. Upsert on the one-vote-per-voter constraint means
    // a back-and-forth voting <-> results toggle never double-counts a bot.
    if (to === "voting") {
      await castBotVotes(ctx.supabase, ctx.room);
    }

    await broadcastRoomEvent(code, "phase_changed");
    return ok({ status: to });
  });
}

/** Server-driven bot voting. No-op when the room contains no bots. */
async function castBotVotes(supabase: SupabaseClient, room: Room): Promise<void> {
  const { data: parts, error: pErr } = await supabase
    .from("participants")
    .select("id, role, is_bot, bot_difficulty")
    .eq("room_id", room.id);
  if (pErr) throw pErr;

  const roster: BotRosterEntry[] = (parts ?? []).map((p) => ({
    id: p.id,
    isImpostor: p.role === "impostor",
    isBot: !!p.is_bot,
    difficulty: p.bot_difficulty ?? null,
  }));
  if (!roster.some((r) => r.isBot)) return;

  // Concept-specific response pools live server-side; read the raw column so
  // they never travel to a browser.
  let responses: ResponsePool | null = null;
  if (room.conceptId) {
    const { data: conceptRow } = await supabase
      .from("concepts")
      .select("bot_responses")
      .eq("id", room.conceptId)
      .maybeSingle();
    responses = (conceptRow?.bot_responses ?? null) as ResponsePool | null;
  }

  const rng = makeRng(`${room.id}:${room.conceptId ?? "none"}:voting`);
  const votes = runBotVotes(roster, {
    rng,
    requireJustification: room.settings.requireVoteJustification,
    responses,
  });
  if (votes.length === 0) return;

  const { error: vErr } = await supabase.from("votes").upsert(
    votes.map((v) => ({
      room_id: room.id,
      voter_participant_id: v.voterId,
      target_participant_id: v.targetId,
      justification: v.justification ?? null,
    })),
    { onConflict: "room_id,voter_participant_id" },
  );
  if (vErr) throw vErr;
}
