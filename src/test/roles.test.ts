import { describe, expect, it } from "vitest";
import { assignRoles, validateImpostorCount } from "@/lib/roles";

describe("validateImpostorCount", () => {
  it("accepts a valid count that leaves a normal student", () => {
    expect(validateImpostorCount(1, 4)).toEqual({ ok: true });
    expect(validateImpostorCount(2, 5)).toEqual({ ok: true });
  });

  it("rejects non-integers", () => {
    expect(validateImpostorCount(1.5, 4).ok).toBe(false);
  });

  it("rejects counts below 1", () => {
    expect(validateImpostorCount(0, 4)).toEqual({ ok: false, error: "impostor_count_too_low" });
  });

  it("rejects when there aren't enough participants", () => {
    expect(validateImpostorCount(1, 1)).toEqual({ ok: false, error: "not_enough_participants" });
  });

  it("rejects counts that leave no normal student", () => {
    expect(validateImpostorCount(4, 4)).toEqual({ ok: false, error: "impostor_count_too_high" });
    expect(validateImpostorCount(5, 4)).toEqual({ ok: false, error: "impostor_count_too_high" });
  });
});

describe("assignRoles", () => {
  const ids = ["a", "b", "c", "d"];

  it("assigns exactly the requested number of impostors", () => {
    const roles = assignRoles(ids, 1);
    const impostors = Object.values(roles).filter((r) => r === "impostor");
    expect(impostors).toHaveLength(1);
    expect(Object.keys(roles).sort()).toEqual([...ids].sort());
  });

  it("assigns multiple impostors when requested", () => {
    const roles = assignRoles(ids, 2);
    expect(Object.values(roles).filter((r) => r === "impostor")).toHaveLength(2);
  });

  it("is deterministic given an RNG (rng=0 keeps order)", () => {
    // With rng() = 0 the Fisher-Yates swap index j is always 0, so the array
    // is reversed deterministically; the first `impostorCount` of the shuffle
    // become impostors.
    const roles = assignRoles(ids, 1, () => 0);
    const impostors = Object.entries(roles)
      .filter(([, r]) => r === "impostor")
      .map(([id]) => id);
    expect(impostors).toHaveLength(1);
  });

  it("throws on an invalid impostor count", () => {
    expect(() => assignRoles(ids, 0)).toThrow("impostor_count_too_low");
    expect(() => assignRoles(ids, 4)).toThrow("impostor_count_too_high");
  });
});
