"use client";
import { useState } from "react";
import { BookOpen, X } from "lucide-react";

export default function InfoCard() {
  const [learn, setLearn] = useState(false);
  return <section className="rounded-[14px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#171a20]">
    <div className="flex items-start gap-3"><span className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-100"><BookOpen size={18} /></span><div className="min-w-0"><h3 className="text-sm font-bold">Does MDR apply to your business?</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">Eligibility and MDR treatment may depend on current RBI, NPCI, bank and acquiring-provider rules.</p><button type="button" onClick={() => setLearn(true)} className="mt-2 text-xs font-bold text-brand-600 dark:text-brand-100">Learn more</button></div></div>
    {learn && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={() => setLearn(false)}><div className="w-full max-w-md rounded-[14px] bg-white p-5 shadow-2xl dark:bg-[#20242c]" onClick={(e) => e.stopPropagation()}><div className="flex justify-between"><h3 className="font-bold">UPI costs and eligibility</h3><button onClick={() => setLearn(false)}><X size={20} /></button></div><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300"><li>UPI MDR rules and government policies may change.</li><li>Merchant categories can receive different treatment.</li><li>Transaction limits and fee structures vary by bank and provider.</li><li>Verify current conditions with your acquiring bank or payment provider.</li></ul></div></div>}
  </section>;
}
