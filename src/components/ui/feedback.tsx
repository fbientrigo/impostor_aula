"use client";

import type { ReactNode } from "react";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-ink-secondary" role="status" aria-live="polite">
      <span
        aria-hidden
        className="h-5 w-5 animate-spin rounded-full border-2 border-edge-strong border-t-leaf"
      />
      {label ? <span>{label}</span> : <span className="sr-only">…</span>}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-sm font-medium text-coral">
      {children}
    </p>
  );
}

// Quiet placeholder for lists with nothing in them yet.
export function EmptyState({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-ink-muted">
      {icon ? <span aria-hidden className="text-ink-muted">{icon}</span> : null}
      <p>{children}</p>
    </div>
  );
}

// Pulsing dot + text for "waiting for something remote" states.
export function WaitingHint({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2 text-sm text-ink-secondary" aria-live="polite">
      <span aria-hidden className="h-2 w-2 animate-soft-pulse rounded-full bg-leaf" />
      {children}
    </p>
  );
}
