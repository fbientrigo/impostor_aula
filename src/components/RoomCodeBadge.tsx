"use client";

// Big, readable room-code display for projecting to the class.

import { formatRoomCode } from "@/lib/presentation";

export function RoomCodeBadge({ code, label, size = "lg" }: { code: string; label?: string; size?: "md" | "lg" }) {
  return (
    <div className="text-center">
      {label ? (
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">{label}</p>
      ) : null}
      <p
        aria-label={code.split("").join(" ")}
        className={`font-mono font-bold tracking-[0.15em] text-leaf-deep ${
          size === "lg" ? "text-5xl sm:text-6xl" : "text-3xl"
        }`}
      >
        {formatRoomCode(code)}
      </p>
    </div>
  );
}
