"use client";
import { useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/payment";

export default function CostCalculator({ totalPaise, parts }: { totalPaise: number; parts: number[] }) {
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState("0.40");
  const basisPoints = Math.max(0, Math.round((Number(rate) || 0) * 100));
  const estimatedPaise = Math.round((totalPaise * basisPoints) / 10000);
  return <section className="rounded-[14px] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#171a20]">
    <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4 text-left"><span className="flex items-center gap-2 text-sm font-bold"><Calculator size={17} className="text-brand-600" />Payment cost estimate</span><ChevronDown size={17} className={`transition ${open ? "rotate-180" : ""}`} /></button>
    {open && <div className="border-t border-slate-100 p-4 dark:border-white/10"><label className="text-xs font-medium text-slate-500">MDR percentage<input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-white/10" /></label>
      <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5"><p className="text-xs text-slate-500">Single payment</p><p className="mt-1 font-bold">{formatCurrency(totalPaise)}</p><p className="mt-2 text-xs">Est. cost: {formatCurrency(estimatedPaise)}</p></div><div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5"><p className="text-xs text-slate-500">Split payment</p><p className="mt-1 font-bold">{parts.length} payments</p><p className="mt-2 text-xs">{parts.slice(0, 3).map(formatCurrency).join(" · ")}{parts.length > 3 ? " …" : ""}</p></div></div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">Actual MDR and eligibility depend on your bank, PSP, merchant category and applicable UPI rules. Splitting does not guarantee a lower fee.</p></div>}
  </section>;
}
