// Realtime channel naming + server-side broadcast.
//
// Clients subscribe to the broadcast channel `room:{code}`. After a mutation, an
// API route calls broadcastRoomEvent() to ping subscribers, which then re-fetch
// the relevant GET route. The payload is intentionally trivial — never the data
// itself — so nothing sensitive travels over the anon-key realtime connection.

import type { RoomEvent } from "./types";

export function roomChannelName(code: string): string {
  return `room:${code}`;
}

/**
 * Broadcast a "something changed" event to a room channel via Supabase's server
 * broadcast HTTP endpoint. Fire-and-forget: failures are logged but never break
 * the API request (realtime is a convenience layer; clients also poll).
 */
export async function broadcastRoomEvent(code: string, event: RoomEvent): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return;

  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        messages: [{ topic: roomChannelName(code), event, payload: {} }],
      }),
    });
  } catch (err) {
    console.warn("broadcastRoomEvent failed", err);
  }
}
