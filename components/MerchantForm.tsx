"use client";

import { AlertCircle, IndianRupee, LockKeyhole } from "lucide-react";
import { formatCurrency, parseRupeesToPaise, splitAmount } from "@/lib/payment";

type Props = {
  name: string; upiId: string; amount: string; note: string; maxAmount: string; remember: boolean;
  errors: Record<string, string>; busy?: boolean;
  onChange: (field: string, value: string | boolean) => void;
  onSubmit: () => void;
};

const quickAmounts = [500, 1000, 2000, 5000, 10000];
const maxOptions = [500, 1000, 1500, 2000];

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"><AlertCircle size={13} />{message}</p> : null;
}

export default function MerchantForm({ name, upiId, amount, note, maxAmount, remember, errors, onChange, onSubmit }: Props) {
  const paise = parseRupeesToPaise(amount);
  const maxPaise = parseRupeesToPaise(maxAmount);
  const preview = paise && maxPaise ? splitAmount(paise, maxPaise) : [];
  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-[#20242c] dark:focus:ring-brand-500/20";

  return <section className="rounded-[14px] border border-slate-200/80 bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#171a20] sm:p-6">
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-brand-600 dark:text-brand-100">Create a payment</p>
      <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Split a bill in seconds</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter the details your customer will see.</p>
    </div>
    <div className="space-y-4">
      <label className="block text-sm font-medium">Merchant name
        <input className={inputClass} value={name} onChange={(e) => onChange("name", e.target.value)} placeholder="Gupta Electronics" maxLength={80} />
        <FieldError message={errors.name} />
      </label>
      <label className="block text-sm font-medium">UPI ID
        <input className={inputClass} value={upiId} onChange={(e) => onChange("upiId", e.target.value)} placeholder="guptaelectronics@upi" inputMode="email" autoCapitalize="none" spellCheck={false} />
        <FieldError message={errors.upiId} />
      </label>
      <label className="block text-sm font-medium">Bill amount
        <div className="relative mt-2"><IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input className={`${inputClass} mt-0 pl-10 text-xl font-semibold`} value={amount} onChange={(e) => onChange("amount", e.target.value)} placeholder="5,650" inputMode="decimal" /></div>
        <FieldError message={errors.amount} />
      </label>
      <div className="flex flex-wrap gap-2" aria-label="Quick amounts">
        {quickAmounts.map((value) => <button key={value} type="button" onClick={() => onChange("amount", String(value))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:text-slate-300">₹{value.toLocaleString("en-IN")}</button>)}
      </div>
      <label className="block text-sm font-medium">Optional note
        <input className={inputClass} value={note} onChange={(e) => onChange("note", e.target.value)} placeholder="Invoice #1042" maxLength={80} />
      </label>
      <div>
        <div className="flex items-end justify-between gap-3"><label className="block flex-1 text-sm font-medium">Maximum per payment
          <div className="relative mt-2"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">₹</span><input className={`${inputClass} mt-0 pl-9`} value={maxAmount} onChange={(e) => onChange("maxAmount", e.target.value)} inputMode="decimal" /></div>
        </label></div>
        <div className="mt-2 flex flex-wrap gap-2">{maxOptions.map((value) => <button type="button" key={value} onClick={() => onChange("maxAmount", String(value))} className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${Number(maxAmount) === value ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"}`}>₹{value.toLocaleString("en-IN")}</button>)}</div>
        <FieldError message={errors.maxAmount} />
      </div>
      {preview.length > 0 && <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
        <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-300">Smart split preview</span><strong className="text-sm">{preview.length} payment{preview.length !== 1 && "s"}</strong></div>
        <div className="mt-3 flex flex-wrap gap-2">{preview.slice(0, 6).map((part, i) => <span key={i} className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold shadow-sm dark:bg-[#20242c]">{formatCurrency(part)}</span>)}{preview.length > 6 && <span className="px-2 py-1.5 text-xs text-slate-500">+{preview.length - 6} more</span>}</div>
      </div>}
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
        <span><span className="block text-sm font-medium">Remember merchant details</span><span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><LockKeyhole size={12} />Saved only in this browser</span></span>
        <input type="checkbox" checked={remember} onChange={(e) => onChange("remember", e.target.checked)} className="h-5 w-5 accent-brand-600" />
      </label>
      <button type="button" onClick={onSubmit} className="w-full rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 active:scale-[.99]">Generate payment split</button>
    </div>
  </section>;
}
