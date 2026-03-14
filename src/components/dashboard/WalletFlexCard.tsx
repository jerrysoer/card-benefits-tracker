"use client";

import { forwardRef } from "react";
import type { CardROI } from "@/lib/supabase/types";
import { calculateGrade, getScoreLabel } from "@/lib/scoring";
import { formatCurrency } from "@/lib/benefits/roi";

interface WalletFlexCardProps {
  walletScore: number;
  cardROIs: CardROI[];
  streak: number;
  walletValue: number;
  aspectRatio: "portrait" | "square";
}

const WalletFlexCard = forwardRef<HTMLDivElement, WalletFlexCardProps>(
  function WalletFlexCard({ walletScore, cardROIs, streak, walletValue, aspectRatio }, ref) {
    const scoreInfo = getScoreLabel(walletScore);
    const totalFees = cardROIs.reduce((sum, r) => sum + r.annualFee, 0);
    const totalCaptured = cardROIs.reduce((sum, r) => sum + r.totalCaptured, 0);
    const roi = totalFees > 0 ? Math.round((totalCaptured / totalFees) * 100) : 0;

    const width = 1080;
    const height = aspectRatio === "portrait" ? 1350 : 1080;
    const scale = 0.35;

    const now = new Date();
    const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return (
      <div
        style={{
          width: `${width * scale}px`,
          height: `${height * scale}px`,
          overflow: "hidden",
        }}
      >
        <div
          ref={ref}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            backgroundColor: "#0A0A0A",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'DM Sans', sans-serif",
            color: "#FAFAFA",
          }}
        >
          {/* Inner card with border */}
          <div
            style={{
              border: "4px solid #FAFAFA",
              borderRadius: "16px",
              padding: "48px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Header */}
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: "28px",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: "#666666",
              }}
            >
              CARDCLOCK
            </div>

            {/* Score section */}
            <div style={{ textAlign: "center", margin: "40px 0" }}>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700,
                  fontSize: "20px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  color: "#666666",
                  marginBottom: "16px",
                }}
              >
                WALLET SCORE
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: "120px",
                  lineHeight: 1,
                  color: scoreInfo.color,
                }}
              >
                {walletScore}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: "#666666",
                  marginTop: "8px",
                }}
              >
                out of 100
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: scoreInfo.color,
                  marginTop: "12px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                {scoreInfo.label}
              </div>
            </div>

            {/* Card stack */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap" as const,
                margin: "20px 0",
              }}
            >
              {cardROIs.map((roi) => {
                const grade = calculateGrade(roi.totalCaptured, roi.annualFee);
                return (
                  <div
                    key={roi.card.id}
                    style={{
                      width: "100px",
                      height: "70px",
                      border: `3px solid ${grade.color}`,
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#1A1A1A",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 700,
                        fontSize: "10px",
                        color: "#666666",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {roi.card.cc_card_name.split(" ").slice(0, 2).join(" ").substring(0, 10)}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        fontSize: "24px",
                        color: grade.color,
                      }}
                    >
                      {grade.grade}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                textAlign: "center",
                margin: "24px 0",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: "28px",
                    color: "#FAFAFA",
                  }}
                >
                  {cardROIs.length}
                </div>
                <div style={{ fontSize: "12px", color: "#666666", textTransform: "uppercase" as const }}>
                  CARDS
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: "28px",
                    color: "#FAFAFA",
                  }}
                >
                  {formatCurrency(totalFees)}
                </div>
                <div style={{ fontSize: "12px", color: "#666666", textTransform: "uppercase" as const }}>
                  FEES PAID
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: "28px",
                    color: "#FFD700",
                  }}
                >
                  {formatCurrency(totalCaptured)}
                </div>
                <div style={{ fontSize: "12px", color: "#666666", textTransform: "uppercase" as const }}>
                  CAPTURED
                </div>
              </div>
            </div>

            {/* ROI + Streak */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "32px",
                fontSize: "18px",
                margin: "16px 0",
              }}
            >
              <span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: roi >= 100 ? "#39FF14" : "#FF3131",
                  }}
                >
                  {roi}% ROI
                </span>
              </span>
              {streak > 0 && (
                <span>
                  \uD83D\uDD25{" "}
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: "#39FF14",
                    }}
                  >
                    {streak} mo streak
                  </span>
                </span>
              )}
            </div>

            {/* Watermark */}
            <div
              style={{
                borderTop: "1px solid #333",
                paddingTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                color: "#666666",
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                cardclock.dev
              </span>
              <span>{monthLabel}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default WalletFlexCard;
