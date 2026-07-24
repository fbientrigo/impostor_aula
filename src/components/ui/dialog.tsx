"use client";

// Confirmation dialog for deliberate/destructive actions. Focus-trapped,
// Escape cancels, overlay click cancels.

import { useId } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const trapRef = useFocusTrap(open, onCancel);
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 bg-ink/40" onClick={onCancel} />
      <div
        ref={trapRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-sm animate-card-reveal rounded-xl border border-edge bg-surface p-5 shadow-xl"
      >
        <h2 id={titleId} className="font-display text-xl font-bold text-ink">
          {title}
        </h2>
        <p className="mt-2 text-ink-secondary">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
