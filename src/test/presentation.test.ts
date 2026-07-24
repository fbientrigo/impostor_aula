import { describe, expect, it } from "vitest";
import { formatRoomCode, phaseStepIndex, PHASE_STEPS } from "@/lib/presentation";

describe("phaseStepIndex", () => {
  it("maps each known status to its position", () => {
    PHASE_STEPS.forEach((step, i) => {
      expect(phaseStepIndex(step.status)).toBe(i);
    });
  });
});

describe("formatRoomCode", () => {
  it("groups a 5-digit code as XX XXX", () => {
    expect(formatRoomCode("12345")).toBe("12 345");
  });

  it("returns other lengths unchanged", () => {
    expect(formatRoomCode("123")).toBe("123");
  });
});
