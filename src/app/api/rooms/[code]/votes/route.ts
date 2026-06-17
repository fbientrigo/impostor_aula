// Votes.
//  POST  — a participant casts/updates their vote during the voting phase.
//  GET   — vote tally; available live to the host, and to everyone at results.

import { handler, ok, fail, loadRoom, isHost, authParticipant } from "@/lib/api";
import { validateVote, countVotes } from "@/lib/votes";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (ctx.room.status !== "voting") return fail("not_voting_phase", 409);

    const me = await authParticipant(req, ctx.supabase, ctx.room.id);
    if (!me) return fail("not_authorized", 401);

    const body = (await req.json().catch(() => ({}))) as {
      targetParticipantId?: string;
      justification?: string;
    };

    const check = validateVote(
      {
        voterParticipantId: me.id,
        targetParticipantId: body.targetParticipantId ?? "",
        justification: body.justification,
      },
      ctx.room.settings,
    );
    if (!check.ok) return fail(check.error!, 400);

    // Target must be a real participant in this room.
    const { data: target, error: tErr } = await ctx.supabase
      .from("participants")
      .select("id")
      .eq("id", body.targetParticipantId)
      .eq("room_id", ctx.room.id)
      .maybeSingle();
    if (tErr) throw tErr;
    if (!target) return fail("target_not_found", 404);

    // One vote per voter — upsert on the unique (room_id, voter) constraint.
    const { error } = await ctx.supabase.from("votes").upsert(
      {
        room_id: ctx.room.id,
        voter_participant_id: me.id,
        target_participant_id: body.targetParticipantId,
        justification: body.justification?.trim() || null,
      },
      { onConflict: "room_id,voter_participant_id" },
    );
    if (error) throw error;

    await broadcastRoomEvent(code, "vote_update");
    return ok({ ok: true });
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);

    const allowed = ctx.room.status === "results" || isHost(req, ctx);
    if (!allowed) return fail("not_authorized", 403);

    const { data, error } = await ctx.supabase
      .from("votes")
      .select("target_participant_id")
      .eq("room_id", ctx.room.id);
    if (error) throw error;

    const votes = (data ?? []).map((v) => ({ targetParticipantId: v.target_participant_id }));
    return ok({ counts: countVotes(votes), total: votes.length });
  });
}
