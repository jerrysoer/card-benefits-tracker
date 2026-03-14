"use client";

import { useRef, useState } from "react";
import type { CardROI } from "@/lib/supabase/types";
import { calculateGrade } from "@/lib/scoring";
import { formatCurrency } from "@/lib/benefits/roi";
import { getIssuerName } from "@/lib/utils";
import ShareableCard from "@/components/shareable/ShareableCard";
import ShareActions from "@/components/shareable/ShareActions";

interface CardCollectionProps {
  cardROIs: CardROI[];
}

const ISSUER_COLORS: Record<string, string> = {
  amex: "#006FCF",
  chase: "#124A8C",
  citi: "#003B70",
  capital_one: "#D12A2F",
  bilt: "#000000",
  barclays: "#00AEEF",
  us_bank: "#D41F30",
};

export default function CardCollection({ cardROIs }: CardCollectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showExport, setShowExport] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square">("square");

  const issuers = new Set(cardROIs.map((r) => r.card.cc_issuer));
  const totalFees = cardROIs.reduce((sum, r) => sum + r.annualFee, 0);
  const totalCaptured = cardROIs.reduce((sum, r) => sum + r.totalCaptured, 0);

  const grades = cardROIs.map((r) => calculateGrade(r.totalCaptured, r.annualFee));
  const gradeValues: Record<string, number> = {
    "A+": 4.3, A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0, FREE: 4.0,
  };
  const avgGradeNum =
    grades.length > 0
      ? grades.reduce((sum, g) => sum + (gradeValues[g.grade] ?? 0), 0) / grades.length
      : 0;
  const avgGradeLabel =
    avgGradeNum >= 4.15 ? "A+" :
    avgGradeNum >= 3.5 ? "A" :
    avgGradeNum >= 2.5 ? "B" :
    avgGradeNum >= 1.5 ? "C" :
    avgGradeNum >= 0.5 ? "D" : "F";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm text-text-secondary">YOUR COLLECTION</h2>
        <button
          onClick={() => setShowExport(!showExport)}
          className="text-xs text-[#10B981] transition-opacity hover:opacity-80"
        >
          {showExport ? "HIDE EXPORT" : "SHARE COLLECTION"}
        </button>
      </div>

      {/* Stats bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono-data font-bold text-text-primary">{cardROIs.length} CARDS</span>
        <span className="text-text-muted">&middot;</span>
        <span className="font-mono-data font-bold text-text-primary">{issuers.size} ISSUERS</span>
        <span className="text-text-muted">&middot;</span>
        <span className="font-mono-data font-bold text-text-primary">{formatCurrency(totalFees)} FEES</span>
        <span className="text-text-muted">&middot;</span>
        <span className="font-mono-data font-bold text-[#10B981]">{formatCurrency(totalCaptured)} CAPTURED</span>
        <span className="text-text-muted">&middot;</span>
        <span className="font-mono-data font-bold text-text-primary">AVG GRADE: {avgGradeLabel}</span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cardROIs.map((roi) => {
          const grade = calculateGrade(roi.totalCaptured, roi.annualFee);
          const bgColor = ISSUER_COLORS[roi.card.cc_issuer] ?? "#333";

          return (
            <div
              key={roi.card.id}
              className="group relative overflow-hidden rounded-lg transition-transform hover:z-10 hover:scale-105"
              style={{
                width: "100%",
                aspectRatio: "120/76",
                backgroundColor: bgColor,
              }}
            >
              {/* Diagonal stripe overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                }}
              />

              {/* Grade badge */}
              <div
                className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded font-mono-data text-[10px] font-bold"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: grade.color,
                  border: `1px solid ${grade.color}`,
                }}
              >
                {grade.grade}
              </div>

              {/* Card name */}
              <div className="absolute bottom-2 left-2 right-8">
                <span className="text-[10px] font-bold leading-tight text-white">
                  {roi.card.cc_card_name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export section */}
      {showExport && (
        <div className="mt-4 space-y-3">
          <ShareActions
            cardRef={cardRef}
            filename="cardclock-collection"
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
          />
          <div className="flex justify-center">
            <ShareableCard ref={cardRef} aspectRatio={aspectRatio} variant="collection">
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700,
                  fontSize: "28px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#666666",
                }}
              >
                CARDCLOCK
              </div>
              <div style={{ textAlign: "center", margin: "32px 0" }}>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    fontSize: "20px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#666666",
                    marginBottom: "24px",
                  }}
                >
                  MY COLLECTION
                </div>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  {cardROIs.map((roi) => {
                    const grade = calculateGrade(roi.totalCaptured, roi.annualFee);
                    const bgColor = ISSUER_COLORS[roi.card.cc_issuer] ?? "#333";
                    return (
                      <div
                        key={roi.card.id}
                        style={{
                          width: "120px",
                          height: "76px",
                          backgroundColor: bgColor,
                          borderRadius: "8px",
                          position: "relative",
                          display: "flex",
                          alignItems: "flex-end",
                          padding: "8px",
                        }}
                      >
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>
                          {roi.card.cc_card_name.split(" ").slice(0, 3).join(" ")}
                        </span>
                        <div
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: grade.color,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {grade.grade}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ textAlign: "center", fontSize: "14px", color: "#888" }}>
                {cardROIs.length} CARDS &middot; {issuers.size} ISSUERS &middot; {formatCurrency(totalFees)} FEES &middot; {formatCurrency(totalCaptured)} CAPTURED &middot; AVG: {avgGradeLabel}
              </div>
            </ShareableCard>
          </div>
        </div>
      )}
    </div>
  );
}
