// Phase ordering + transition rules. The teacher drives the room forward (and may
// step back one phase for flexibility); skipping phases is rejected.

import type { RoomStatus } from "./types";

export const PHASES: RoomStatus[] = [
  "lobby",
  "card_reveal",
  "discussion",
  "voting",
  "results",
];

export function phaseIndex(status: RoomStatus): number {
  return PHASES.indexOf(status);
}

export function nextPhase(status: RoomStatus): RoomStatus | null {
  const i = phaseIndex(status);
  if (i < 0 || i >= PHASES.length - 1) return null;
  return PHASES[i + 1];
}

export function prevPhase(status: RoomStatus): RoomStatus | null {
  const i = phaseIndex(status);
  if (i <= 0) return null;
  return PHASES[i - 1];
}

/**
 * A transition is allowed only between adjacent phases (one step forward or back).
 * Jumps such as lobby -> voting are rejected. Same-phase is not a transition.
 */
export function canTransition(from: RoomStatus, to: RoomStatus): boolean {
  const a = phaseIndex(from);
  const b = phaseIndex(to);
  if (a < 0 || b < 0) return false;
  return Math.abs(b - a) === 1;
}
