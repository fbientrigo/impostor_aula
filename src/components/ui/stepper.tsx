"use client";

// Horizontal phase indicator for the teacher dashboard: done → current → next.

import { CheckIcon } from "./icons";

export function PhaseIndicator({
  steps,
  currentIndex,
}: {
  steps: { key: string; label: string }[];
  currentIndex: number;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-1">
            {i > 0 ? <span aria-hidden className="mx-1 h-px w-4 bg-edge-strong" /> : null}
            <span
              aria-current={current ? "step" : undefined}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                current
                  ? "bg-leaf text-white"
                  : done
                    ? "text-leaf-deep"
                    : "text-ink-muted"
              }`}
            >
              {done ? <CheckIcon width={14} height={14} /> : null}
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
