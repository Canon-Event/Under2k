import type { Merchant, PaymentSession, ThemePreference } from "./types";
const PROFILE_KEY = "splitupi.profile.v1";
const SESSIONS_KEY = "splitupi.sessions.v1";
const THEME_KEY = "splitupi.theme.v1";
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}
export const storage = {
  getProfile: () => read<Merchant | null>(PROFILE_KEY, null),
  saveProfile: (merchant: Merchant) => localStorage.setItem(PROFILE_KEY, JSON.stringify(merchant)),
  clearProfile: () => localStorage.removeItem(PROFILE_KEY),
  getSessions: () => read<PaymentSession[]>(SESSIONS_KEY, []),
  saveSessions: (sessions: PaymentSession[]) => localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 20))),
  getTheme: () => read<ThemePreference>(THEME_KEY, "system"),
  saveTheme: (theme: ThemePreference) => localStorage.setItem(THEME_KEY, JSON.stringify(theme)),
};
