import { CheckCircle2 } from "lucide-react";
import { calculateProgress, formatCurrency } from "@/lib/payment";
import type { PaymentSession } from "@/lib/types";

export default function PaymentProgress({ session }: { session: PaymentSession }) {
  const progress = calculateProgress(session.payments);
  const complete = progress.paidCount === progress.totalCount;
  return <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-card dark:border-white/10 dark:bg-[#171a20] sm:p-5">
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-xs font-medium text-slate-500">Total bill</p><p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(session.totalPaise)}</p></div>
      <div className={`rounded-lg px-3 py-2 text-right ${complete ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 dark:bg-white/5"}`}><p className="text-xs">{complete ? "Payment complete" : "Marked paid"}</p><p className="font-bold">{formatCurrency(progress.paidPaise)}</p></div>
    </div>
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress.percent}%` }} /></div>
    <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{progress.paidCount} / {progress.totalCount} payments completed</span><span>{formatCurrency(session.totalPaise - progress.paidPaise)} remaining</span></div>
    <p className="mt-4 flex gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400"><CheckCircle2 size={14} className="mt-px shrink-0" />Payment status is marked manually and is not verified by your bank.</p>
  </div>;
}
