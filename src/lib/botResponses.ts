// Pre-authored bot response material.
//
// The future teaching pack will ship concept-specific pools (stored in the
// `concepts.bot_responses` JSONB column). This module defines their shape, a
// deterministic picker, and GENERIC fallbacks used when a concept has no
// authored pool yet.
//
// SECURITY: `impostor_safe` responses must never reference the concept title —
// an impostor (human or bot) doesn't know it. The generic pool below is written
// to be title-free, and impostor bots ONLY ever draw from `impostor_safe`
// (enforced in src/lib/bots.ts). Because pools live in the server-only
// `concepts` table, they are never sent to student clients.

import type { Rng } from "./roomCode";

/** The four kinds of pre-authored response. */
export type ResponseKind = "correct" | "plausible" | "incorrect" | "impostor_safe";

/** A concept's response pools. All fields optional; missing kinds fall back. */
export type ResponsePool = Partial<Record<ResponseKind, string[]>>;

/**
 * Generic, concept-agnostic fallbacks (Spanish — the app default). These are
 * deliberately vague so they never leak a specific concept, and short so they
 * fit as a vote justification. Authors override per concept via bot_responses.
 */
export const DEFAULT_BOT_RESPONSES: Required<ResponsePool> = {
  correct: [
    "Sus explicaciones no terminaban de encajar con el concepto.",
    "Dudó justo cuando había que dar detalles concretos.",
    "Se mantuvo demasiado en lo general, como si no lo conociera.",
  ],
  plausible: [
    "No estoy del todo seguro, pero algo no cuadraba.",
    "Me quedó la duda por cómo respondió antes.",
    "Podría ser, aunque no lo tengo claro.",
  ],
  incorrect: [
    "Sentí que se contradijo un poco al explicar.",
    "Me pareció que titubeó más que el resto.",
    "Sus ejemplos me sonaron algo forzados.",
  ],
  impostor_safe: [
    "Coincido con lo que se dijo, aunque prefiero no arriesgarme.",
    "No tengo una certeza fuerte, voy con mi intuición.",
    "Me baso en cómo participó cada quien, nada más.",
  ],
};

/**
 * Merge an authored pool over the generic defaults so every kind is populated.
 * Empty/whitespace entries are dropped.
 */
export function resolveResponsePool(authored?: ResponsePool | null): Required<ResponsePool> {
  const clean = (arr?: string[]) => (arr ?? []).map((s) => s.trim()).filter(Boolean);
  const merged = {} as Required<ResponsePool>;
  for (const kind of ["correct", "plausible", "incorrect", "impostor_safe"] as ResponseKind[]) {
    const authoredKind = clean(authored?.[kind]);
    merged[kind] = authoredKind.length > 0 ? authoredKind : DEFAULT_BOT_RESPONSES[kind];
  }
  return merged;
}

/**
 * Deterministically pick one response of the requested kind. Returns undefined
 * only when the pool for that kind is empty (which can't happen after
 * resolveResponsePool, but the guard keeps callers safe).
 */
export function pickResponse(pool: Required<ResponsePool>, kind: ResponseKind, rng: Rng): string | undefined {
  const arr = pool[kind];
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(rng() * arr.length)];
}
