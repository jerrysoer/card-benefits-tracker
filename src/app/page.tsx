import Link from "next/link";
import { Clock } from "lucide-react";

const ISSUERS = [
  { name: "American Express", slug: "amex" },
  { name: "Chase", slug: "chase" },
  { name: "Citi", slug: "citi" },
  { name: "Capital One", slug: "capital_one" },
  { name: "Bilt", slug: "bilt" },
];

const STEPS = [
  {
    num: "01",
    title: "Add your cards",
    desc: "Select from 30+ premium cards with pre-loaded benefits. No bank login required.",
    color: "#34D399",
  },
  {
    num: "02",
    title: "See every benefit as a countdown",
    desc: "Green when safe, amber when soon, red when urgent. Never miss a deadline.",
    color: "#FBBF24",
  },
  {
    num: "03",
    title: "Mark credits as you use them",
    desc: "Full or partial tracking. Benefits auto-reset when their cycle rolls over.",
    color: "#F87171",
  },
  {
    num: "04",
    title: "Know if your card is worth the fee",
    desc: "Per-card ROI gauge shows captured value vs. annual fee, instantly.",
    color: "#60A5FA",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold tracking-tight text-text-primary">
              CardClock
            </span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <div className="mb-8 flex justify-center">
          <HeroCountdownRing />
        </div>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-text-primary md:text-6xl">
          Your benefits are ticking.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
          The average premium cardholder wastes{" "}
          <span className="font-mono-data font-medium text-gold">$624/year</span>{" "}
          in unused credits. CardClock tracks every deadline so you don&apos;t.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-accent px-8 py-3 text-base font-semibold text-bg-primary transition-opacity hover:opacity-90"
          >
            Get Started — Free
          </Link>
          <a
            href="https://github.com/jerrysoer/cardclock"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-8 py-3 text-base font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
          >
            View on GitHub
          </a>
        </div>

        {/* Dashboard Preview */}
        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-xl border border-border bg-bg-card p-1">
          <div className="rounded-lg bg-bg-primary p-6">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-bg-card/50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.num} className="space-y-3">
                <span
                  className="font-mono-data text-sm font-bold"
                  style={{ color: step.color }}
                >
                  {step.num}
                </span>
                <h3 className="text-base font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Cards */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
            Supported Cards
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {ISSUERS.map((issuer) => (
              <span
                key={issuer.slug}
                className="rounded-lg border border-border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-secondary"
              >
                {issuer.name}
              </span>
            ))}
            <span className="text-sm text-text-muted">+ more</span>
          </div>
        </div>
      </section>

      {/* Deploy Your Own */}
      <section className="border-t border-border bg-bg-card/50">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
            Deploy Your Own
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-text-secondary">
            Want to self-host? CardClock is open source. Fork it, connect your
            own Supabase, deploy in 10 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/jerrysoer/cardclock"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-text-primary px-6 py-2.5 text-sm font-semibold text-bg-primary transition-opacity hover:opacity-90"
            >
              Deploy to Vercel
            </a>
            <a
              href="https://github.com/jerrysoer/cardclock"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-text-muted">
              Free · No bank login · Open source
            </p>
            <p className="text-xs text-text-muted">
              Built by jerrysoer × Claude
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroCountdownRing() {
  const size = 80;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.25;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A3040"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F87171"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute font-mono-data text-xl font-bold text-red">3d</span>
    </div>
  );
}

function DashboardPreview() {
  const items: { name: string; card: string; value: string; days: number; urgency: "red" | "amber" | "green" }[] = [
    {
      name: "Uber Cash",
      card: "Amex Platinum",
      value: "$15",
      days: 3,
      urgency: "red",
    },
    {
      name: "Dunkin' Credit",
      card: "Amex Gold",
      value: "$7",
      days: 3,
      urgency: "red",
    },
    {
      name: "Digital Entertainment",
      card: "Amex Platinum",
      value: "$20",
      days: 3,
      urgency: "red",
    },
    {
      name: "Resy Restaurant Credit",
      card: "Amex Platinum",
      value: "$100",
      days: 18,
      urgency: "green",
    },
    {
      name: "Travel Credit",
      card: "Chase Sapphire Reserve",
      value: "$300",
      days: 45,
      urgency: "green",
    },
  ];

  const colors = {
    red: "border-red bg-red-bg",
    amber: "border-amber bg-amber-bg",
    green: "border-green bg-green-bg",
  };

  const dotColors = {
    red: "bg-red",
    amber: "bg-amber",
    green: "bg-green",
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.name}
          className={`flex items-center justify-between rounded-lg border-l-[3px] px-4 py-3 ${colors[item.urgency]}`}
        >
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${dotColors[item.urgency]}`} />
            <div>
              <div className="text-sm font-medium text-text-primary">
                {item.name}
              </div>
              <div className="text-xs text-text-secondary">{item.card}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-data text-sm font-medium text-text-primary">
              {item.value}
            </span>
            <span
              className={`font-mono-data text-xs ${
                item.urgency === "red"
                  ? "text-red"
                  : item.urgency === "amber"
                    ? "text-amber"
                    : "text-green"
              }`}
            >
              {item.days}d left
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
