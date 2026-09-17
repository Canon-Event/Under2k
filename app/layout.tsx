import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "SplitUPI — Smart UPI Split Payments",
  description: "Generate split UPI payment links and QR codes locally in your browser.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body className={inter.className}>{children}</body></html>;
}
