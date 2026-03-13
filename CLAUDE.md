# CardClock — Project Rules

## Stack
- Next.js 16+ (App Router) + TypeScript
- Tailwind CSS v4 (dark theme via CSS variables)
- Supabase (PostgreSQL + Auth + RLS)
- Deploy: Vercel

## Conventions
- Table prefix: `cc_` for all domain tables/columns. Standard columns (id, user_id, created_at, updated_at) are NOT prefixed.
- Auth: Always use `getUser()`, NEVER `getSession()`
- RLS: All `cc_` tables must have RLS enabled
- Service role key: NEVER expose to client — server-side only
- Env file: `.env.local` (not `.env`)
- No `console.log` in production code
- Use `@/*` path alias for imports

## Design Tokens
- Dark mode default (bg: #0C0F14, cards: #141820)
- Urgency colors: green (#34D399) >14d, amber (#FBBF24) 7-14d, red (#F87171) <7d
- Fonts: DM Sans (headers/UI), JetBrains Mono (numbers/data)
- 8px base spacing unit

## File Structure
- `src/app/` — Next.js pages and API routes
- `src/components/` — React components (auth/, dashboard/, ui/)
- `src/lib/` — Utilities (supabase/, benefits/, analytics/)
- `data/cards.json` — Card database source of truth
- `scripts/` — Seed scripts
- `supabase/migrations/` — SQL migrations
