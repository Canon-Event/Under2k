export type Merchant = { name: string; upiId: string; defaultMaxPaise: number };
export type PaymentPart = { id: string; amountPaise: number; paid: boolean };
export type PaymentSession = {
  id: string; createdAt: string; merchant: Merchant; note: string;
  totalPaise: number; maxPaise: number; payments: PaymentPart[];
};
export type ThemePreference = "light" | "dark" | "system";
