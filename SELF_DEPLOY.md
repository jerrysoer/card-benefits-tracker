# Self-Deploy Guide

Deploy your own CardClock instance in under 10 minutes.

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Supabase account](https://supabase.com/) (free tier works)
- [Vercel account](https://vercel.com/) (free tier works)

## Step 1: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose a name and password, select a region
4. Wait for the project to be ready

## Step 2: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Open `supabase/migrations/001_initial_schema.sql` from this repo
3. Paste the entire contents into the SQL editor
4. Click **Run** — this creates all tables, indexes, and RLS policies

## Step 3: Get Your API Keys

1. Go to **Settings → API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 4: Seed the Card Database

```bash
# Clone the repo
git clone https://github.com/jerrysoer/cardclock.git
cd cardclock
npm install

# Create .env.local with your keys
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF

# Seed the card database
npm run seed
```

## Step 5: Configure Auth (Optional)

### Email Magic Link
Works out of the box with Supabase's default email provider.

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the callback URL to: `https://YOUR_SUPABASE_URL/auth/v1/callback`
4. In Supabase dashboard → **Authentication → Providers → GitHub**, add your Client ID and Client Secret

## Step 6: Deploy to Vercel

### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jerrysoer/cardclock)

Add your environment variables in the Vercel deployment settings.

### Option B: CLI Deploy
```bash
npm i -g vercel
vercel --prod
```

Add environment variables in the Vercel dashboard under **Settings → Environment Variables**.

## Step 7: Verify

1. Visit your deployed URL
2. Sign up with email or GitHub
3. Add cards to your portfolio
4. Verify benefits appear with correct countdown timers

## Updating Card Data

To update the card database after changes to `data/cards.json`:

```bash
npm run seed
```

The seed script uses upsert — it's safe to run multiple times.

## Troubleshooting

**"Supabase credentials not configured"**
→ Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in your `.env.local` or Vercel environment variables.

**Auth not working**
→ Verify your Supabase URL is correct and the project is active.

**Missing cards after seeding**
→ Check the seed script output for errors. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly.
