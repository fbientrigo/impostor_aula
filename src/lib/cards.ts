// Builds the per-client role card payload. This is the single source of truth for
// the app's core security invariant: an impostor's payload NEVER contains the title.
//
// This runs server-side (in the /card API route). Keeping it pure makes the
// invariant directly unit-testable.

import type { CardPayload, Concept, Role, RoomSettings } from "./types";

export interface BuildCardArgs {
  role: Role;
  concept: Pick<Concept, "title" | "category" | "impostorHint">;
  settings: Pick<RoomSettings, "showCategoryToImpostor" | "showHintToImpostor">;
}

export function buildCardPayload({ role, concept, settings }: BuildCardArgs): CardPayload {
  if (role === "student") {
    return {
      role: "student",
      title: concept.title,
      category: concept.category,
    };
  }

  // Impostor: deliberately construct the object WITHOUT the title field.
  const payload: CardPayload = { role: "impostor" };
  if (settings.showCategoryToImpostor) {
    payload.category = concept.category;
  }
  if (settings.showHintToImpostor && concept.impostorHint) {
    payload.hint = concept.impostorHint;
  }
  return payload;
}
