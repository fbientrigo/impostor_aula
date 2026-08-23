// POST /api/rooms/[code]/bots — the host adds server-controlled bot(s) to the
// lobby. Bots are ordinary participant rows (is_bot=true) with a difficulty
// band; the server drives them. No browser, no second Supabase client, no LLM.
//
// Body: { difficulty: "easy" | "medium" | "hard", count?: number }
// `count` (default 1, capped) is a developer/testing convenience for rapidly
// filling a room; the classroom UI only ever adds one at a time.
//
// Host only, lobby only. Bots joined mid-round would corrupt role assignment.

import { handler, ok, fail, loadRoom, isHost } from "@/lib/api";
import { botDisplayName, isBotDifficulty } from "@/lib/bots";
import { randomToken } from "@/lib/tokens";
import { broadcastRoomEvent } from "@/lib/realtime";

const MAX_BOTS_PER_CALL = 8;

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  return handler(async () => {
    const { code } = await params;
    const ctx = await loadRoom(code);
    if (!ctx) return fail("room_not_found", 404);
    if (!isHost(req, ctx)) return fail("not_host", 403);
    if (ctx.room.status !== "lobby") return fail("room_not_joinable", 409);

    const body = (await req.json().catch(() => ({}))) as { difficulty?: string; count?: number };
    if (!isBotDifficulty(body.difficulty)) return fail("invalid_difficulty", 400);
    const difficulty = body.difficulty;

    const count = Math.max(1, Math.min(MAX_BOTS_PER_CALL, Math.floor(body.count ?? 1)));

    // Current names so generated bot names stay unique (case-insensitive index).
    const { data: existing, error: exErr } = await ctx.supabase
      .from("participants")
      .select("display_name")
      .eq("room_id", ctx.room.id);
    if (exErr) throw exErr;

    const names = (existing ?? []).map((p) => p.display_name as string);
    const added: { id: string; displayName: string; botDifficulty: typeof difficulty }[] = [];

    for (let i = 0; i < count; i++) {
      const displayName = botDisplayName(difficulty, names);
      const { data, error } = await ctx.supabase
        .from("participants")
        .insert({
          room_id: ctx.room.id,
          display_name: displayName,
          role: "student",
          secret: randomToken(), // required column; a bot never uses it (server-driven)
          is_bot: true,
          bot_difficulty: difficulty,
          has_seen_card: true, // bots don't view cards; keeps the "seen" tally honest
        })
        .select("id")
        .single();

      // Lost a race on the unique name index — retry the loop iteration.
      if (error?.code === "23505") {
        i--;
        continue;
      }
      if (error) throw error;

      names.push(displayName);
      added.push({ id: data.id, displayName, botDifficulty: difficulty });
    }

    await broadcastRoomEvent(code, "lobby_update");
    return ok({ added }, 201);
  });
}
