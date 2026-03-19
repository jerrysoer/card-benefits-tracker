"use client";

import { forwardRef } from "react";
import type { CardROI } from "@/lib/supabase/types";
import { calculateGrade, getScoreLabel } from "@/lib/scoring";
import { formatCurrency } from "@/lib/benefits/roi";
import type { BadgeDefinition, BadgeState } from "@/lib/badges";
import { BADGE_DEFINITIONS, TIER_COLORS, getBadgesByTier } from "@/lib/badges";

interface WalletFlexCardProps {
  walletScore: number;
  cardROIs: CardROI[];
  streak: number;
  walletValue: number;
  aspectRatio: "portrait" | "square";
  // Phase 3 additions
  badgeState?: BadgeState;
  runwayMonths?: number | null;
  challengeStats?: { completed: number; total: number };
  roastExcerpt?: string | null;
}

const WalletFlexCard = forwardRef<HTMLDivElement, WalletFlexCardProps>(
  function WalletFlexCard(
    {
      walletScore,
      cardROIs,
      streak,
      walletValue,
      aspectRatio,
      badgeState = {},
      runwayMonths,
      challengeStats,
      roastExcerpt,
    },
    ref
  ) {
    const scoreInfo = getScoreLabel(walletScore);
    const totalFees = cardROIs.reduce((sum, r) => sum + r.annualFee, 0);
    const totalCaptured = cardROIs.reduce((sum, r) => sum + r.totalCaptured, 0);
    const roi = totalFees > 0 ? Math.round((totalCaptured / totalFees) * 100) : 0;

    const width = 1080;
    const height = aspectRatio === "portrait" ? 1350 : 1080;
    const scale = 0.35;

    const now = new Date();
    const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Badge display
    const unlockedCount = Object.keys(badgeState).length;
    const unlockedBadges = BADGE_DEFINITIONS.filter((b) => badgeState[b.id]);
    const topBadges = getBadgesByTier(unlockedBadges).slice(0, 6);

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
            backgroundColor: "#2C2620",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'DM Sans', sans-serif",
            color: "#F5EDE0",
          }}
        >
          <div
            style={{
              border: "4px solid #F5EDE0",
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
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "28px",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: "#8A7E70",
              }}
            >
              CARDCLOCK
            </div>

            {/* Score section */}
            <div style={{ textAlign: "center", margin: "24px 0" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: "20px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  color: "#8A7E70",
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
              <div style={{ fontSize: "18px", color: "#8A7E70", marginTop: "8px" }}>
                out of 100
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
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
                margin: "12px 0",
              }}
            >
              {cardROIs.map((r) => {
                const grade = calculateGrade(r.totalCaptured, r.annualFee);
                return (
                  <div
                    key={r.card.id}
                    style={{
                      width: "100px",
                      height: "70px",
                      border: `3px solid ${grade.color}`,
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#3D352D",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 700,
                        fontSize: "10px",
                        color: "#8A7E70",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {r.card.cc_card_name.split(" ").slice(0, 2).join(" ").substring(0, 10)}
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
                margin: "16px 0",
              }}
            >
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "28px", color: "#F5EDE0" }}>
                  {cardROIs.length}
                </div>
                <div style={{ fontSize: "12px", color: "#8A7E70", textTransform: "uppercase" as const }}>CARDS</div>
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "28px", color: "#F5EDE0" }}>
                  {formatCurrency(totalFees)}
                </div>
                <div style={{ fontSize: "12px", color: "#8A7E70", textTransform: "uppercase" as const }}>FEES PAID</div>
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "28px", color: "#C8963E" }}>
                  {formatCurrency(totalCaptured)}
                </div>
                <div style={{ fontSize: "12px", color: "#8A7E70", textTransform: "uppercase" as const }}>CAPTURED</div>
              </div>
            </div>

            {/* ROI + Streak + Phase 3 data */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "24px",
                fontSize: "16px",
                margin: "12px 0",
                flexWrap: "wrap" as const,
              }}
            >
              <span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: roi >= 100 ? "#6B8F71" : "#C4717A" }}>
                  {roi}% ROI
                </span>
              </span>
              {streak > 0 && (
                <span>
                  🔥 <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#6B8F71" }}>
                    {streak} mo streak
                  </span>
                </span>
              )}
              {runwayMonths !== undefined && (
                <span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#2A7C6F" }}>
                    {runwayMonths === null ? "∞" : `${runwayMonths}mo`} runway
                  </span>
                </span>
              )}
              {challengeStats && challengeStats.total > 0 && (
                <span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#C8963E" }}>
                    {challengeStats.completed}/{challengeStats.total} challenges
                  </span>
                </span>
              )}
            </div>

            {/* Badge row */}
            {topBadges.length > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", margin: "12px 0", alignItems: "center" }}>
                {topBadges.map((badge) => (
                  <span
                    key={badge.id}
                    style={{
                      fontSize: "24px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: `2px solid ${TIER_COLORS[badge.tier].border}`,
                    }}
                  >
                    {badge.icon}
                  </span>
                ))}
                {unlockedCount > 6 && (
                  <span style={{ fontSize: "14px", color: "#A89C8E", fontFamily: "'JetBrains Mono', monospace" }}>
                    +{unlockedCount - 6}
                  </span>
                )}
                <span style={{ fontSize: "12px", color: "#8A7E70", marginLeft: "8px" }}>
                  {unlockedCount}/{BADGE_DEFINITIONS.length} unlocked
                </span>
              </div>
            )}

            {/* Roast excerpt */}
            {roastExcerpt && (
              <div style={{ textAlign: "center", margin: "8px 0", padding: "0 24px" }}>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#A89C8E", lineHeight: 1.4 }}>
                  &ldquo;{roastExcerpt.split(".")[0]}.&rdquo;
                </p>
              </div>
            )}

            {/* Watermark */}
            <div
              style={{
                borderTop: "1px solid #4A3F35",
                paddingTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                color: "#8A7E70",
              }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: "0.05em" }}>
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
