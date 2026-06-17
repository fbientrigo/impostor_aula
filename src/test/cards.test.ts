import { describe, expect, it } from "vitest";
import { buildCardPayload } from "@/lib/cards";

const concept = {
  title: "Oxímetro de pulso",
  category: "Monitoreo",
  impostorHint: "Se coloca en el dedo",
};

const baseSettings = {
  showCategoryToImpostor: true,
  showHintToImpostor: true,
};

describe("buildCardPayload — normal student", () => {
  it("returns the exact title and category", () => {
    const payload = buildCardPayload({ role: "student", concept, settings: baseSettings });
    expect(payload).toEqual({
      role: "student",
      title: "Oxímetro de pulso",
      category: "Monitoreo",
    });
  });
});

describe("buildCardPayload — impostor with category enabled", () => {
  it("includes the category but never the title", () => {
    const payload = buildCardPayload({
      role: "impostor",
      concept,
      settings: { showCategoryToImpostor: true, showHintToImpostor: false },
    });
    expect(payload.role).toBe("impostor");
    expect(payload.category).toBe("Monitoreo");
    expect("title" in payload).toBe(false);
    expect(payload).not.toHaveProperty("hint");
  });
});

describe("buildCardPayload — impostor with category disabled", () => {
  it("omits both category and title", () => {
    const payload = buildCardPayload({
      role: "impostor",
      concept,
      settings: { showCategoryToImpostor: false, showHintToImpostor: false },
    });
    expect(payload).toEqual({ role: "impostor" });
  });
});

describe("buildCardPayload — impostor hint gating", () => {
  it("includes the hint only when enabled and present", () => {
    const withHint = buildCardPayload({
      role: "impostor",
      concept,
      settings: { showCategoryToImpostor: false, showHintToImpostor: true },
    });
    expect(withHint.role === "impostor" && withHint.hint).toBe("Se coloca en el dedo");

    expect(
      buildCardPayload({
        role: "impostor",
        concept: { ...concept, impostorHint: undefined },
        settings: { showCategoryToImpostor: false, showHintToImpostor: true },
      }),
    ).toEqual({ role: "impostor" });
  });
});

describe("security invariant — impostor never receives the concept title", () => {
  it("holds across every setting combination", () => {
    for (const showCategoryToImpostor of [true, false]) {
      for (const showHintToImpostor of [true, false]) {
        const payload = buildCardPayload({
          role: "impostor",
          concept,
          settings: { showCategoryToImpostor, showHintToImpostor },
        });
        const serialized = JSON.stringify(payload);
        expect(serialized).not.toContain(concept.title);
        expect("title" in payload).toBe(false);
      }
    }
  });
});
