import { Check, Printer, ReceiptText, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/payment";
import type { PaymentSession } from "@/lib/types";

export default function SuccessScreen({ session, onNew, onView }: { session: PaymentSession; onNew: () => void; onView: () => void }) {
  return <section className="animate-enter rounded-[14px] border border-emerald-200 bg-white p-6 text-center shadow-card dark:border-emerald-500/30 dark:bg-[#171a20] sm:p-8">
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><Check size={30} strokeWidth={3} /></span><p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Payment completed</p><h2 className="mt-1 text-4xl font-bold tracking-tight">{formatCurrency(session.totalPaise)}</h2><p className="mt-2 text-sm text-slate-500">{session.payments.length} payments · {session.merchant.name}</p>
    <div className="mx-auto mt-5 max-w-xs divide-y divide-slate-100 rounded-xl bg-slate-50 px-4 dark:divide-white/10 dark:bg-white/5">{session.payments.map((part) => <div className="flex justify-between py-2.5 text-sm" key={part.id}><span>{formatCurrency(part.amountPaise)}</span><Check size={16} className="text-emerald-600" /></div>)}</div>
    <div className="mt-6 grid gap-2 sm:grid-cols-3"><button onClick={onNew} className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white"><RotateCcw size={16} />New payment</button><button onClick={onView} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-white/10"><ReceiptText size={16} />View session</button><button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-white/10"><Printer size={16} />Print summary</button></div>
  </section>;
}
