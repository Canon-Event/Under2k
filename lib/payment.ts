import type { PaymentPart } from "./types";

export function parseRupeesToPaise(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const [rupees, decimals = ""] = cleaned.split(".");
  const paise = Number(rupees) * 100 + Number(decimals.padEnd(2, "0"));
  return Number.isSafeInteger(paise) ? paise : null;
}
export function paiseToInput(paise: number): string { return (paise / 100).toFixed(paise % 100 ? 2 : 0); }
export function formatCurrency(paise: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(paise / 100);
}
export function splitAmount(totalPaise: number, maxPaise: number): number[] {
  if (!Number.isSafeInteger(totalPaise) || !Number.isSafeInteger(maxPaise) || totalPaise <= 0 || maxPaise <= 0) return [];
  const count = Math.ceil(totalPaise / maxPaise);
  return Array.from({ length: count }, (_, index) => index === count - 1 ? totalPaise - maxPaise * (count - 1) : maxPaise);
}
export function validateUPI(value: string): boolean { return /^[a-zA-Z0-9._+\-]{2,256}@[a-zA-Z0-9.\-]{2,64}$/.test(value.trim()); }
export function generateUPILink(upiId: string, merchantName: string, amountPaise: number, note: string): string {
  const params = new URLSearchParams({ pa: upiId.trim(), pn: merchantName.trim(), am: (amountPaise / 100).toFixed(2), cu: "INR" });
  if (note.trim()) params.set("tn", note.trim());
  return `upi://pay?${params.toString()}`;
}
export function calculateProgress(payments: PaymentPart[]) {
  const paid = payments.filter((payment) => payment.paid);
  return { paidCount: paid.length, paidPaise: paid.reduce((sum, payment) => sum + payment.amountPaise, 0), totalCount: payments.length, percent: payments.length ? Math.round((paid.length / payments.length) * 100) : 0 };
}
export function createId(): string { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`; }
