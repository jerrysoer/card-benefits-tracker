import Link from "next/link";
import { Clock } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-sm font-bold tracking-tight text-text-primary">
                CardClock
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                Timeline
              </Link>
              <Link
                href="/dashboard/cards"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                Cards
              </Link>
              <Link
                href="/dashboard/flex"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-neon-purple transition-colors hover:bg-bg-elevated hover:opacity-80"
              >
                Flex
              </Link>
              <Link
                href="/dashboard/settings"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
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
    <span className="rounded-full bg-amber-bg px-3 py-1 text-xs font-medium text-amber">
      Demo Mode
    </span>
  );
}
