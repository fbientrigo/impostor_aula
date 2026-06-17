"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  return (
    <div className="inline-block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <QRCodeSVG value={value} size={size} level="M" includeMargin={false} />
    </div>
  );
}
