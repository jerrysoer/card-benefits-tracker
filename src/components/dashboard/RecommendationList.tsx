"use client";

import type { CardROI } from "@/lib/supabase/types";
import { analyzePortfolioGaps, isPortfolioWellRounded, type Recommendation } from "@/lib/recommendations";
import { formatCurrency } from "@/lib/benefits/roi";
import { getIssuerName } from "@/lib/utils";

interface RecommendationListProps {
  cardROIs: CardROI[];
}

const ISSUER_COLORS: Record<string, string> = {
  amex: "#006FCF",
  chase: "#124A8C",
  citi: "#003B70",
  capital_one: "#D41F30",
  bilt: "#000000",
  barclays: "#00AEEF",
  us_bank: "#D41F30",
};

export default function RecommendationList({ cardROIs }: RecommendationListProps) {
  const recommendations = analyzePortfolioGaps(cardROIs);
  const wellRounded = isPortfolioWellRounded(recommendations);

  return (
    <div>
      <h2 className="font-display mb-3 text-sm text-text-secondary">
        WHAT CARD SHOULD I GET NEXT?
      </h2>

      {wellRounded ? (
        <div className="rounded-lg border border-[#10B981] bg-[#D1FAE5] px-5 py-4">
          <span className="text-sm text-text-secondary">
            your portfolio is well-rounded 👑 — no obvious gaps.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.cardSlug} rec={rec} />
          ))}
          <p className="text-xs text-text-muted">
            No affiliate links. Recommendations based on portfolio math only.
          </p>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const bgColor = ISSUER_COLORS[rec.issuer] ?? "#333";

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        {/* Issuer color block */}
        <div
          className="mt-0.5 h-8 w-8 flex-shrink-0 rounded"
          style={{ backgroundColor: bgColor }}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm font-bold text-text-primary">
                {rec.cardName}
              </span>
              <span className="ml-2 text-xs text-text-muted">
                {getIssuerName(rec.issuer)}
              </span>
            </div>
            <span className="font-mono-data text-xs font-bold text-text-secondary">
              {formatCurrency(rec.annualFee)}/yr
            </span>
          </div>

          {/* WHY */}
          <p className="mt-2 text-xs text-text-secondary">
            <span className="font-bold text-text-primary">WHY:</span> {rec.reason}
          </p>

          {/* Gap filled */}
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded bg-[#F3F4F6] px-2 py-0.5 text-xs text-text-muted">
              fills: {rec.gapFilled}
            </span>
            <span
              className="font-mono-data text-xs font-bold"
              style={{
                color: rec.firstYearNetValue >= 0 ? "#10B981" : "#EF4444",
              }}
            >
              {rec.firstYearNetValue >= 0 ? "+" : ""}
              {formatCurrency(rec.firstYearNetValue)} yr1 net
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
