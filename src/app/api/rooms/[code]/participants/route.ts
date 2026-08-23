// GET /api/rooms/[code]/participants — the roster. Names + activity counters are
// public (the teacher dashboard and the student voting list both need them).
// Roles are withheld until the results phase, when they are revealed to everyone.

import { handler, ok, fail, loadRoom } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);

    const { data, error } = await ctx.supabase
      .from("participants")
      .select("*")
      .eq("room_id", ctx.room.id)
      .order("joined_at", { ascending: true });
    if (error) throw error;

    const revealRoles = ctx.room.status === "results";
    const participants = (data ?? []).map((p) => ({
      id: p.id,
      displayName: p.display_name,
      hasSeenCard: p.has_seen_card,
      awayCount: p.away_count,
      reloadedCount: p.reloaded_count,
      joinedAt: p.joined_at,
      isBot: p.is_bot ?? false,
      botDifficulty: p.bot_difficulty ?? null,
      ...(revealRoles ? { role: p.role } : {}),
    }));

    return ok({ participants });
  });
}
