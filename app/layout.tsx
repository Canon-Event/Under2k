import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl ?? "http://localhost:3000"),
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  title: {
    default: "SplitUPI — Smart UPI Split Payments",
    template: "%s | SplitUPI",
  },
  description: "Split a bill into smaller UPI payments and generate ready-to-scan QR codes securely in your browser. No account or payment gateway required.",
  applicationName: "SplitUPI",
  authors: [{ name: "SplitUPI" }],
  creator: "SplitUPI",
  publisher: "SplitUPI",
  category: "finance",
  keywords: ["UPI split payment", "UPI QR code", "payment split", "merchant UPI", "India payments", "UPI payment link"],
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SplitUPI",
    title: "SplitUPI — Smart UPI Split Payments",
    description: "Create accurate split UPI payments, QR codes, and payment links directly in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SplitUPI — Smart UPI Split Payments",
    description: "Create accurate split UPI payments, QR codes, and payment links directly in your browser.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1115" },
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SplitUPI",
  description: "A browser-based utility for generating split UPI payment links and QR codes.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  featureList: ["UPI payment splitting", "UPI QR code generation", "Manual payment tracking", "Local browser storage"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN" suppressHydrationWarning><body className={inter.className}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />{children}</body></html>;
}
