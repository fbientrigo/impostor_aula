// Pure presentation helpers (no React, no Supabase) — unit tested in
// src/test/presentation.test.ts.

import type { RoomStatus } from "./types";
import type { MessageKey } from "./i18n";

// The teacher-facing phase sequence shown in the phase indicator.
export const PHASE_STEPS: { status: RoomStatus; label: MessageKey }[] = [
  { status: "lobby", label: "phase.lobby" },
  { status: "card_reveal", label: "phase.card_reveal" },
  { status: "discussion", label: "phase.discussion" },
  { status: "voting", label: "phase.voting" },
  { status: "results", label: "phase.results" },
];

export function phaseStepIndex(status: RoomStatus): number {
  const i = PHASE_STEPS.findIndex((s) => s.status === status);
  return i === -1 ? 0 : i;
}

// Groups a room code as "12 345" so it reads well from the back of the room.
export function formatRoomCode(code: string): string {
  return code.length === 5 ? `${code.slice(0, 2)} ${code.slice(2)}` : code;
}
