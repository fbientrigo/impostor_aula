// Concept library. Host-gated: the caller must prove they host a room (via
// ?roomCode= + x-host-token). This keeps the concept titles out of students'
// reach entirely — a student in a room cannot enumerate the library to find the
// active concept.

import { handler, ok, fail, loadRoom, isHost, type RoomContext } from "@/lib/api";
import { rowToConcept } from "@/lib/serialize";
import type { Difficulty } from "@/lib/types";
import { NextResponse } from "next/server";

// Returns the room context if the caller is the host, otherwise an error Response
// to return directly.
async function requireHost(req: Request): Promise<RoomContext | NextResponse> {
  const url = new URL(req.url);
  const roomCode = url.searchParams.get("roomCode");
  if (!roomCode) return fail("room_code_required", 400);
  const ctx = await loadRoom(roomCode);
  if (!ctx) return fail("room_not_found", 404);
  if (!isHost(req, ctx)) return fail("not_host", 403);
  return ctx;
}

export async function GET(req: Request) {
  return handler(async () => {
    const auth = await requireHost(req);
    if (auth instanceof NextResponse) return auth;

    const { data, error } = await auth.supabase
      .from("concepts")
      .select("*")
      .order("category", { ascending: true })
      .order("title", { ascending: true });
    if (error) throw error;
    return ok({ concepts: (data ?? []).map(rowToConcept) });
  });
}

export async function POST(req: Request) {
  return handler(async () => {
    const auth = await requireHost(req);
    if (auth instanceof NextResponse) return auth;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const category = String(body.category ?? "").trim();
    const title = String(body.title ?? "").trim();
    const explanation = String(body.explanation ?? "").trim();
    if (!category || !title || !explanation) {
      return fail("missing_required_fields", 400);
    }
    const difficulty = (["basic", "intermediate", "advanced"] as Difficulty[]).includes(body.difficulty as Difficulty)
      ? (body.difficulty as Difficulty)
      : "basic";

    const { data, error } = await auth.supabase
      .from("concepts")
      .insert({
        category,
        title,
        explanation,
        impostor_hint: body.impostorHint ? String(body.impostorHint) : null,
        teacher_notes: body.teacherNotes ? String(body.teacherNotes) : null,
        difficulty,
        tags: Array.isArray(body.tags) ? (body.tags as string[]) : [],
      })
      .select("*")
      .single();
    if (error) throw error;
    return ok({ concept: rowToConcept(data) }, 201);
  });
}
