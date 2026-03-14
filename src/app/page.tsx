import Link from "next/link";

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
    bg: "bg-pastel-blue",
  },
  {
    num: "02",
    title: "See every benefit as a countdown",
    desc: "Green when chill, amber when soon, red when expiring. Never miss a deadline.",
    bg: "bg-pastel-purple",
  },
  {
    num: "03",
    title: "Mark credits as you use them",
    desc: "Full or partial tracking. Benefits auto-reset when their cycle rolls over.",
    bg: "bg-pastel-pink",
  },
  {
    num: "04",
    title: "Know if your card is worth the fee",
    desc: "Per-card ROI gauge shows captured value vs. annual fee, instantly.",
    bg: "bg-pastel-blue",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="border-b border-border-soft bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <ClockIcon />
            <span className="font-outfit text-lg font-bold tracking-tight text-[#111]">
              CardClock
            </span>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <h1 className="font-outfit text-5xl font-black leading-tight tracking-tight text-[#111] md:text-6xl">
          Stop leaving money on the table.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
          The average premium cardholder wastes{" "}
          <span className="font-mono-data font-semibold text-[#111]">$624/year</span>{" "}
          in unused credits. CardClock tracks every deadline so you don&apos;t.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-full bg-[#111] px-8 py-4 text-lg font-semibold text-white transition-transform active:scale-[0.97]"
          >
            Let&apos;s go
          </Link>
          <a
            href="https://github.com/jerrysoer/cardclock"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#F3F4F6] px-8 py-4 text-lg font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
          >
            View on GitHub
          </a>
        </div>

        {/* Dashboard Preview */}
        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl bg-white p-1 shadow-card">
          <div className="rounded-xl bg-[#FAFAFA] p-6">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
            How It Works
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.num} className={`space-y-3 rounded-2xl ${step.bg} p-6`}>
                <span className="font-mono-data text-sm text-text-muted">
                  {step.num}
                </span>
                <h3 className="text-base font-semibold text-[#111]">
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
      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
            Supported Cards
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {ISSUERS.map((issuer) => (
              <span
                key={issuer.slug}
                className="rounded-full bg-[#F3F4F6] px-5 py-2.5 text-sm font-medium text-[#6B7280]"
              >
                {issuer.name}
              </span>
            ))}
            <span className="text-sm text-text-muted">+ more</span>
          </div>
        </div>
      </section>

      {/* Deploy Your Own */}
      <section className="bg-white">
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
              className="rounded-full bg-[#111] px-6 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.97]"
            >
              Deploy to Vercel
            </a>
            <a
              href="https://github.com/jerrysoer/cardclock"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#F3F4F6] px-6 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-soft">
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

function ClockIcon() {
  return (
    <svg
      width="24"
      height="24"
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

  const bgColors = {
    red: "bg-[#FEE2E2]",
    amber: "bg-[#FEF3C7]",
    green: "bg-[#D1FAE5]",
  };

  const textColors = {
    red: "text-[#EF4444]",
    amber: "text-[#F59E0B]",
    green: "text-[#10B981]",
  };

  const badgeLabels = {
    red: "Expiring!",
    amber: "Soon",
    green: "Chill",
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.name}
          className={`flex items-center justify-between rounded-2xl px-5 py-4 ${bgColors[item.urgency]}`}
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="text-sm font-medium text-[#111]">
                {item.name}
              </div>
              <div className="text-xs text-text-secondary">{item.card}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-data text-sm font-semibold text-[#111]">
              {item.value}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${bgColors[item.urgency]} ${textColors[item.urgency]}`}
            >
              {badgeLabels[item.urgency]}
            </span>
            <span
              className={`font-mono-data text-xs ${textColors[item.urgency]}`}
            >
              {item.days}d
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
