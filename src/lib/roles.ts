// Role assignment + impostor-count validation. Pure & deterministic via injected RNG.

import type { Role } from "./types";
import type { Rng } from "./roomCode";

export interface Validation {
  ok: boolean;
  error?: string;
}

/**
 * An impostor count is valid when it is a positive integer that still leaves at
 * least one normal student (so the game is playable).
 */
export function validateImpostorCount(
  impostorCount: number,
  participantCount: number,
): Validation {
  if (!Number.isInteger(impostorCount)) {
    return { ok: false, error: "impostor_count_not_integer" };
  }
  if (impostorCount < 1) {
    return { ok: false, error: "impostor_count_too_low" };
  }
  if (participantCount < 2) {
    return { ok: false, error: "not_enough_participants" };
  }
  if (impostorCount >= participantCount) {
    return { ok: false, error: "impostor_count_too_high" };
  }
  return { ok: true };
}

/**
 * Randomly assign `impostorCount` impostors among the given participant ids.
 * Returns a map of participantId -> role. Throws on invalid configuration so
 * callers can't silently produce an unplayable round.
 *
 * Uses a Fisher–Yates shuffle driven by the injected RNG.
 */
export function assignRoles(
  participantIds: string[],
  impostorCount: number,
  rng: Rng = Math.random,
): Record<string, Role> {
  const check = validateImpostorCount(impostorCount, participantIds.length);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const shuffled = [...participantIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const impostorIds = new Set(shuffled.slice(0, impostorCount));
  const roles: Record<string, Role> = {};
  for (const id of participantIds) {
    roles[id] = impostorIds.has(id) ? "impostor" : "student";
  }
  return roles;
}
