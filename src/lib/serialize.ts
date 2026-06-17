// Maps snake_case database rows to the camelCase domain types used throughout the
// app. `settings` is stored as a jsonb blob already in camelCase (it's a value
// object), so it passes through untouched.

import type { Concept, Participant, Room, RoomSettings, Vote } from "./types";
import { DEFAULT_SETTINGS } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function rowToRoom(row: any): Room {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    conceptId: row.concept_id ?? null,
    settings: { ...DEFAULT_SETTINGS, ...(row.settings as Partial<RoomSettings>) },
    createdAt: row.created_at,
  };
}

export function rowToConcept(row: any): Concept {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    explanation: row.explanation,
    impostorHint: row.impostor_hint ?? undefined,
    teacherNotes: row.teacher_notes ?? undefined,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
  };
}

export function rowToParticipant(row: any): Participant {
  return {
    id: row.id,
    roomId: row.room_id,
    displayName: row.display_name,
    role: row.role,
    hasSeenCard: row.has_seen_card,
    awayCount: row.away_count,
    reloadedCount: row.reloaded_count,
    joinedAt: row.joined_at,
  };
}

export function rowToVote(row: any): Vote {
  return {
    id: row.id,
    roomId: row.room_id,
    voterParticipantId: row.voter_participant_id,
    targetParticipantId: row.target_participant_id,
    justification: row.justification ?? undefined,
    createdAt: row.created_at,
  };
}
