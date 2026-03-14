import type { CardROI } from "@/lib/supabase/types";
import { DEMO_CARDS } from "@/lib/demo/data";
import recsData from "../../data/recommendations.json";

export interface RecommendationData {
  card_slug: string;
  best_for: string[];
  pairs_with: string[];
  first_year_value_estimate: number;
  key_benefits: string[];
  fills_gap: string;
}

export interface Recommendation {
  cardSlug: string;
  cardName: string;
  issuer: string;
  annualFee: number;
  reason: string;
  gapFilled: string;
  firstYearNetValue: number;
  keyBenefits: string[];
  score: number;
}

const REC_DATA: RecommendationData[] = recsData.recommendations;

export function analyzePortfolioGaps(
  userCardROIs: CardROI[]
): Recommendation[] {
  const userSlugs = new Set(userCardROIs.map((r) => r.card.cc_card_slug));
  const userIssuers = new Set(userCardROIs.map((r) => r.card.cc_issuer));

  // Category coverage: which benefit categories the user already has
  const userCategories = new Set<string>();
  for (const roi of userCardROIs) {
    const recData = REC_DATA.find((r) => r.card_slug === roi.card.cc_card_slug);
    if (recData) {
      recData.best_for.forEach((cat) => userCategories.add(cat));
    }
  }

  const candidates: Recommendation[] = [];

  for (const rec of REC_DATA) {
    // Skip cards user already has
    if (userSlugs.has(rec.card_slug)) continue;

    const cardData = DEMO_CARDS.find((c) => c.cc_card_slug === rec.card_slug);
    if (!cardData) continue;

    let score = 0;
    const reasons: string[] = [];

    // 1. Issuer diversity — bonus if new issuer
    if (!userIssuers.has(cardData.cc_issuer)) {
      score += 25;
      reasons.push(
        `adds ${cardData.cc_issuer} to your wallet for issuer diversity`
      );
    }

    // 2. Category coverage — bonus for filling gaps
    const newCategories = rec.best_for.filter((cat) => !userCategories.has(cat));
    if (newCategories.length > 0) {
      score += newCategories.length * 15;
      reasons.push(`fills ${newCategories.join(", ")} gap${newCategories.length > 1 ? "s" : ""}`);
    }

    // 3. Pairing bonus — pairs well with existing cards
    const pairsWithOwned = rec.pairs_with.filter((slug) => userSlugs.has(slug));
    if (pairsWithOwned.length > 0) {
      score += pairsWithOwned.length * 10;
      const pairNames = pairsWithOwned.map((slug) => {
        const c = DEMO_CARDS.find((d) => d.cc_card_slug === slug);
        return c?.cc_card_name ?? slug;
      });
      reasons.push(`pairs well with your ${pairNames.join(" & ")}`);
    }

    // 4. Value score — first year net value
    const netValue = rec.first_year_value_estimate - cardData.cc_annual_fee;
    if (netValue > 0) {
      score += Math.min(netValue / 10, 30);
    }

    // 5. Points ecosystem — bonus if missing program
    if (rec.best_for.includes("travel") && !userCategories.has("lounge")) {
      score += 5;
    }

    if (reasons.length === 0) {
      reasons.push("solid value card that complements your portfolio");
    }

    candidates.push({
      cardSlug: rec.card_slug,
      cardName: cardData.cc_card_name,
      issuer: cardData.cc_issuer,
      annualFee: cardData.cc_annual_fee,
      reason: reasons.join(". ") + ".",
      gapFilled: rec.fills_gap,
      firstYearNetValue: netValue,
      keyBenefits: rec.key_benefits,
      score,
    });
  }

  // Sort by score descending, return top 3
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 3);
}

export function isPortfolioWellRounded(recs: Recommendation[]): boolean {
  // If no recs score above 20, portfolio is well-rounded
  return recs.length === 0 || recs.every((r) => r.score < 20);
}
