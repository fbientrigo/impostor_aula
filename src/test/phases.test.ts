import { describe, expect, it } from "vitest";
import { canTransition, nextPhase, PHASES, prevPhase } from "@/lib/phases";

describe("phase ordering", () => {
  it("has the expected order", () => {
    expect(PHASES).toEqual(["lobby", "card_reveal", "discussion", "voting", "results"]);
  });

  it("advances one phase at a time to the end", () => {
    expect(nextPhase("lobby")).toBe("card_reveal");
    expect(nextPhase("card_reveal")).toBe("discussion");
    expect(nextPhase("discussion")).toBe("voting");
    expect(nextPhase("voting")).toBe("results");
    expect(nextPhase("results")).toBeNull();
  });

  it("steps back one phase at a time", () => {
    expect(prevPhase("results")).toBe("voting");
    expect(prevPhase("lobby")).toBeNull();
  });
});

describe("canTransition", () => {
  it("allows adjacent forward and backward moves", () => {
    expect(canTransition("lobby", "card_reveal")).toBe(true);
    expect(canTransition("voting", "discussion")).toBe(true);
  });

  it("rejects skipping phases", () => {
    expect(canTransition("lobby", "voting")).toBe(false);
    expect(canTransition("lobby", "results")).toBe(false);
  });

  it("rejects staying on the same phase", () => {
    expect(canTransition("voting", "voting")).toBe(false);
  });
});
