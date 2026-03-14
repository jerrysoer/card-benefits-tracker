"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import type { CardWithBenefits } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/benefits/roi";
import { cn, getIssuerName } from "@/lib/utils";

interface CardPickerProps {
  allCards: CardWithBenefits[];
  userCardIds: string[];
  onToggleCard: (cardId: string) => void;
}

export default function CardPicker({
  allCards,
  userCardIds,
  onToggleCard,
}: CardPickerProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, CardWithBenefits[]>();
    for (const card of allCards) {
      const issuer = card.cc_issuer;
      if (!map.has(issuer)) map.set(issuer, []);
      map.get(issuer)!.push(card);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      getIssuerName(a).localeCompare(getIssuerName(b))
    );
  }, [allCards]);

  const activeSet = useMemo(() => new Set(userCardIds), [userCardIds]);

  return (
    <div className="flex flex-col gap-6">
      {grouped.map(([issuer, cards]) => (
        <div key={issuer} className="flex flex-col gap-3">
          <h3 className="text-xs uppercase tracking-wide font-medium text-text-secondary">
            {getIssuerName(issuer)}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const isActive = activeSet.has(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => onToggleCard(card.id)}
                  className={cn(
                    "flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-left transition-all",
                    isActive
                      ? "border-[#60A5FA] bg-[#60A5FA]/5"
                      : "border-border bg-bg-card hover:bg-bg-elevated"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-text-primary">
                      {card.cc_card_name}
                    </span>
                    {isActive && (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#60A5FA]" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span>{getIssuerName(card.cc_issuer)}</span>
                    <span className="text-text-muted">|</span>
                    <span className="font-mono-data">
                      {formatCurrency(card.cc_annual_fee)}
                    </span>
                    <span className="text-text-muted">|</span>
                    <span>
                      {card.benefits.length} benefit
                      {card.benefits.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
