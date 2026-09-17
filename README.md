# SplitUPI

SplitUPI is a client-side utility for creating multiple standard UPI payment links and QR codes from one bill. It does not process, verify, settle, or hold payments. Payment completion is tracked manually by the merchant.

## How it works

1. Enter the merchant name, UPI ID, bill amount, optional note, and maximum amount per payment.
2. SplitUPI divides the bill into the fewest possible payments without exceeding that maximum.
3. Each payment gets its own `upi://pay` link and matching QR code.
4. The merchant can present each QR in sequence and manually mark it paid.

All money calculations use integer paise. For example, ₹599.50 becomes `59950`; splitting happens on integers, which prevents floating-point rounding errors. A ₹5,650 bill with a ₹2,000 maximum becomes `200000 + 200000 + 165000` paise.

UPI links are constructed with `URLSearchParams` in this form:

```text
upi://pay?pa=merchant%40upi&pn=Merchant+Name&am=2000.00&cu=INR&tn=Invoice+1042
```

The QR contains exactly the same link as the **Open UPI app** button.

## Local data

There is no database or account system. Merchant preferences, theme, and up to 20 recent sessions are stored in browser `localStorage`. Clearing browser data removes them. No payment confirmation is obtained from a bank or PSP.

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
