"use client";

import { useRef, useState } from "react";
import ShareableCard from "@/components/shareable/ShareableCard";
import ShareActions from "@/components/shareable/ShareActions";
import type { YearInReviewData } from "@/lib/wrapped/queries";

interface YearSummaryCardSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function YearSummaryCardSlide({
  data,
  accentColor,
  animate,
}: YearSummaryCardSlideProps) {
  void animate;
  const cardRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square">(
    "portrait"
  );

  const topCard = data.cardRankings[0];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <ShareableCard
        ref={cardRef}
        variant="yearinreview"
        aspectRatio={aspectRatio}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Header */}
          <div>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: accentColor,
              }}
            >
              CARDCLOCK
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#F5EDE0",
                marginTop: "4px",
              }}
            >
              {data.year} YEAR IN REVIEW
            </p>
          </div>

          {/* Hero number */}
          <div>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "56px",
                fontWeight: 700,
                color: "#F5EDE0",
                lineHeight: 1,
              }}
            >
              ${data.totalSaved.toLocaleString()}
            </p>
            <p style={{ fontSize: "14px", color: "#A89C8E", marginTop: "4px" }}>
              TOTAL VALUE CAPTURED
            </p>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#F5EDE0",
                }}
              >
                {data.cardRankings.length} CARDS
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#F5EDE0",
                }}
              >
                ${data.totalFeePaid.toLocaleString()} FEES
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: accentColor,
                }}
              >
                {data.netReturnPercent}% ROI
              </p>
            </div>
          </div>

          {/* Best card + avg grade */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#A89C8E",
                  letterSpacing: "0.1em",
                }}
              >
                BEST CARD
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#F5EDE0",
                  marginTop: "4px",
                }}
              >
                {topCard?.name ?? "N/A"} {topCard?.grade ?? ""}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#A89C8E",
                  letterSpacing: "0.1em",
                }}
              >
                AVG GRADE
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#6B8F71",
                  marginTop: "4px",
                }}
              >
                {data.portfolioAverageGrade}
              </p>
            </div>
          </div>

          {/* Points + Capture + Streak + Badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                color: "#F5EDE0",
              }}
            >
              ${data.currentPointsValue.toLocaleString()} IN POINTS
            </p>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                color: "#F5EDE0",
              }}
            >
              {data.averageCaptureRate}% CAPTURE
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {data.longestStreak > 0 && (
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  color: "#F5EDE0",
                }}
              >
                {data.longestStreak}mo BEST STREAK
              </p>
            )}
            {data.badgesUnlocked.length > 0 && (
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  color: "#F5EDE0",
                }}
              >
                {data.badgesUnlocked.length} BADGES
              </p>
            )}
          </div>

          {/* Hero verdict */}
          <p
            style={{
              fontSize: "14px",
              color: "#A89C8E",
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            &ldquo;{data.heroVerdict}&rdquo;
          </p>
        </div>
      </ShareableCard>

      <ShareActions
        cardRef={cardRef}
        filename={`cardclock-${data.year}-year-in-review`}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
      />
    </div>
  );
}
