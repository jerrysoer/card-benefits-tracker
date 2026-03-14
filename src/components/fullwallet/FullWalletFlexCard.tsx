"use client";

import { forwardRef } from "react";
import type { FinancialScoreResult } from "@/lib/fullwallet/types";

interface FullWalletFlexCardProps {
  walletScore: number;
  financialScore: FinancialScoreResult;
  netWorth: number | null;
  subscriptionBurn: number;
  savingsRate: number;
  aspectRatio: "portrait" | "square";
}

const FullWalletFlexCard = forwardRef<HTMLDivElement, FullWalletFlexCardProps>(
  function FullWalletFlexCard(
    {
      walletScore,
      financialScore,
      netWorth,
      subscriptionBurn,
      savingsRate,
      aspectRatio,
    },
    ref
  ) {
    const width = 1080;
    const height = aspectRatio === "portrait" ? 1350 : 1080;
    const scale = 0.35;

    const now = new Date();
    const monthLabel = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const walletScoreColor =
      walletScore >= 75 ? "#39FF14" : walletScore >= 50 ? "#FFE600" : "#FF3131";

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
            border: "4px solid #39FF14",
            borderRadius: "24px",
            padding: "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {/* Header */}
          <div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "#39FF14",
                marginBottom: "8px",
              }}
            >
              CARDCLOCK FULL WALLET
            </div>
            <div style={{ fontSize: "18px", color: "#8B95A8" }}>
              {monthLabel}
            </div>
          </div>

          {/* Dual Scores */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "80px",
              margin: "40px 0",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "100px",
                  fontWeight: 700,
                  color: walletScoreColor,
                  lineHeight: 1,
                }}
              >
                {walletScore}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  letterSpacing: "0.1em",
                  color: "#8B95A8",
                  marginTop: "8px",
                }}
              >
                WALLET SCORE
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "100px",
                  fontWeight: 700,
                  color: financialScore.color,
                  lineHeight: 1,
                }}
              >
                {financialScore.total}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  letterSpacing: "0.1em",
                  color: "#8B95A8",
                  marginTop: "8px",
                }}
              >
                FINANCIAL SCORE
              </div>
            </div>
          </div>

          {/* Financial Score Label */}
          <div
            style={{
              textAlign: "center",
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: financialScore.color,
              marginBottom: "40px",
            }}
          >
            {financialScore.label}
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {netWorth !== null && (
              <div
                style={{
                  backgroundColor: "#141414",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid #2A3040",
                }}
              >
                <div style={{ fontSize: "14px", color: "#8B95A8", marginBottom: "8px" }}>
                  NET WORTH
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 700,
                    color: netWorth >= 0 ? "#34D399" : "#F87171",
                  }}
                >
                  {netWorth < 0 ? "-" : ""}$
                  {Math.abs(netWorth).toLocaleString()}
                </div>
              </div>
            )}
            {subscriptionBurn > 0 && (
              <div
                style={{
                  backgroundColor: "#141414",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid #2A3040",
                }}
              >
                <div style={{ fontSize: "14px", color: "#8B95A8", marginBottom: "8px" }}>
                  SUBSCRIPTIONS
                </div>
                <div style={{ fontSize: "36px", fontWeight: 700, color: "#FBBF24" }}>
                  ${subscriptionBurn.toFixed(0)}/mo
                </div>
              </div>
            )}
            {savingsRate > 0 && (
              <div
                style={{
                  backgroundColor: "#141414",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid #2A3040",
                  gridColumn: netWorth !== null && subscriptionBurn > 0 ? "1 / -1" : undefined,
                }}
              >
                <div style={{ fontSize: "14px", color: "#8B95A8", marginBottom: "8px" }}>
                  SAVINGS RATE
                </div>
                <div style={{ fontSize: "36px", fontWeight: 700, color: "#34D399" }}>
                  ${Math.round(savingsRate).toLocaleString()}/mo
                </div>
              </div>
            )}
          </div>

          {/* Watermark */}
          <div
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#525C6E",
              marginTop: "auto",
              paddingTop: "40px",
              letterSpacing: "0.1em",
            }}
          >
            CARDCLOCK.DEV
          </div>
        </div>
      </div>
    );
  }
);

export default FullWalletFlexCard;
