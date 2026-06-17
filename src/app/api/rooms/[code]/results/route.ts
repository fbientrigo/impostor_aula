// GET /api/rooms/[code]/results — the reveal. Only available once the room is in
// the results phase, at which point everything is public: the concept (with
// explanation + teacher notes), every participant's role, the vote tally, and
// individual vote justifications.

import { handler, ok, fail, loadRoom } from "@/lib/api";
import { rowToConcept, rowToParticipant } from "@/lib/serialize";
import { tallyResults } from "@/lib/votes";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (ctx.room.status !== "results") return fail("not_results_phase", 409);

    const [{ data: conceptRow }, { data: partRows }, { data: voteRows }] = await Promise.all([
      ctx.room.conceptId
        ? ctx.supabase.from("concepts").select("*").eq("id", ctx.room.conceptId).maybeSingle()
        : Promise.resolve({ data: null }),
      ctx.supabase.from("participants").select("*").eq("room_id", ctx.room.id),
      ctx.supabase.from("votes").select("*").eq("room_id", ctx.room.id),
    ]);

    const participants = (partRows ?? []).map(rowToParticipant);
    const votes = (voteRows ?? []).map((v) => ({
      voterParticipantId: v.voter_participant_id,
      targetParticipantId: v.target_participant_id,
      justification: v.justification ?? undefined,
    }));

    const nameById = new Map(participants.map((p) => [p.id, p.displayName]));
    const tally = tallyResults(votes, participants);

    return ok({
      concept: conceptRow ? rowToConcept(conceptRow) : null,
      impostors: participants.filter((p) => p.role === "impostor").map((p) => p.displayName),
      tally: tally.rows,
      impostorCaught: tally.impostorCaught,
      votes: votes.map((v) => ({
        voter: nameById.get(v.voterParticipantId) ?? "?",
        target: nameById.get(v.targetParticipantId) ?? "?",
        justification: v.justification,
      })),
    });
  });
}
