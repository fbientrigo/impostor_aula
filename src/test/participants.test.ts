import { describe, expect, it } from "vitest";
import { normalizeName, validateDisplayName } from "@/lib/participants";

describe("normalizeName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeName("  Grupo   A  ")).toBe("Grupo A");
  });
});

describe("validateDisplayName", () => {
  it("accepts a fresh, well-formed name", () => {
    expect(validateDisplayName("Ana", ["Beto", "Caro"])).toEqual({ ok: true });
  });

  it("rejects empty names", () => {
    expect(validateDisplayName("   ", []).error).toBe("name_empty");
  });

  it("rejects overly long names", () => {
    expect(validateDisplayName("a".repeat(41), []).error).toBe("name_too_long");
  });

  it("rejects duplicates case-insensitively", () => {
    expect(validateDisplayName("ana", ["Ana"])).toEqual({ ok: false, error: "name_taken" });
    expect(validateDisplayName("  GRUPO a ", ["Grupo A"])).toEqual({ ok: false, error: "name_taken" });
  });
});
