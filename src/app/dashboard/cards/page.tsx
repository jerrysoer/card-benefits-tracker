"use client";

import { useState, useEffect } from "react";
import { isDemoMode, getDemoCardsWithBenefits, DEMO_USER_CARDS } from "@/lib/demo/data";
import type { CardWithBenefits, UserCard } from "@/lib/supabase/types";
import CardPicker from "@/components/dashboard/CardPicker";

export default function CardsPage() {
  const [allCards, setAllCards] = useState<CardWithBenefits[]>([]);
  const [userCardIds, setUserCardIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode()) {
      setAllCards(getDemoCardsWithBenefits());
      setUserCardIds(DEMO_USER_CARDS.map((uc: UserCard) => uc.cc_card_id));
      setLoading(false);
    }
  }, []);

  const handleToggleCard = (cardId: string) => {
    setUserCardIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-text-secondary">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Card Portfolio
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Select the cards in your wallet to track their benefits.
        </p>
      </div>
      <CardPicker
        allCards={allCards}
        userCardIds={userCardIds}
        onToggleCard={handleToggleCard}
      />
    </div>
  );
}
