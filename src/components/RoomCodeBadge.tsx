"use client";

// Big, readable room-code display for projecting to the class.

export function RoomCodeBadge({ code, label }: { code: string; label?: string }) {
  return (
    <div className="text-center">
      {label ? <p className="mb-1 text-sm font-medium uppercase tracking-wide text-slate-500">{label}</p> : null}
      <p className="font-mono text-5xl font-bold tracking-[0.3em] text-brand-700">{code}</p>
    </div>
  );
}
