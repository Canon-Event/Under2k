export type Merchant = { name: string; upiId: string; upiIds?: string[]; defaultMaxPaise: number };
export type PaymentPart = { id: string; amountPaise: number; paid: boolean };
export type SplitMode = "maximum" | "equal" | "custom";
export type PaymentSession = {
  id: string; createdAt: string; merchant: Merchant; note: string;
  totalPaise: number; maxPaise: number; payments: PaymentPart[];
  splitMode?: SplitMode;
};
export type ThemePreference = "light" | "dark" | "system";
