"use client";

// Balatro-style role card: the visual centre of the game.
//
// Interaction architecture (reproduced from the genre, not copied CSS):
//   deal-in  → the card springs up into place on mount
//   tilt     → pointer/touch position maps to a restrained 3D rotation
//   glare    → a soft highlight tracks the pointer, low opacity
//   settle   → releasing the pointer springs the card back to rest
//
// Desktop leans on pointer 3D tilt + glare; touch gets a gentler tilt and no
// hover dependency. Everything collapses to a calm, static card when the user
// prefers reduced motion. The tone (leaf = student, coral = impostor) carries
// the role colour but never the role MEANING alone — CardViewer pairs it with
// an icon and a label.

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Props {
  tone: "leaf" | "coral";
  children: ReactNode;
  className?: string;
}

interface TiltState {
  rx: number;
  ry: number;
  gx: number;
  gy: number;
  active: boolean;
}

const REST: TiltState = { rx: 0, ry: 0, gx: 50, gy: 50, active: false };

export function BalatroCard({ tone, children, className = "" }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltState>(REST);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    // Restrained: gentler on touch than with a mouse.
    const maxDeg = e.pointerType === "touch" ? 6 : 10;
    setTilt({
      ry: (px - 0.5) * 2 * maxDeg,
      rx: -(py - 0.5) * 2 * maxDeg,
      gx: px * 100,
      gy: py * 100,
      active: true,
    });
  }

  function settle() {
    setTilt((t) => ({ ...t, rx: 0, ry: 0, active: false }));
  }

  const cardStyle: CSSProperties | undefined = reduced
    ? undefined
    : {
        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        // Consumed by the .balatro-glare pseudo layer.
        ["--glare-x" as string]: `${tilt.gx}%`,
        ["--glare-y" as string]: `${tilt.gy}%`,
        ["--glare-opacity" as string]: tilt.active ? "0.35" : "0",
      };

  const toneClass = tone === "coral" ? "bg-coral" : "bg-leaf";

  return (
    <div className={`balatro-scene ${reduced ? "animate-card-reveal" : "animate-card-deal"} ${className}`}>
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={settle}
        onPointerCancel={settle}
        onPointerUp={settle}
        style={cardStyle}
        className={`balatro-card ${reduced ? "" : "balatro-card--motion"} relative overflow-hidden rounded-2xl p-7 text-center text-white shadow-xl ${toneClass}`}
      >
        <div className="balatro-card__content">{children}</div>
        {reduced ? null : <span aria-hidden className="balatro-glare" />}
      </div>
    </div>
  );
}
