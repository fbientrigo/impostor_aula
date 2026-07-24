"use client";

import { QRCodeSVG } from "qrcode.react";

// Framed QR for projection. Kept on a pure white tile for scan contrast.
export function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  return (
    <div className="inline-block rounded-xl border border-edge bg-white p-4">
      <QRCodeSVG value={value} size={size} level="M" includeMargin={false} />
    </div>
  );
}
