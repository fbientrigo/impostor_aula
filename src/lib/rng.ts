// Seeded, deterministic pseudo-random number generator.
//
// Bots must behave reproducibly: given the same room/round seed the server
// always produces the same votes, and tests can pin behaviour without mocking.
// This is a tiny, dependency-free PRNG (mulberry32) fed by a string hash
// (xmur3). It is NOT cryptographic — it is only for game simulation. Security
// tokens still use crypto.getRandomValues (see src/lib/tokens.ts).

import type { Rng } from "./roomCode";

/** Hash a string into a 32-bit seed. */
export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32: fast 32-bit PRNG returning a float in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a deterministic RNG from a string seed. The same seed always yields the
 * same sequence, so bot behaviour is reproducible per room/round.
 */
export function makeRng(seed: string): Rng {
  return mulberry32(hashSeed(seed));
}
