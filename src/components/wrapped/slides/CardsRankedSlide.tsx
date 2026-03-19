"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";

interface CardsRankedSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "#6B8F71",
  A: "#6B8F71",
  B: "#C8963E",
  "B+": "#C8963E",
  C: "#C8963E",
  "C+": "#C8963E",
  D: "#C4717A",
  F: "#C4717A",
  FREE: "#2A7C6F",
};

export default function CardsRankedSlide({
  data,
  accentColor,
  animate,
}: CardsRankedSlideProps) {
  void animate;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR CARDS RANKED
      </h2>

      <div
        className="animate-wrapped-enter w-full max-w-sm"
        style={{ animationDelay: "100ms" }}
      >
        {data.cardRankings.map((card, i) => (
          <div
            key={card.slug}
            className="flex items-center gap-3 border-b border-border py-3"
          >
            <span className="font-mono-data text-lg font-bold text-text-muted">
              #{i + 1}
            </span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-text-primary">
                {card.name}
              </p>
              {card.fee > 0 && (
                <p className="text-xs text-text-muted">
                  ${card.fee}/yr fee
                </p>
              )}
              {card.grade === "FREE" && (
                <p className="text-xs text-[#2A7C6F]">(FREE)</p>
              )}
            </div>
            <span
              className="font-mono-data text-sm font-bold"
              style={{ color: GRADE_COLORS[card.grade] || "#A89C8E" }}
            >
              {card.grade}
            </span>
            <span className="font-mono-data text-sm text-text-secondary">
              ${card.captured.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "300ms" }}
      >
        <p className="text-xs uppercase text-text-muted">
          Total Portfolio Grade
        </p>
        <p
          className="mt-1 font-mono-data text-3xl font-bold"
          style={{
            color: GRADE_COLORS[data.portfolioAverageGrade] || "#A89C8E",
          }}
        >
          {data.portfolioAverageGrade}
        </p>
      </div>
    </div>
  );
}
