// Display-name validation. Names double as group names; uniqueness is
// case-insensitive so "Group A" and "group a" can't both join.

export interface Validation {
  ok: boolean;
  error?: string;
}

export const MAX_NAME_LENGTH = 40;

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** Case/whitespace-insensitive key used for duplicate detection. */
export function nameKey(name: string): string {
  return normalizeName(name).toLowerCase();
}

export function validateDisplayName(name: string, existingNames: string[]): Validation {
  const normalized = normalizeName(name);
  if (normalized.length === 0) {
    return { ok: false, error: "name_empty" };
  }
  if (normalized.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "name_too_long" };
  }
  const existing = new Set(existingNames.map(nameKey));
  if (existing.has(nameKey(normalized))) {
    return { ok: false, error: "name_taken" };
  }
  return { ok: true };
}
