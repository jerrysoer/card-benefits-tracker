"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Subscriptions", href: "/dashboard/wallet/subscriptions" },
  { label: "Net Worth", href: "/dashboard/wallet/net-worth" },
];

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-3 font-display text-lg tracking-wide text-text-primary">
          FULL WALLET
        </h1>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-card p-1">
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-bg-elevated text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
