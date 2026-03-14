"use client";

import { forwardRef } from "react";

export type ShareableVariant =
  | "default"
  | "roast"
  | "wrapped"
  | "yearinreview"
  | "collection"
  | "fullwallet";

interface ShareableCardProps {
  children: React.ReactNode;
  aspectRatio?: "portrait" | "square";
  variant?: ShareableVariant;
  borderColor?: string;
  showWatermark?: boolean;
  watermarkText?: string;
}

const VARIANT_BORDER: Record<ShareableVariant, string> = {
  default: "#FAFAFA",
  roast: "#FF3131",
  wrapped: "#BF5AF2",
  yearinreview: "#FFD700",
  collection: "#FFD700",
  fullwallet: "#39FF14",
};

const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  function ShareableCard(
    {
      children,
      aspectRatio = "portrait",
      variant = "default",
      borderColor,
      showWatermark = true,
      watermarkText = "cardclock.dev",
    },
    ref
  ) {
    const width = 1080;
    const height = aspectRatio === "portrait" ? 1350 : 1080;
    const scale = 0.35;
    const border = borderColor ?? VARIANT_BORDER[variant];

    const now = new Date();
    const monthLabel = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

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
          <div
            style={{
              border: `4px solid ${border}`,
              borderRadius: "16px",
              padding: "48px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {children}

            {showWatermark && (
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
                  {watermarkText}
                </span>
                <span>{monthLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default ShareableCard;
