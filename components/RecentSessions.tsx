import { CheckCircle2, Clock3, History, Trash2 } from "lucide-react";
import { calculateProgress, formatCurrency } from "@/lib/payment";
import type { PaymentSession } from "@/lib/types";

type Props = { sessions: PaymentSession[]; onOpen: (session: PaymentSession) => void; onDelete: (id: string) => void; onClear: () => void };
export default function RecentSessions({ sessions, onOpen, onDelete, onClear }: Props) {
  if (!sessions.length) return null;
  return <section className="rounded-[14px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#171a20]">
    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-bold"><History size={17} />Recent payment sessions</h2><button type="button" onClick={onClear} className="text-xs font-semibold text-slate-500 hover:text-red-600">Clear history</button></div>
    <div className="mt-3 divide-y divide-slate-100 dark:divide-white/10">{sessions.slice(0, 5).map((session) => { const progress = calculateProgress(session.payments); const complete = progress.paidCount === progress.totalCount; return <div key={session.id} className="group flex items-center gap-2 py-3"><button type="button" onClick={() => onOpen(session)} className="min-w-0 flex-1 text-left"><div className="flex items-center justify-between"><span className="truncate text-sm font-semibold">{session.merchant.name}</span><span className="text-sm font-bold">{formatCurrency(session.totalPaise)}</span></div><div className="mt-1 flex items-center justify-between text-xs text-slate-500"><span className="flex items-center gap-1"><Clock3 size={12} />{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(session.createdAt))}</span><span className={complete ? "text-emerald-600" : ""}>{complete && <CheckCircle2 size={12} className="mr-1 inline" />}{complete ? "Completed" : `${progress.paidCount} / ${progress.totalCount} paid`}</span></div></button><button type="button" onClick={() => onDelete(session.id)} aria-label="Delete session" className="rounded-lg p-2 text-slate-400 opacity-100 hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 size={16} /></button></div>; })}</div>
  </section>;
}
