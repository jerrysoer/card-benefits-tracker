"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { isDemoMode, DEMO_CARDS, DEMO_BENEFITS, DEMO_USER_CARDS, DEMO_USAGE } from "@/lib/demo/data";
import type { Card, Benefit, CardROI } from "@/lib/supabase/types";
import { calculateCardROI } from "@/lib/benefits/roi";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/benefits/roi";
import { formatPeriodLabel } from "@/lib/benefits/deadline";
import ROIGauge from "@/components/dashboard/ROIGauge";
import { getIssuerName, getCategoryLabel } from "@/lib/utils";

export default function CardDetailClient() {
  const params = useParams();
  const slug = params.slug as string;

  const [card, setCard] = useState<Card | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [roi, setROI] = useState<CardROI | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      const found = DEMO_CARDS.find((c) => c.cc_card_slug === slug);
      if (found) {
        setCard(found);
        const cardBenefits = DEMO_BENEFITS.filter(
          (b) => b.cc_card_id === found.id
        );
        setBenefits(cardBenefits);

        const uc = DEMO_USER_CARDS.find(
          (u) => u.cc_card_id === found.id
        );
        if (uc) {
          const cardUsage = DEMO_USAGE.filter(
            (u) => u.cc_user_card_id === uc.id
          );
          setROI(calculateCardROI(found, uc, cardBenefits, cardUsage));
        }
      }
    }
  }, [slug]);

  if (!card) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-text-secondary">Card not found</div>
      </div>
    );
  }

  const annualTotal = benefits.reduce((sum, b) => sum + b.cc_annual_total, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {card.cc_card_name}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {getIssuerName(card.cc_issuer)} ·{" "}
            <span className="font-mono-data">
              {formatCurrency(card.cc_annual_fee)}
            </span>{" "}
            annual fee
          </p>
        </div>
        {roi && <ROIGauge roi={roi} />}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Annual Fee"
          value={formatCurrency(card.cc_annual_fee)}
        />
        <StatCard
          label="Total Benefits"
          value={formatCurrency(annualTotal)}
        />
        <StatCard
          label="Benefits Count"
          value={String(benefits.length)}
        />
        <StatCard
          label="Net Value"
          value={formatCurrency(annualTotal - card.cc_annual_fee)}
          highlight={annualTotal >= card.cc_annual_fee}
        />
      </div>

      {/* Benefits List */}
      <div>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
          Benefits
        </h2>
        <div className="space-y-2">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="rounded-lg border border-border bg-bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {benefit.cc_benefit_name}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                    <span>{getCategoryLabel(benefit.cc_category)}</span>
                    <span className="text-text-muted">·</span>
                    <span>{formatPeriodLabel(benefit.cc_benefit_period)}</span>
                    {benefit.cc_activation_required && (
                      <>
                        <span className="text-text-muted">·</span>
                        <span className="text-amber">Activation required</span>
                      </>
                    )}
                  </div>
                  {benefit.cc_merchant_notes && (
                    <p className="mt-2 text-xs text-text-muted">
                      {benefit.cc_merchant_notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-mono-data text-sm font-medium text-text-primary">
                    {formatCurrencyPrecise(benefit.cc_benefit_value)}
                  </div>
                  <div className="font-mono-data text-xs text-text-muted">
                    {formatCurrency(benefit.cc_annual_total)}/yr
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">
        {label}
      </div>
      <div
        className={`mt-1 font-mono-data text-xl font-bold ${
          highlight === true
            ? "text-green"
            : highlight === false
              ? "text-red"
              : "text-text-primary"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
