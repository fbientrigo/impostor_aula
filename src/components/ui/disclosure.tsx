"use client";

// Collapsible section for secondary content (e.g., round settings). Keeps
// advanced options out of the way without hiding them in another route.

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDownIcon } from "./icons";

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <div className="rounded-lg border border-edge">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-ink-secondary transition-colors hover:bg-paper hover:text-ink"
      >
        {summary}
        <ChevronDownIcon className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div id={panelId} className="border-t border-edge px-4 py-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}
