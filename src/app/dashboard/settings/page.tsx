"use client";

import { isDemoMode } from "@/lib/demo/data";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your account and preferences.
        </p>
      </div>

      {isDemoMode() && (
        <div className="rounded-lg border border-amber/20 bg-amber-bg p-4">
          <p className="text-sm text-amber">
            You&apos;re in demo mode. Connect Supabase to enable account
            management, cross-device sync, and data persistence.
          </p>
        </div>
      )}

      {/* Account Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
          Account
        </h2>
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">
                Email
              </div>
              <div className="mt-0.5 text-sm text-text-secondary">
                {isDemoMode() ? "demo@cardclock.dev" : "Loading..."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Card Open Dates */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
          Card Open Dates
        </h2>
        <p className="text-sm text-text-secondary">
          Set card open dates for anniversary-based benefit resets (e.g., Chase
          Sapphire Reserve travel credit).
        </p>
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <p className="text-sm text-text-muted">
            Card open date management will be available when connected to
            Supabase.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
          About
        </h2>
        <div className="rounded-lg border border-border bg-bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Version</span>
            <span className="font-mono-data text-sm text-text-primary">
              0.1.0
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Mode</span>
            <span className="font-mono-data text-sm text-text-primary">
              {isDemoMode() ? "Demo" : "Connected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Source</span>
            <a
              href="https://github.com/jerrysoer/cardclock"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
