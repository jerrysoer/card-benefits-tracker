# CardClock — Your Benefits Are Ticking

**Free, open-source credit card benefit deadline tracker.** Never waste another statement credit.

The average premium cardholder wastes **$624/year** in unused credits. CardClock tracks every benefit deadline across all your cards — green when safe, amber when soon, red when urgent.

## Features

- **Benefit Timeline** — Every benefit as a countdown, sorted by urgency
- **30+ Premium Cards** — Pre-loaded benefits for Amex, Chase, Citi, Capital One, Bilt, and more
- **Mark as Used** — Full or partial tracking with auto-reset on period rollover
- **ROI Calculator** — Per-card gauge showing if your annual fee is worth it
- **No Bank Login** — Zero account linking. Your data stays yours.
- **Open Source** — Self-host in 10 minutes or use the hosted version free

## Quick Start

```bash
# Clone the repo
git clone https://github.com/jerrysoer/cardclock.git
cd cardclock

# Install dependencies
npm install

# Run in demo mode (no Supabase required)
npm run dev
```

Visit `http://localhost:3000` — the app runs in demo mode with sample data when Supabase isn't configured.

## Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jerrysoer/cardclock)

See [SELF_DEPLOY.md](./SELF_DEPLOY.md) for the full self-hosting guide.

## Tech Stack

| Layer     | Choice                    |
|-----------|---------------------------|
| Framework | Next.js 16 (App Router)   |
| Language  | TypeScript                |
| Styling   | Tailwind CSS v4           |
| Database  | Supabase (PostgreSQL)     |
| Auth      | Supabase Auth             |
| Deploy    | Vercel                    |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | For production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For production | Supabase anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | For seeding | Service role key (server-only) |

Without Supabase credentials, the app runs in **demo mode** with sample data.

## Supported Cards

**American Express:** Platinum, Gold, Business Platinum, Business Gold, Green, Hilton Aspire, Hilton Surpass, Marriott Bonvoy Brilliant, Delta Reserve, Delta Platinum

**Chase:** Sapphire Reserve, Sapphire Preferred, Freedom Flex, Ink Business Preferred, United Club Infinite, United Quest, IHG Premier, World of Hyatt, Southwest Priority, Marriott Bonvoy Boundless

**Capital One:** Venture X, SavorOne

**Citi:** Strata Premier, AAdvantage Executive

**Other:** Bilt Mastercard, Barclays JetBlue Plus, US Bank Altitude Reserve

## Contributing

Card benefit data lives in `data/cards.json`. To add or update a card:

1. Fork the repo
2. Edit `data/cards.json`
3. Submit a PR

## License

MIT

---

Built by [jerrysoer](https://github.com/jerrysoer) × Claude
