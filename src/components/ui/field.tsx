"use client";

import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const control =
  "w-full rounded-lg border border-edge-strong bg-surface px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-leaf focus:ring-2 focus:ring-leaf-soft";

export function Label({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink-secondary">
      {children}
    </label>
  );
}

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${control} text-lg ${className}`} {...props} />;
}

export function TextArea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${control} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${control} ${className}`} {...props} />;
}

// Label + input + associated error in one accessible unit.
export function Field({
  label,
  error,
  children,
  id,
}: {
  label: ReactNode;
  error?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode;
  id?: string;
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  return (
    <div>
      <Label htmlFor={fieldId}>{label}</Label>
      {children(error ? { id: fieldId, "aria-invalid": true, "aria-describedby": errorId } : { id: fieldId })}
      {error ? (
        <p id={errorId} className="mt-1 text-sm font-medium text-coral">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// A labelled switch row for boolean settings.
export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-medium text-ink-secondary">{label}</span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="h-6 w-11 rounded-full bg-edge-strong transition-colors peer-checked:bg-leaf peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-leaf"
        />
        <span
          aria-hidden
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5"
        />
      </span>
    </label>
  );
}

// Labelled numeric input row for compact settings.
export function NumberRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-20 rounded-lg border border-edge-strong px-3 py-2 text-center text-ink outline-none focus:border-leaf focus:ring-2 focus:ring-leaf-soft"
      />
    </div>
  );
}
