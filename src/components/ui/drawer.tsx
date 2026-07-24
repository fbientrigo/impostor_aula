"use client";

// Navigation drawer: slides in from the right, traps focus, closes on
// Escape or overlay click. Contents are provided by the caller (AppHeader
// composes them per role) so this stays a pure presentation component.

import type { ReactNode } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { IconButton } from "./button";
import { CloseIcon } from "./icons";

export function Drawer({
  open,
  onClose,
  title,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const trapRef = useFocusTrap(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] animate-rise flex-col bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <p className="font-display text-lg font-bold text-ink">{title}</p>
          <IconButton label={closeLabel} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{children}</div>
      </div>
    </div>
  );
}

// Standard drawer entry: icon + label, full-width touch target.
export function DrawerItem({
  icon,
  onClick,
  children,
  tone = "default",
}: {
  icon?: ReactNode;
  onClick: () => void;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-base font-medium transition-colors ${
        tone === "danger" ? "text-coral hover:bg-coral-soft" : "text-ink-secondary hover:bg-paper hover:text-ink"
      }`}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </button>
  );
}
