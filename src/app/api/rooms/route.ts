// POST /api/rooms — create a room. Returns the room code + host token (stored by
// the teacher's browser to authorize host-only actions). The concept and final
// settings are chosen later in the lobby and committed via /start.

import { handler, ok, fail } from "@/lib/api";
import { getServiceClient } from "@/lib/supabase/server";
import { generateRoomCode } from "@/lib/roomCode";
import { randomToken } from "@/lib/tokens";
import { rowToRoom } from "@/lib/serialize";
import { DEFAULT_SETTINGS, type RoomSettings } from "@/lib/types";

export async function POST(req: Request) {
  return handler(async () => {
    const body = (await req.json().catch(() => ({}))) as { settings?: Partial<RoomSettings> };
    const settings: RoomSettings = { ...DEFAULT_SETTINGS, ...(body.settings ?? {}) };
    const hostToken = randomToken();
    const supabase = getServiceClient();

    // Retry on the small chance of a code collision (unique constraint).
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = generateRoomCode();
      const { data, error } = await supabase
        .from("rooms")
        .insert({ code, status: "lobby", settings, host_token: hostToken })
        .select("*")
        .single();

      if (!error && data) {
        return ok({ code, hostToken, room: rowToRoom(data) }, 201);
      }
      // 23505 = unique_violation -> try another code; anything else is fatal.
      if (error && error.code !== "23505") throw error;
    }
    return fail("could_not_allocate_code", 503);
  });
}
