import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="border-b border-border-soft bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#111]"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-sm font-bold tracking-tight text-text-primary">
                CardClock
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-full bg-[#111] px-4 py-1.5 text-sm font-medium text-white transition-colors"
              >
                Timeline
              </Link>
              <Link
                href="/dashboard/cards"
                className="rounded-full bg-[#F3F4F6] px-4 py-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
              >
                Cards
              </Link>
              <Link
                href="/dashboard/wallet"
                className="rounded-full bg-[#F3F4F6] px-4 py-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
              >
                Full Wallet
              </Link>
              <Link
                href="/dashboard/flex"
                className="rounded-full bg-[#F3F4F6] px-4 py-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
              >
                Flex
              </Link>
              <Link
                href="/dashboard/wrapped"
                className="rounded-full bg-[#F3F4F6] px-4 py-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
              >
                Wrapped
              </Link>
              <Link
                href="/dashboard/settings"
                className="rounded-full bg-[#F3F4F6] px-4 py-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
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
    <span className="rounded-full bg-pastel-purple px-3 py-1 text-xs font-medium text-[#7C3AED]">
      Playground
    </span>
  );
}
