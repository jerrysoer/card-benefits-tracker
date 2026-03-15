import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary bg-vignette">
      <nav className="border-b border-border-soft bg-bg-primary">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <span className="font-playfair text-lg font-bold tracking-tight text-text-primary">
                CardClock
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-full bg-teal px-4 py-1.5 text-sm font-medium text-white transition-colors"
              >
                Timeline
              </Link>
              <Link
                href="/dashboard/cards"
                className="rounded-full border border-border bg-bg-card px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
              >
                Cards
              </Link>
              <Link
                href="/dashboard/wallet"
                className="rounded-full border border-border bg-bg-card px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
              >
                Full Wallet
              </Link>
              <Link
                href="/dashboard/flex"
                className="rounded-full border border-border bg-bg-card px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
              >
                Flex
              </Link>
              <Link
                href="/dashboard/wrapped"
                className="rounded-full border border-border bg-bg-card px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
              >
                Wrapped
              </Link>
              <Link
                href="/dashboard/settings"
                className="rounded-full border border-border bg-bg-card px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
              >
                Settings
              </Link>
            </div>
          </div>
          <DemoBadge />
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}

function DemoBadge() {
  const isDemo =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isDemo) return null;

  return (
    <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs font-medium text-teal">
      Playground
    </span>
  );
}
