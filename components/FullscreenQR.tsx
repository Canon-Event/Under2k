"use client";
import { ExternalLink, Minimize2, Sun } from "lucide-react";
import { formatCurrency, generateUPILink } from "@/lib/payment";
import type { PaymentSession } from "@/lib/types";
import QRCodeDisplay from "./QRCodeDisplay";

export default function FullscreenQR({ session, index, onClose }: { session: PaymentSession; index: number; onClose: () => void }) {
  const payment = session.payments[index];
  const link = generateUPILink(session.merchant.upiId, session.merchant.name, payment.amountPaise, session.note);
  const brighten = async () => { try { await document.documentElement.requestFullscreen?.(); } catch {} };
  return <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-auto bg-white p-5 text-ink dark:bg-[#0f1115] dark:text-white">
    <div className="absolute left-4 right-4 top-4 flex justify-between"><button onClick={brighten} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-white/10"><Sun size={16} />Increase brightness</button><button onClick={onClose} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-white/10"><Minimize2 size={16} />Exit</button></div>
    <p className="text-sm font-semibold text-slate-500">{session.merchant.name}</p><p className="mt-4 text-xs uppercase tracking-[.15em] text-slate-400">Pay</p><h2 className="mt-1 text-4xl font-bold tracking-tight">{formatCurrency(payment.amountPaise)}</h2><div className="mt-6"><QRCodeDisplay value={link} size={280} /></div><p className="mt-4 text-sm font-medium">Scan with any supported UPI app</p><p className="mt-2 text-sm text-slate-500">UPI ID: {session.merchant.upiId}</p><p className="mt-1 text-xs text-slate-400">Payment {index + 1} of {session.payments.length}</p><button type="button" onClick={() => window.location.assign(link)} className="mt-6 flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white"><ExternalLink size={17} />Open UPI app</button>
  </div>;
}
