"use client";

import { useRef, useState } from "react";
import ShareableCard from "@/components/shareable/ShareableCard";
import ShareActions from "@/components/shareable/ShareActions";
import type { MonthlyWrappedData } from "@/lib/wrapped/queries";

interface SummaryCardSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function SummaryCardSlide({
  data,
  accentColor,
  animate,
}: SummaryCardSlideProps) {
  void animate;
  const cardRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square">("portrait");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <ShareableCard ref={cardRef} variant="wrapped" aspectRatio={aspectRatio}>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Header */}
          <div>
            <p
              style={{
                fontFamily: "'Space Mono', monospace",
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
                fontFamily: "'Space Mono', monospace",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#FAFAFA",
                marginTop: "4px",
              }}
            >
              {data.monthLabel} WRAPPED
            </p>
          </div>

          {/* Main stats */}
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
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "40px",
                  fontWeight: 700,
                  color: "#FAFAFA",
                }}
              >
                ${data.benefitsCapturedValue.toLocaleString()}
              </p>
              <p style={{ fontSize: "14px", color: "#8B95A8" }}>CAPTURED</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "40px",
                  fontWeight: 700,
                  color: "#8B95A8",
                }}
              >
                ${data.benefitsWastedValue.toLocaleString()}
              </p>
              <p style={{ fontSize: "14px", color: "#8B95A8" }}>WASTED</p>
            </div>
          </div>

          {/* Capture rate */}
          <div>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "28px",
                fontWeight: 700,
                color: data.captureRateDelta >= 0 ? "#34D399" : "#F87171",
              }}
            >
              {Math.round(data.captureRate)}% CAPTURE RATE
              {!data.isFirstMonth && data.captureRateDelta !== 0 && (
                <span style={{ fontSize: "18px", marginLeft: "8px" }}>
                  {data.captureRateDelta >= 0 ? "▲" : "▼"}+
                  {Math.round(data.captureRateDelta)}%
                </span>
              )}
            </p>
          </div>

          {/* Wallet + Score */}
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
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FAFAFA",
                }}
              >
                WALLET: ${data.walletValueEnd.toLocaleString()}
              </p>
              {!data.isFirstMonth && (
                <p style={{ fontSize: "14px", color: "#8B95A8" }}>
                  ({data.walletDelta >= 0 ? "▲ +" : "▼ "}$
                  {Math.abs(data.walletDelta).toLocaleString()})
                </p>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FAFAFA",
                }}
              >
                SCORE: {data.walletScore}/100
              </p>
              <p style={{ fontSize: "14px", color: accentColor }}>
                {data.walletScoreLabel}
              </p>
            </div>
          </div>

          {/* MVP vs Needs Work */}
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
                  color: "#8B95A8",
                  letterSpacing: "0.1em",
                }}
              >
                MVP
              </p>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#FAFAFA",
                  marginTop: "4px",
                }}
              >
                {data.bestCard.name}
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "14px",
                  color: "#34D399",
                }}
              >
                {data.bestCard.grade}{" "}
                {data.bestCard.gradeChange && `▲`}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#8B95A8",
                  letterSpacing: "0.1em",
                }}
              >
                NEEDS WORK
              </p>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#FAFAFA",
                  marginTop: "4px",
                }}
              >
                {data.worstCard.name}
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "14px",
                  color: "#F87171",
                }}
              >
                {data.worstCard.grade} →
              </p>
            </div>
          </div>

          {/* Streak + Badges */}
          {(data.streakCount > 0 || data.badgesUnlocked.length > 0) && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              {data.streakCount > 0 && (
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "14px",
                    color: "#FAFAFA",
                  }}
                >
                  {"🔥"} {data.streakCount}mo streak
                </p>
              )}
              {data.badgesUnlocked.length > 0 && (
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "14px",
                    color: "#FAFAFA",
                  }}
                >
                  {data.badgesUnlocked.map((b) => b.icon).join("")} +
                  {data.badgesUnlocked.length} badges
                </p>
              )}
            </div>
          )}
        </div>
      </ShareableCard>

      <ShareActions
        cardRef={cardRef}
        filename={`cardclock-${data.month}-wrapped`}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
      />
    </div>
  );
}
