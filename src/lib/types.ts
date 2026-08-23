// Shared domain types for Impostor Aula.
// These mirror the database schema (snake_case in SQL, camelCase in app code —
// conversion happens at the API boundary in src/lib/serialize.ts).

export type RoomStatus =
  | "lobby"
  | "card_reveal"
  | "discussion"
  | "voting"
  | "results";

export type Role = "student" | "impostor";

export type Difficulty = "basic" | "intermediate" | "advanced";

/** Bot skill band. Purely a probability knob (see src/lib/bots.ts). */
export type BotDifficulty = "easy" | "medium" | "hard";

export interface RoomSettings {
  impostorCount: number;
  showCategoryToImpostor: boolean;
  showHintToImpostor: boolean;
  requireVoteJustification: boolean;
  trackTabLeaving: boolean;
  /** 0 disables auto-hide. */
  cardAutoHideSeconds: number;
}

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  conceptId: string | null;
  settings: RoomSettings;
  createdAt: string;
}

export interface Concept {
  id: string;
  category: string;
  title: string;
  explanation: string;
  impostorHint?: string;
  teacherNotes?: string;
  difficulty: Difficulty;
  tags: string[];
  /** Pre-authored, server-only bot response pools. Never sent to students. */
  botResponses?: import("./botResponses").ResponsePool;
}

export interface Participant {
  id: string;
  roomId: string;
  displayName: string;
  role: Role;
  hasSeenCard: boolean;
  awayCount: number;
  reloadedCount: number;
  joinedAt: string;
  /** Server-controlled bot? Humans are false. */
  isBot: boolean;
  /** Skill band for bots; null for humans. */
  botDifficulty: BotDifficulty | null;
}

export interface Vote {
  id: string;
  roomId: string;
  voterParticipantId: string;
  targetParticipantId: string;
  justification?: string;
  createdAt: string;
}

/**
 * What a single client is allowed to see about their own role card.
 * Built server-side. The impostor variant NEVER carries `title`.
 */
export type CardPayload =
  | {
      role: "student";
      title: string;
      category: string;
    }
  | {
      role: "impostor";
      title?: undefined;
      category?: string;
      hint?: string;
    };

/** Lightweight realtime broadcast events: a ping to re-fetch, never the data itself. */
export type RoomEvent =
  | "lobby_update"
  | "round_started"
  | "phase_changed"
  | "vote_update";

export const DEFAULT_SETTINGS: RoomSettings = {
  impostorCount: 1,
  showCategoryToImpostor: true,
  showHintToImpostor: false,
  requireVoteJustification: false,
  trackTabLeaving: true,
  cardAutoHideSeconds: 0,
};
