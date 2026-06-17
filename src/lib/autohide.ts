// Pure state machine for the role card's visibility. The DOM wiring
// (visibilitychange, blur, setInterval ticks) lives in useCardVisibility; this
// module just decides the next visibility state, making it directly testable.

export interface CardVisState {
  visible: boolean;
  /** Seconds until auto-hide; null when auto-hide is disabled or card is hidden. */
  secondsLeft: number | null;
}

export type CardVisEvent =
  | { type: "reveal" } // student chose to view the card
  | { type: "hide" } // tab hidden / window blur / manual hide
  | { type: "tick" }; // one second elapsed while visible

export interface CardVisOpts {
  /** 0 disables auto-hide. */
  autoHideSeconds: number;
}

export function initialCardVisState(): CardVisState {
  return { visible: false, secondsLeft: null };
}

export function cardVisibilityReducer(
  state: CardVisState,
  event: CardVisEvent,
  opts: CardVisOpts,
): CardVisState {
  switch (event.type) {
    case "reveal": {
      const enabled = opts.autoHideSeconds > 0;
      return { visible: true, secondsLeft: enabled ? opts.autoHideSeconds : null };
    }
    case "hide": {
      return { visible: false, secondsLeft: null };
    }
    case "tick": {
      if (!state.visible || state.secondsLeft === null) {
        return state; // auto-hide disabled or already hidden — nothing to count
      }
      const next = state.secondsLeft - 1;
      if (next <= 0) {
        return { visible: false, secondsLeft: null };
      }
      return { visible: true, secondsLeft: next };
    }
    default:
      return state;
  }
}
