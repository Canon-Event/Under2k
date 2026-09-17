"use client";

import { AlertTriangle, ChevronDown, ChevronLeft, Eye, EyeOff, Plus, Settings, Smartphone, Trash2, WifiOff, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { calculateProgress, createId, paiseToInput, parseRupeesToPaise, splitAmount, splitEqually, validateUPI } from "@/lib/payment";
import { storage } from "@/lib/storage";
import type { PaymentSession, SplitMode, ThemePreference } from "@/lib/types";
import { useWakeLock } from "@/hooks/useWakeLock";
import CostCalculator from "./CostCalculator";
import FullscreenQR from "./FullscreenQR";
import InfoCard from "./InfoCard";
import MerchantForm from "./MerchantForm";
import PaymentCard from "./PaymentCard";
import PaymentProgress from "./PaymentProgress";
import RecentSessions from "./RecentSessions";
import SuccessScreen from "./SuccessScreen";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function SplitUPIApp() {
  const [name, setName] = useState(""); const [upiId, setUpiId] = useState(""); const [upiIds, setUpiIds] = useState<string[]>([""]); const [amount, setAmount] = useState("");
  const [note, setNote] = useState(""); const [maxAmount, setMaxAmount] = useState("1999"); const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({}); const [sessions, setSessions] = useState<PaymentSession[]>([]);
  const [session, setSession] = useState<PaymentSession | null>(null); const [activeIndex, setActiveIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false); const [counterMode, setCounterMode] = useState(false); const [showSuccess, setShowSuccess] = useState(true);
  const [fullscreen, setFullscreen] = useState<number | null>(null); const [warningParts, setWarningParts] = useState<number[] | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false); const [theme, setTheme] = useState<ThemePreference>("system"); const [ready, setReady] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false); const [editingMerchant, setEditingMerchant] = useState(true);
  const [splitMode, setSplitMode] = useState<Exclude<SplitMode, "custom">>("maximum"); const [equalCount, setEqualCount] = useState("3"); const [splitInputs, setSplitInputs] = useState<string[] | null>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null); const [online, setOnline] = useState(true);
  const wakeLock = useWakeLock(counterMode || fullscreen !== null);

  useEffect(() => {
    const profile = storage.getProfile();
    if (profile) { const ids = profile.upiIds?.length ? profile.upiIds : [profile.upiId]; setName(profile.name); setUpiIds(ids); setUpiId(ids.includes(profile.upiId) ? profile.upiId : ids[0]); setMaxAmount(paiseToInput(profile.defaultMaxPaise)); setSavedProfile(true); setEditingMerchant(false); }
    setSessions(storage.getSessions()); setTheme(storage.getTheme()); setOnline(navigator.onLine); setReady(true);
    const beforeInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const goOnline = () => setOnline(true); const goOffline = () => setOnline(false);
    window.addEventListener("beforeinstallprompt", beforeInstall); window.addEventListener("online", goOnline); window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("beforeinstallprompt", beforeInstall); window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);
  useEffect(() => { if (ready) storage.saveSessions(sessions); }, [sessions, ready]);
  useEffect(() => {
    if (!ready) return; storage.saveTheme(theme);
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && media.matches));
    apply(); media.addEventListener("change", apply); return () => media.removeEventListener("change", apply);
  }, [theme, ready]);

  const totalPaise = parseRupeesToPaise(amount);
  const maxPaise = parseRupeesToPaise(maxAmount);
  const count = Number(equalCount);
  const autoParts = useMemo(() => {
    if (!totalPaise || totalPaise <= 0) return [];
    if (splitMode === "equal") return Number.isInteger(count) && count > 0 && count <= 500 ? splitEqually(totalPaise, count) : [];
    return maxPaise && maxPaise > 0 ? splitAmount(totalPaise, maxPaise) : [];
  }, [totalPaise, maxPaise, splitMode, count]);
  const customParts = splitInputs?.map((value) => parseRupeesToPaise(value));
  const customPartsValid = !!splitInputs && !!totalPaise && customParts?.every((value) => value !== null && value > 0) && customParts.reduce<number>((sum, value) => sum + (value ?? 0), 0) === totalPaise;
  const plannedParts = splitInputs ? customParts?.map((value) => value ?? 0) ?? [] : autoParts;
  const splitError = splitInputs && !customPartsValid ? "Every amount must be valid and the split total must equal the bill exactly." : errors.split;
  const currentProgress = session ? calculateProgress(session.payments) : null;
  const complete = !!session && currentProgress?.paidCount === session.payments.length;
  const visibleIndex = session ? Math.min(activeIndex, session.payments.length - 1) : 0;

  const setField = (field: string, value: string | boolean) => {
    const setters: Record<string, (next: never) => void> = { name: setName, upiId: setUpiId, amount: setAmount, note: setNote, maxAmount: setMaxAmount, remember: setRemember };
    setters[field]?.(value as never);
    if (field === "amount" || field === "maxAmount") setSplitInputs(null);
    if (errors[field]) setErrors((old) => ({ ...old, [field]: "" }));
  };
  const changeUpiId = (index: number, value: string) => {
    setUpiIds((old) => { const previous = old[index]; const next = old.map((item, itemIndex) => itemIndex === index ? value : item); if (upiId === previous || old.length === 1) setUpiId(value); return next; });
    setErrors((old) => ({ ...old, upiId: "", upiIds: "" }));
  };
  const addUpiId = () => { setUpiIds((old) => [...old, ""]); setEditingMerchant(true); };
  const removeUpiId = (index: number) => {
    setUpiIds((old) => { const removed = old[index]; const next = old.filter((_, itemIndex) => itemIndex !== index); if (removed === upiId) setUpiId(next[0] ?? ""); return next.length ? next : [""]; });
  };
  const changeSplitMode = (mode: Exclude<SplitMode, "custom">) => { setSplitMode(mode); setSplitInputs(null); setErrors((old) => ({ ...old, split: "" })); };
  const changeEqualCount = (value: string) => { setEqualCount(value.replace(/\D/g, "")); setSplitInputs(null); };
  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Enter a merchant name.";
    const cleanedUpiIds = upiIds.map((id) => id.trim()).filter(Boolean);
    if (!validateUPI(upiId)) next.upiId = "Select a valid UPI ID for this payment.";
    if (!cleanedUpiIds.length || cleanedUpiIds.some((id) => !validateUPI(id))) next.upiIds = "Enter a valid value for every saved UPI ID.";
    else if (new Set(cleanedUpiIds.map((id) => id.toLowerCase())).size !== cleanedUpiIds.length) next.upiIds = "Remove duplicate UPI IDs.";
    if (totalPaise === null || totalPaise <= 0) next.amount = "Enter an amount greater than ₹0 (up to 2 decimals).";
    else if (totalPaise > 1000000000) next.amount = "For safety, enter an amount up to ₹1 crore.";
    if (splitMode === "maximum" && (maxPaise === null || maxPaise <= 0)) next.maxAmount = "Enter a maximum greater than ₹0.";
    if (splitMode === "equal" && (!Number.isInteger(count) || count < 1 || count > 500)) next.split = "Choose between 1 and 500 equal payments.";
    if (splitInputs && !customPartsValid) next.split = "Split amounts must equal the bill exactly.";
    if (plannedParts.length > 500) next.split = "This creates more than 500 payments. Use fewer splits.";
    setErrors(next); return !Object.keys(next).length;
  };
  const createSession = (parts: number[]) => {
    if (!totalPaise) return;
    const effectiveMax = maxPaise && maxPaise > 0 ? maxPaise : 199900;
    const cleanedUpiIds = upiIds.map((id) => id.trim()).filter(Boolean);
    const next: PaymentSession = { id: createId(), createdAt: new Date().toISOString(), merchant: { name: name.trim(), upiId: upiId.trim(), upiIds: cleanedUpiIds, defaultMaxPaise: effectiveMax }, note: note.trim(), totalPaise, maxPaise: effectiveMax, splitMode: splitInputs ? "custom" : splitMode, payments: parts.map((amountPaise) => ({ id: createId(), amountPaise, paid: false })) };
    if (remember) { storage.saveProfile(next.merchant); setSavedProfile(true); setEditingMerchant(false); } else { storage.clearProfile(); setSavedProfile(false); }
    setSession(next); setSessions((old) => [next, ...old.filter((item) => item.id !== next.id)].slice(0, 20)); setActiveIndex(0); setViewAll(false); setShowSuccess(true); setWarningParts(null);
    setTimeout(() => document.getElementById("payment-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };
  const startPayment = () => { if (!validate()) return; if (plannedParts.length >= 10) setWarningParts(plannedParts); else createSession(plannedParts); };
  const updateSession = (next: PaymentSession) => { setSession(next); setSessions((old) => [next, ...old.filter((item) => item.id !== next.id)].slice(0, 20)); };
  const togglePaid = (index: number) => {
    if (!session) return; const markingPaid = !session.payments[index].paid;
    const payments = session.payments.map((item, itemIndex) => itemIndex === index ? { ...item, paid: !item.paid } : item); updateSession({ ...session, payments });
    if (!markingPaid) setShowSuccess(false); else if (index < payments.length - 1) setTimeout(() => setActiveIndex(index + 1), 180);
  };
  const newPayment = () => { setSession(null); setAmount(""); setNote(""); setSplitInputs(null); setActiveIndex(0); setViewAll(false); setCounterMode(false); setShowSuccess(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openSession = (item: PaymentSession) => { const ids = item.merchant.upiIds?.length ? item.merchant.upiIds : [item.merchant.upiId]; setSession(item); setName(item.merchant.name); setUpiIds(ids); setUpiId(item.merchant.upiId); setMaxAmount(paiseToInput(item.maxPaise)); setAmount(paiseToInput(item.totalPaise)); setNote(item.note); setSplitMode(item.splitMode === "equal" ? "equal" : "maximum"); setEqualCount(String(item.payments.length)); setSplitInputs(item.splitMode === "custom" ? item.payments.map((part) => paiseToInput(part.amountPaise)) : null); const firstUnpaid = item.payments.findIndex((part) => !part.paid); setActiveIndex(firstUnpaid < 0 ? 0 : firstUnpaid); setViewAll(false); setShowSuccess(true); setCounterMode(false); };
  const repeatSession = (item: PaymentSession) => { const next = { ...item, id: createId(), createdAt: new Date().toISOString(), payments: item.payments.map((part) => ({ ...part, id: createId(), paid: false })) }; const ids = next.merchant.upiIds?.length ? next.merchant.upiIds : [next.merchant.upiId]; updateSession(next); setName(next.merchant.name); setUpiIds(ids); setUpiId(next.merchant.upiId); setAmount(paiseToInput(next.totalPaise)); setNote(next.note); setMaxAmount(paiseToInput(next.maxPaise)); setActiveIndex(0); setViewAll(false); setCounterMode(false); setShowSuccess(true); setTimeout(() => document.getElementById("payment-result")?.scrollIntoView({ behavior: "smooth" }), 60); };
  const deleteSession = (id: string) => { setSessions((old) => old.filter((item) => item.id !== id)); if (session?.id === id) setSession(null); };
  const openFullscreen = (index: number) => { setFullscreen(index); document.documentElement.requestFullscreen?.().catch(() => undefined); };
  const closeFullscreen = () => { setFullscreen(null); if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined); };
  const installApp = async () => { if (!installPrompt) return; await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null); };
  const statusText = useMemo(() => session && session.payments.length > 5 ? "Multiple UPI transactions made within a short period may be subject to bank or UPI risk controls." : "", [session]);

  return <main className="min-h-screen bg-paper text-ink transition-colors dark:bg-[#0f1115] dark:text-slate-100">
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-paper/95 backdrop-blur dark:border-white/10 dark:bg-[#0f1115]/95"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"><button onClick={newPayment} className="flex items-center gap-2.5 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white"><Smartphone size={20} /></span><span><span className="block text-[15px] font-extrabold tracking-tight">SplitUPI</span><span className="block text-[10px] text-slate-500">Smart UPI Split Payments</span></span></button><div className="flex items-center gap-1.5">{!online && <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"><WifiOff size={12} />Offline</span>}{session && <button onClick={() => setCounterMode(!counterMode)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold dark:border-white/10">{counterMode ? <EyeOff size={15} /> : <Eye size={15} />}<span>{counterMode ? "Exit counter" : "Counter mode"}</span></button>}{!counterMode && <button onClick={() => setSettingsOpen(!settingsOpen)} className="rounded-lg border border-slate-200 p-2 dark:border-white/10" aria-label="Settings"><Settings size={17} /></button>}</div></div>
      {settingsOpen && !counterMode && <div className="absolute right-4 top-14 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#20242c]"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Appearance</p><div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-white/5">{(["light", "dark", "system"] as ThemePreference[]).map((item) => <button key={item} onClick={() => setTheme(item)} className={`rounded-md px-2 py-1.5 text-xs capitalize ${theme === item ? "bg-white font-bold shadow-sm dark:bg-white/10" : "text-slate-500"}`}>{item}</button>)}</div>{installPrompt && <button onClick={installApp} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white"><Plus size={14} />Install SplitUPI</button>}<button onClick={() => { storage.clearProfile(); setSavedProfile(false); setEditingMerchant(true); setRemember(false); }} className="mt-4 flex w-full items-center gap-2 text-xs font-semibold text-red-600"><Trash2 size={14} />Clear saved merchant details</button></div>}
    </header>

    <div className={`mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-7 ${counterMode ? "max-w-xl" : ""}`}>
      {counterMode && session ? <div id="payment-result" className="space-y-3"><div className="flex items-center justify-between"><button onClick={() => setCounterMode(false)} className="flex items-center gap-1 text-sm font-semibold text-slate-500"><ChevronLeft size={17} />Merchant controls</button>{wakeLock.supported && <span className={`flex items-center gap-1 text-[10px] font-semibold ${wakeLock.locked ? "text-emerald-600" : "text-slate-400"}`}><Zap size={12} />{wakeLock.locked ? "Screen awake" : "Wake lock unavailable"}</span>}</div><PaymentProgress session={session} /><PaymentCard session={session} index={visibleIndex} customerMode onTogglePaid={togglePaid} onFullscreen={openFullscreen} /></div> :
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(340px,440px)_minmax(0,1fr)] lg:gap-7"><div className="space-y-4"><MerchantForm name={name} upiId={upiId} upiIds={upiIds} amount={amount} note={note} maxAmount={maxAmount} remember={remember} errors={errors} savedProfile={savedProfile} editingMerchant={editingMerchant} splitMode={splitMode} equalCount={equalCount} parts={autoParts} editingSplits={!!splitInputs} splitInputs={splitInputs ?? []} splitError={splitError} onChange={setField} onEditMerchant={setEditingMerchant} onUpiIdChange={changeUpiId} onAddUpiId={addUpiId} onRemoveUpiId={removeUpiId} onSplitMode={changeSplitMode} onEqualCount={changeEqualCount} onEditSplits={() => setSplitInputs(autoParts.map(paiseToInput))} onSplitInput={(index, value) => setSplitInputs((old) => old?.map((item, itemIndex) => itemIndex === index ? value : item) ?? null)} onResetSplits={() => setSplitInputs(null)} onSubmit={startPayment} />
        <details className="group rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#171a20]"><summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold">Advanced & payment guidance <ChevronDown size={16} className="transition group-open:rotate-180" /></summary><div className="space-y-3 border-t border-slate-100 p-3 dark:border-white/10"><InfoCard />{session && <CostCalculator totalPaise={session.totalPaise} parts={session.payments.map((part) => part.amountPaise)} />}</div></details>
        {!session && <RecentSessions sessions={sessions} onOpen={openSession} onRepeat={repeatSession} onDelete={deleteSession} onClear={() => setSessions([])} />}</div>
        <div id="payment-result" className="space-y-4 lg:sticky lg:top-20">{!session ? <div className="hidden min-h-[450px] items-center justify-center rounded-[14px] border border-dashed border-slate-300 bg-white/50 p-10 text-center dark:border-white/10 dark:bg-white/[.02] lg:flex"><div className="max-w-xs"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-100"><Plus /></span><h2 className="mt-4 font-bold">Ready when you are</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Enter an amount, review the live split, then start the payment.</p></div></div> : <>{complete && showSuccess ? <SuccessScreen session={session} onNew={newPayment} onRepeat={() => repeatSession(session)} /> : <><PaymentProgress session={session} />{statusText && <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"><AlertTriangle size={15} className="shrink-0" />{statusText}</p>}<div className="flex items-center justify-between"><h2 className="text-sm font-bold">{viewAll ? "All payments" : "Payment checkout"}</h2><div className="flex gap-3"><button onClick={() => setCounterMode(true)} className="text-xs font-bold text-brand-600 dark:text-brand-100">Counter mode</button><button onClick={() => setViewAll(!viewAll)} className="text-xs font-bold text-slate-500">{viewAll ? "One at a time" : "View all"}</button></div></div>{viewAll ? <div className="grid gap-4 xl:grid-cols-2">{session.payments.map((part, index) => <PaymentCard key={part.id} session={session} index={index} compact onTogglePaid={togglePaid} onFullscreen={openFullscreen} />)}</div> : <><PaymentCard session={session} index={visibleIndex} onTogglePaid={togglePaid} onFullscreen={openFullscreen} /><div className="flex justify-center gap-1.5">{session.payments.slice(0, 12).map((part, index) => <button aria-label={`Go to payment ${index + 1}`} onClick={() => setActiveIndex(index)} key={part.id} className={`h-2 rounded-full transition-all ${index === visibleIndex ? "w-6 bg-brand-600" : part.paid ? "w-2 bg-emerald-500" : "w-2 bg-slate-300 dark:bg-white/20"}`} />)}</div></>}<button onClick={newPayment} className="w-full rounded-xl border border-slate-200 py-3 text-sm font-bold dark:border-white/10">New payment</button></>}<RecentSessions sessions={sessions.filter((item) => item.id !== session.id)} onOpen={openSession} onRepeat={repeatSession} onDelete={deleteSession} onClear={() => setSessions(session ? [session] : [])} /></>}</div></div>}
    </div>
    {!counterMode && <footer className="mx-auto max-w-7xl border-t border-slate-200 px-4 py-6 text-xs leading-relaxed text-slate-500 dark:border-white/10 sm:px-6"><p>SplitUPI does not process or store payments. QR codes are generated locally. Merchant details and session history remain in this browser and continue to work offline after the app has been loaded once.</p><p className="mt-2">SplitUPI is independent and is not affiliated with NPCI, RBI, BHIM, Google Pay, PhonePe, Paytm or any bank. Status is manually recorded and does not represent bank confirmation.</p></footer>}
    {warningParts && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={() => setWarningParts(null)}><div className="w-full max-w-md rounded-[14px] bg-white p-5 dark:bg-[#20242c]" onClick={(event) => event.stopPropagation()}><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><AlertTriangle size={21} /></span><h2 className="mt-4 text-lg font-bold">Large number of payments</h2><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">This bill requires {warningParts.length} separate payments. Multiple transactions may be inconvenient and may also be subject to UPI or bank transaction limits.</p><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => setWarningParts(null)} className="rounded-xl border border-slate-200 py-3 text-sm font-semibold dark:border-white/10">Go back</button><button onClick={() => createSession(warningParts)} className="rounded-xl bg-brand-600 py-3 text-sm font-bold text-white">Continue anyway</button></div></div></div>}
    {fullscreen !== null && session && <FullscreenQR session={session} index={fullscreen} onClose={closeFullscreen} />}
  </main>;
}
