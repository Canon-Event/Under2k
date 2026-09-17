"use client";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodeDisplay({ value, size = 208 }: { value: string; size?: number }) {
  return <div className="inline-flex rounded-xl border border-slate-200 bg-white p-3 shadow-sm" aria-label="UPI payment QR code">
    <QRCodeSVG value={value} size={size} level="M" bgColor="#ffffff" fgColor="#111318" marginSize={1} />
  </div>;
}
