# CardClock — Project Rules

## Stack
- Next.js 16+ (App Router) + TypeScript
- Tailwind CSS v4 (light theme via CSS variables)
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
- Light mode default (bg: #FAFAFA, cards: #FFFFFF)
- Urgency colors: green (#10B981) >14d, amber (#F59E0B) 7-14d, red (#EF4444) <7d
- Urgency bg pastels: green (#D1FAE5), amber (#FEF3C7), red (#FEE2E2)
- Fonts: Outfit (hero numbers/headlines), Nunito (body/UI), JetBrains Mono (numbers/data)
- Black pill buttons (#111111) with white text for CTAs and active filters
- 8px base spacing unit

## File Structure
- `src/app/` — Next.js pages and API routes
- `src/components/` — React components (auth/, dashboard/, ui/)
- `src/lib/` — Utilities (supabase/, benefits/, analytics/)
- `data/cards.json` — Card database source of truth
- `scripts/` — Seed scripts
- `supabase/migrations/` — SQL migrations
