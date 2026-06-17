import { describe, expect, it } from "vitest";
import { cardVisibilityReducer, initialCardVisState } from "@/lib/autohide";

describe("cardVisibilityReducer", () => {
  it("starts hidden", () => {
    expect(initialCardVisState()).toEqual({ visible: false, secondsLeft: null });
  });

  it("reveals with no countdown when auto-hide is disabled", () => {
    const state = cardVisibilityReducer(initialCardVisState(), { type: "reveal" }, { autoHideSeconds: 0 });
    expect(state).toEqual({ visible: true, secondsLeft: null });
  });

  it("reveals with a countdown when auto-hide is enabled", () => {
    const state = cardVisibilityReducer(initialCardVisState(), { type: "reveal" }, { autoHideSeconds: 3 });
    expect(state).toEqual({ visible: true, secondsLeft: 3 });
  });

  it("counts down and hides after the configured seconds", () => {
    const opts = { autoHideSeconds: 2 };
    let state = cardVisibilityReducer(initialCardVisState(), { type: "reveal" }, opts);
    state = cardVisibilityReducer(state, { type: "tick" }, opts);
    expect(state).toEqual({ visible: true, secondsLeft: 1 });
    state = cardVisibilityReducer(state, { type: "tick" }, opts);
    expect(state).toEqual({ visible: false, secondsLeft: null });
  });

  it("ignores ticks when auto-hide is disabled", () => {
    const opts = { autoHideSeconds: 0 };
    let state = cardVisibilityReducer(initialCardVisState(), { type: "reveal" }, opts);
    state = cardVisibilityReducer(state, { type: "tick" }, opts);
    expect(state).toEqual({ visible: true, secondsLeft: null });
  });

  it("hides immediately on a hide event (tab hidden / blur)", () => {
    const opts = { autoHideSeconds: 5 };
    let state = cardVisibilityReducer(initialCardVisState(), { type: "reveal" }, opts);
    state = cardVisibilityReducer(state, { type: "hide" }, opts);
    expect(state).toEqual({ visible: false, secondsLeft: null });
  });

  it("ignores ticks while hidden", () => {
    const opts = { autoHideSeconds: 5 };
    const state = cardVisibilityReducer(initialCardVisState(), { type: "tick" }, opts);
    expect(state).toEqual({ visible: false, secondsLeft: null });
  });
});
