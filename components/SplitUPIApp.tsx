"use client";

import { AlertTriangle, ChevronLeft, Eye, EyeOff, Moon, Plus, Settings, Smartphone, Sun, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { calculateProgress, createId, parseRupeesToPaise, splitAmount, validateUPI } from "@/lib/payment";
import { storage } from "@/lib/storage";
import type { PaymentSession, ThemePreference } from "@/lib/types";
import CostCalculator from "./CostCalculator";
import FullscreenQR from "./FullscreenQR";
import InfoCard from "./InfoCard";
import MerchantForm from "./MerchantForm";
import PaymentCard from "./PaymentCard";
import PaymentProgress from "./PaymentProgress";
import RecentSessions from "./RecentSessions";
import SuccessScreen from "./SuccessScreen";

export default function SplitUPIApp() {
  const [name, setName] = useState(""); const [upiId, setUpiId] = useState(""); const [amount, setAmount] = useState("");
  const [note, setNote] = useState(""); const [maxAmount, setMaxAmount] = useState("2000"); const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({}); const [sessions, setSessions] = useState<PaymentSession[]>([]);
  const [session, setSession] = useState<PaymentSession | null>(null); const [activeIndex, setActiveIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false); const [customerMode, setCustomerMode] = useState(false); const [showSuccess, setShowSuccess] = useState(true);
  const [fullscreen, setFullscreen] = useState<number | null>(null); const [warningParts, setWarningParts] = useState<number[] | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false); const [theme, setTheme] = useState<ThemePreference>("system"); const [ready, setReady] = useState(false);

  useEffect(() => {
    const profile = storage.getProfile(); if (profile) { setName(profile.name); setUpiId(profile.upiId); setMaxAmount(String(profile.defaultMaxPaise / 100)); }
    setSessions(storage.getSessions()); setTheme(storage.getTheme()); setReady(true);
  }, []);
  useEffect(() => { if (ready) storage.saveSessions(sessions); }, [sessions, ready]);
  useEffect(() => {
    if (!ready) return; storage.saveTheme(theme);
    const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, [theme, ready]);

  const currentProgress = session ? calculateProgress(session.payments) : null;
  const complete = !!session && currentProgress?.paidCount === session.payments.length;
  const visibleIndex = session ? Math.min(activeIndex, session.payments.length - 1) : 0;
  const setField = (field: string, value: string | boolean) => {
    const setters: Record<string, (v: never) => void> = { name: setName, upiId: setUpiId, amount: setAmount, note: setNote, maxAmount: setMaxAmount, remember: setRemember };
    setters[field]?.(value as never); if (errors[field]) setErrors((old) => ({ ...old, [field]: "" }));
  };
  const validate = () => {
    const next: Record<string, string> = {}; const totalPaise = parseRupeesToPaise(amount); const maxPaise = parseRupeesToPaise(maxAmount);
    if (!name.trim()) next.name = "Enter a merchant name.";
    if (!validateUPI(upiId)) next.upiId = "Enter a valid UPI ID, such as merchant@upi.";
    if (totalPaise === null || totalPaise <= 0) next.amount = "Enter an amount greater than ₹0 (up to 2 decimals).";
    else if (totalPaise > 1000000000) next.amount = "For safety, enter an amount up to ₹1 crore.";
    if (maxPaise === null || maxPaise <= 0) next.maxAmount = "Enter a maximum greater than ₹0.";
    setErrors(next); return { valid: !Object.keys(next).length, totalPaise, maxPaise };
  };
  const createSession = (parts: number[]) => {
    const totalPaise = parseRupeesToPaise(amount)!; const maxPaise = parseRupeesToPaise(maxAmount)!;
    const next: PaymentSession = { id: createId(), createdAt: new Date().toISOString(), merchant: { name: name.trim(), upiId: upiId.trim(), defaultMaxPaise: maxPaise }, note: note.trim(), totalPaise, maxPaise, payments: parts.map((amountPaise) => ({ id: createId(), amountPaise, paid: false })) };
    if (remember) storage.saveProfile(next.merchant); else storage.clearProfile();
    setSession(next); setSessions((old) => [next, ...old.filter((item) => item.id !== next.id)].slice(0, 20)); setActiveIndex(0); setViewAll(false); setShowSuccess(true); setWarningParts(null);
    setTimeout(() => document.getElementById("payment-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const generate = () => { const result = validate(); if (!result.valid || !result.totalPaise || !result.maxPaise) return; const parts = splitAmount(result.totalPaise, result.maxPaise); if (parts.length > 500) { setErrors({ amount: "This would create more than 500 payments. Increase the maximum per payment." }); return; } if (parts.length >= 10) setWarningParts(parts); else createSession(parts); };
  const updateSession = (next: PaymentSession) => { setSession(next); setSessions((old) => [next, ...old.filter((item) => item.id !== next.id)].slice(0, 20)); };
  const togglePaid = (index: number) => { if (!session) return; const payments = session.payments.map((item, i) => i === index ? { ...item, paid: !item.paid } : item); updateSession({ ...session, payments }); if (!payments[index].paid) setShowSuccess(false); };
  const newPayment = () => { setSession(null); setAmount(""); setNote(""); setActiveIndex(0); setViewAll(false); setCustomerMode(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openSession = (item: PaymentSession) => { setSession(item); setName(item.merchant.name); setUpiId(item.merchant.upiId); setMaxAmount(String(item.maxPaise / 100)); setAmount(String(item.totalPaise / 100)); setNote(item.note); setActiveIndex(Math.max(0, item.payments.findIndex((p) => !p.paid))); setViewAll(false); setShowSuccess(true); };
  const deleteSession = (id: string) => { setSessions((old) => old.filter((item) => item.id !== id)); if (session?.id === id) setSession(null); };
  const statusText = useMemo(() => session && session.payments.length > 5 ? "Multiple UPI transactions made within a short period may be subject to bank or UPI risk controls." : "", [session]);

  return <main className="min-h-screen bg-paper text-ink transition-colors dark:bg-[#0f1115] dark:text-slate-100">
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-paper/95 backdrop-blur dark:border-white/10 dark:bg-[#0f1115]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"><button onClick={newPayment} className="flex items-center gap-2.5 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white"><Smartphone size={20} /></span><span><span className="block text-[15px] font-extrabold tracking-tight">SplitUPI</span><span className="block text-[10px] text-slate-500">Smart UPI Split Payments</span></span></button>
        <div className="flex items-center gap-1.5">{session && <button onClick={() => setCustomerMode(!customerMode)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold dark:border-white/10">{customerMode ? <EyeOff size={15} /> : <Eye size={15} />}<span className="hidden sm:inline">{customerMode ? "Exit customer" : "Customer mode"}</span></button>}<button onClick={() => setSettingsOpen(!settingsOpen)} className="rounded-lg border border-slate-200 p-2 dark:border-white/10" aria-label="Settings"><Settings size={17} /></button></div>
      </div>
      {settingsOpen && !customerMode && <div className="absolute right-4 top-14 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#20242c]"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Appearance</p><div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-white/5">{(["light", "dark", "system"] as ThemePreference[]).map((item) => <button key={item} onClick={() => setTheme(item)} className={`rounded-md px-2 py-1.5 text-xs capitalize ${theme === item ? "bg-white font-bold shadow-sm dark:bg-white/10" : "text-slate-500"}`}>{item}</button>)}</div><button onClick={() => { storage.clearProfile(); setRemember(false); }} className="mt-4 flex w-full items-center gap-2 text-xs font-semibold text-red-600"><Trash2 size={14} />Clear saved merchant details</button></div>}
    </header>

    <div className={`mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 ${customerMode ? "max-w-xl" : ""}`}>
      {customerMode && session ? <div id="payment-result"><button onClick={() => setCustomerMode(false)} className="mb-4 flex items-center gap-1 text-sm font-semibold text-slate-500"><ChevronLeft size={17} />Merchant controls</button><PaymentCard session={session} index={visibleIndex} customerMode onTogglePaid={togglePaid} onFullscreen={setFullscreen} onNext={visibleIndex < session.payments.length - 1 ? () => setActiveIndex(visibleIndex + 1) : undefined} /></div> :
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(340px,440px)_minmax(0,1fr)] lg:gap-7">
        <div className="space-y-5"><MerchantForm name={name} upiId={upiId} amount={amount} note={note} maxAmount={maxAmount} remember={remember} errors={errors} onChange={setField} onSubmit={generate} /><InfoCard />{!session && <RecentSessions sessions={sessions} onOpen={openSession} onDelete={deleteSession} onClear={() => setSessions([])} />}</div>
        <div id="payment-result" className="space-y-4 lg:sticky lg:top-20">
          {!session ? <div className="hidden min-h-[520px] items-center justify-center rounded-[14px] border border-dashed border-slate-300 bg-white/50 p-10 text-center dark:border-white/10 dark:bg-white/[.02] lg:flex"><div className="max-w-xs"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-100"><Plus /></span><h2 className="mt-4 font-bold">Your payment split appears here</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Add a bill amount to create secure, standard UPI links and QR codes.</p></div></div> : <>
            {complete && showSuccess ? <SuccessScreen session={session} onNew={newPayment} onView={() => setShowSuccess(false)} /> : <>
              <PaymentProgress session={session} />
              {statusText && <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"><AlertTriangle size={15} className="shrink-0" />{statusText}</p>}
              <div className="flex items-center justify-between"><h2 className="text-sm font-bold">{viewAll ? "All payments" : "Payment checkout"}</h2><button onClick={() => setViewAll(!viewAll)} className="text-xs font-bold text-brand-600 dark:text-brand-100">{viewAll ? "Step-by-step view" : "View all payments"}</button></div>
              {viewAll ? <div className="grid gap-4 xl:grid-cols-2">{session.payments.map((_, index) => <PaymentCard key={session.payments[index].id} session={session} index={index} compact onTogglePaid={togglePaid} onFullscreen={setFullscreen} />)}</div> : <><PaymentCard session={session} index={visibleIndex} onTogglePaid={togglePaid} onFullscreen={setFullscreen} onNext={visibleIndex < session.payments.length - 1 ? () => setActiveIndex(visibleIndex + 1) : undefined} /><div className="flex justify-center gap-1.5">{session.payments.slice(0, 12).map((part, i) => <button aria-label={`Go to payment ${i + 1}`} onClick={() => setActiveIndex(i)} key={part.id} className={`h-2 rounded-full transition-all ${i === visibleIndex ? "w-6 bg-brand-600" : part.paid ? "w-2 bg-emerald-500" : "w-2 bg-slate-300 dark:bg-white/20"}`} />)}</div></>}
              <CostCalculator totalPaise={session.totalPaise} parts={session.payments.map((p) => p.amountPaise)} />
              <button onClick={newPayment} className="w-full rounded-xl border border-slate-200 py-3 text-sm font-bold dark:border-white/10">New payment</button>
            </>}
            <RecentSessions sessions={sessions.filter((item) => item.id !== session.id)} onOpen={openSession} onDelete={deleteSession} onClear={() => setSessions(session ? [session] : [])} />
          </>}
        </div>
      </div>}
    </div>

    {!customerMode && <footer className="mx-auto max-w-7xl border-t border-slate-200 px-4 py-6 text-xs leading-relaxed text-slate-500 dark:border-white/10 sm:px-6"><p>SplitUPI does not process or store payments. Payment QR codes are generated locally using the information you enter. Saved merchant details and session history remain in this browser.</p><p className="mt-2">SplitUPI is an independent payment utility and is not affiliated with NPCI, RBI, BHIM, Google Pay, PhonePe, Paytm or any bank. Payment status is manually recorded and does not represent bank confirmation. Merchants are responsible for complying with applicable provider agreements, UPI rules and regulations.</p></footer>}

    {warningParts && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={() => setWarningParts(null)}><div className="w-full max-w-md rounded-[14px] bg-white p-5 dark:bg-[#20242c]" onClick={(e) => e.stopPropagation()}><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><AlertTriangle size={21} /></span><h2 className="mt-4 text-lg font-bold">Large number of payments</h2><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">This bill requires {warningParts.length} separate payments. Multiple transactions may be inconvenient and may also be subject to UPI or bank transaction limits.</p><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => setWarningParts(null)} className="rounded-xl border border-slate-200 py-3 text-sm font-semibold dark:border-white/10">Go back</button><button onClick={() => createSession(warningParts)} className="rounded-xl bg-brand-600 py-3 text-sm font-bold text-white">Continue anyway</button></div></div></div>}
    {fullscreen !== null && session && <FullscreenQR session={session} index={fullscreen} onClose={() => { setFullscreen(null); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }} />}
  </main>;
}
