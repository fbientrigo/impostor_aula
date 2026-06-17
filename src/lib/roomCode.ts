// Room code generation. Codes are fixed-length numeric strings so they are easy
// to read aloud and type on a phone. RNG is injectable for deterministic tests.

export type Rng = () => number;

export const ROOM_CODE_LENGTH = 5;

/**
 * Generate a fixed-length numeric room code (leading zeros allowed, e.g. "04821").
 * Uniqueness is enforced at the database layer (the API retries on conflict).
 */
export function generateRoomCode(rng: Rng = Math.random, length = ROOM_CODE_LENGTH): string {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error("Room code length must be a positive integer");
  }
  let code = "";
  for (let i = 0; i < length; i++) {
    const digit = Math.floor(rng() * 10) % 10;
    code += String(digit);
  }
  return code;
}

/** True when `code` is a syntactically valid room code (all digits, right length). */
export function isValidRoomCode(code: string, length = ROOM_CODE_LENGTH): boolean {
  return new RegExp(`^[0-9]{${length}}$`).test(code);
}
