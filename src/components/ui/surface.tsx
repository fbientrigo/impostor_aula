import type { ReactNode } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-edge bg-surface p-5 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

// Small section label used above lists and groups.
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`font-handwritten text-xs text-ink-muted ${className}`}>
      {children}
    </h3>
  );
}

// Screen-level heading with the cursive display voice.
export function ScreenTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-ink">{children}</h2>
      {sub ? <p className="mt-1 text-ink-secondary">{sub}</p> : null}
    </div>
  );
}
