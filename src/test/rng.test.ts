import { describe, expect, it } from "vitest";
import { hashSeed, makeRng, mulberry32 } from "@/lib/rng";

describe("makeRng — deterministic PRNG", () => {
  it("produces the same sequence for the same seed", () => {
    const a = makeRng("room-42:concept-7:voting");
    const b = makeRng("room-42:concept-7:voting");
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = Array.from({ length: 10 }, makeRng("seed-a"));
    const b = Array.from({ length: 10 }, makeRng("seed-b"));
    expect(a).not.toEqual(b);
  });

  it("returns floats in [0, 1)", () => {
    const rng = makeRng("range-check");
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("hashSeed is stable and 32-bit unsigned", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
    expect(hashSeed("abc")).toBeGreaterThanOrEqual(0);
    expect(hashSeed("abc")).toBeLessThan(2 ** 32);
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
  });

  it("mulberry32 is a pure function of its seed", () => {
    const r1 = mulberry32(123);
    const r2 = mulberry32(123);
    expect(r1()).toBe(r2());
  });
});
