"use client";
import { Minimize2 } from "lucide-react";
import { formatCurrency, generateUPILink } from "@/lib/payment";
import type { PaymentSession } from "@/lib/types";
import QRCodeDisplay from "./QRCodeDisplay";

export default function FullscreenQR({ session, index, onClose }: { session: PaymentSession; index: number; onClose: () => void }) {
  const payment = session.payments[index];
  const link = generateUPILink(session.merchant.upiId, session.merchant.name, payment.amountPaise, session.note);
  return <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-auto bg-white p-5 text-ink dark:bg-[#0f1115] dark:text-white">
    <button onClick={onClose} className="absolute right-4 top-4 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-white/10"><Minimize2 size={16} />Exit fullscreen</button>
    <p className="text-lg font-bold">{session.merchant.name}</p><p className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-slate-400">Payment {index + 1} of {session.payments.length}</p><h2 className="mt-2 text-5xl font-extrabold tracking-tight sm:text-6xl">{formatCurrency(payment.amountPaise)}</h2><div className="mt-8"><QRCodeDisplay value={link} size={Math.min(320, typeof window === "undefined" ? 280 : window.innerWidth - 48)} /></div>
  </div>;
}
