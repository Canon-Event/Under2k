"use client";

import { Check, CheckCircle2, ChevronRight, Copy, Expand, ExternalLink, Printer, Share2, Undo2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency, generateUPILink } from "@/lib/payment";
import type { PaymentSession } from "@/lib/types";
import QRCodeDisplay from "./QRCodeDisplay";

type Props = {
  session: PaymentSession; index: number; compact?: boolean; customerMode?: boolean;
  onTogglePaid: (index: number) => void; onNext?: () => void; onFullscreen: (index: number) => void;
};

export default function PaymentCard({ session, index, compact = false, customerMode = false, onTogglePaid, onNext, onFullscreen }: Props) {
  const [copied, setCopied] = useState(false);
  const payment = session.payments[index];
  const link = generateUPILink(session.merchant.upiId, session.merchant.name, payment.amountPaise, session.note);
  const total = session.payments.length;
  const copy = async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const share = async () => {
    const text = `${session.merchant.name}\nPayment ${index + 1} of ${total}\nAmount: ${formatCurrency(payment.amountPaise)}\nUPI Payment Link: ${link}`;
    try { if (navigator.share) await navigator.share({ title: "UPI payment", text }); else { await navigator.clipboard.writeText(text); setCopied(true); } } catch { /* share cancelled */ }
  };
  return <article className={`print-slip animate-enter rounded-[14px] border bg-white shadow-card transition dark:bg-[#171a20] ${payment.paid ? "border-emerald-300 dark:border-emerald-500/40" : "border-slate-200 dark:border-white/10"} ${compact ? "p-4" : "p-5 sm:p-6"}`}>
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-500">Payment {index + 1} of {total}</p><h2 className={`${compact ? "text-2xl" : "text-3xl"} mt-1 font-bold tracking-tight`}>{formatCurrency(payment.amountPaise)}</h2></div>
      {payment.paid && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><CheckCircle2 size={14} />Paid</span>}
    </div>
    <button type="button" onClick={() => onFullscreen(index)} className="mx-auto mt-5 block cursor-zoom-in" aria-label="Open QR fullscreen"><QRCodeDisplay value={link} size={compact ? 150 : 208} /></button>
    <div className="mt-4 text-center"><p className="font-semibold">{session.merchant.name}</p><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{session.merchant.upiId}</p>{session.note && <p className="mt-1 text-xs text-slate-400">{session.note}</p>}</div>
    <div className="no-print mt-5 grid grid-cols-2 gap-2">
      <button type="button" onClick={() => window.location.assign(link)} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700"><ExternalLink size={17} />Open UPI app</button>
      {!customerMode && <><button type="button" onClick={copy} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold dark:border-white/10">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy link"}</button><button type="button" onClick={share} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold dark:border-white/10"><Share2 size={15} />Share</button>
      <button type="button" onClick={() => onTogglePaid(index)} className={`col-span-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${payment.paid ? "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>{payment.paid ? <Undo2 size={17} /> : <CheckCircle2 size={17} />}{payment.paid ? "Undo paid status" : "Mark as paid"}</button>
      <button type="button" onClick={() => onFullscreen(index)} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500"><Expand size={15} />Fullscreen</button><button type="button" onClick={() => window.print()} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500"><Printer size={15} />Print slip</button></>}
    </div>
    {onNext && <button type="button" onClick={onNext} className="no-print mt-3 flex w-full items-center justify-center gap-1 py-2 text-sm font-bold text-brand-600 dark:text-brand-100">Next payment <ChevronRight size={17} /></button>}
  </article>;
}
