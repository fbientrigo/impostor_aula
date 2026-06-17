// Shared helpers for API route handlers: JSON responses, room lookup, and the
// two flavours of token auth (host token, participant secret).

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceClient } from "./supabase/server";
import { rowToRoom } from "./serialize";
import { safeEqual } from "./tokens";
import type { Room } from "./types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Wraps a handler so thrown errors become a clean 500 instead of crashing. */
export function handler(fn: () => Promise<Response>) {
  return fn().catch((err) => {
    console.error(err);
    const message = err instanceof Error ? err.message : "internal_error";
    return fail(message, 500);
  });
}

export interface RoomContext {
  supabase: SupabaseClient;
  room: Room;
  /** The raw row, used when the host token must be checked. */
  row: { host_token: string };
}

/** Loads a room by code or returns null (route maps null -> 404). */
export async function loadRoom(code: string): Promise<RoomContext | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("rooms").select("*").eq("code", code).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { supabase, room: rowToRoom(data), row: { host_token: data.host_token } };
}

export function isHost(req: Request, ctx: RoomContext): boolean {
  return safeEqual(req.headers.get("x-host-token"), ctx.row.host_token);
}

/**
 * Verifies a participant's identity headers against the DB. Returns the
 * participant row on success, or null on missing/invalid credentials.
 */
export async function authParticipant(
  req: Request,
  supabase: SupabaseClient,
  roomId: string,
): Promise<{ id: string; role: string; row: Record<string, unknown> } | null> {
  const participantId = req.headers.get("x-participant-id");
  const secret = req.headers.get("x-participant-secret");
  if (!participantId || !secret) return null;

  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("id", participantId)
    .eq("room_id", roomId)
    .maybeSingle();
  if (error) throw error;
  if (!data || !safeEqual(secret, data.secret)) return null;

  return { id: data.id, role: data.role, row: data };
}
