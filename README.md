# SplitUPI

SplitUPI is a client-side utility for creating multiple standard UPI payment links and QR codes from one bill. It does not process, verify, settle, or hold payments. Payment completion is tracked manually by the merchant.

## How it works

1. Enter the merchant name, UPI ID, bill amount, optional note, and maximum amount per payment.
2. SplitUPI divides the bill into the fewest possible payments without exceeding that maximum.
3. Each payment gets its own `upi://pay` link and matching QR code.
4. The merchant can present each QR in sequence and manually mark it paid.

The live planner supports both maximum-per-payment and equal-count splits. The default maximum is ₹1,999 and can be edited at any time. Individual split amounts can also be edited before starting, but their integer-paise total must exactly match the bill.

All money calculations use integer paise. For example, ₹599.50 becomes `59950`; splitting happens on integers, which prevents floating-point rounding errors. A ₹5,650 bill with a ₹2,000 maximum becomes `200000 + 200000 + 165000` paise.

UPI links are constructed with `URLSearchParams` in this form:

```text
upi://pay?pa=merchant%40upi&pn=Merchant+Name&am=2000.00&cu=INR&tn=Invoice+1042
```

Each QR contains the generated UPI payment link and can be scanned with a supported UPI app. Links can also be copied or shared from merchant mode.

## Local data

There is no database or account system. Merchant profiles can retain multiple UPI IDs and an active receiving ID. These preferences, the theme, and up to 20 recent sessions are stored in browser `localStorage`. Clearing browser data removes them. No payment confirmation is obtained from a bank or PSP.

## PWA and offline use

The web manifest and service worker make SplitUPI installable on supported browsers. After the first successful online load, the app shell and its compiled assets are cached so splitting, QR generation, merchant profiles, recent sessions, and manual status tracking remain available offline. Counter Mode and fullscreen QR mode request a screen wake lock where the browser permits it.

## Project structure

```text
app/                  Next.js App Router entry, metadata, and global styles
components/           Form, QR, progress, history, calculator, and success UI
lib/payment.ts        Paise parsing, splitting, formatting, validation, UPI links
lib/storage.ts        Browser-only persistence adapter
lib/types.ts          Shared domain types
```

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production check:

```bash
npm run build
npm start
```

## Deploy to Vercel

Push the project to a Git repository, import it in Vercel, and keep the detected Next.js defaults. No environment variables, database, or server configuration are required. Alternatively, with the Vercel CLI:

```bash
npx vercel
```

Vercel automatically supplies the production origin used by canonical and sitemap metadata. On another host, set `NEXT_PUBLIC_SITE_URL=https://your-domain.example`.

## Important limitations

- Status is manually marked and is not bank confirmation.
- Supported UPI apps and transaction limits depend on the customer's device, bank, and PSP.
- MDR, eligibility, limits, and applicable rules can change. Merchants should confirm current terms with their acquiring bank or payment provider.
