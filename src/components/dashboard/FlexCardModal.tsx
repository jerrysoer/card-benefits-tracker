"use client";

import { useState, useRef, useCallback } from "react";
import type { CardROI } from "@/lib/supabase/types";
import type { BadgeState } from "@/lib/badges";
import WalletFlexCard from "@/components/dashboard/WalletFlexCard";

interface FlexCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletScore: number;
  cardROIs: CardROI[];
  streak: number;
  walletValue: number;
  // Phase 3 additions
  badgeState?: BadgeState;
  runwayMonths?: number | null;
  challengeStats?: { completed: number; total: number };
  roastExcerpt?: string | null;
}

export default function FlexCardModal({
  isOpen,
  onClose,
  walletScore,
  cardROIs,
  streak,
  walletValue,
  badgeState,
  runwayMonths,
  challengeStats,
  roastExcerpt,
}: FlexCardModalProps) {
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square">("portrait");
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const captureCard = useCallback(async () => {
    if (!cardRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;

    const innerCard = cardRef.current;
    const canvas = await html2canvas(innerCard, {
      scale: 1,
      backgroundColor: "#0A0A0A",
      width: 1080,
      height: aspectRatio === "portrait" ? 1350 : 1080,
      windowWidth: 1080,
      windowHeight: aspectRatio === "portrait" ? 1350 : 1080,
    });
    return canvas;
  }, [aspectRatio]);

  const handleDownload = async () => {
    setExporting(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `cardclock-wallet-score-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    setExporting(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        } catch {
          const link = document.createElement("a");
          link.download = `cardclock-wallet-score-${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
        setExporting(false);
      }, "image/png");
    } catch {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-lg rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm text-text-secondary">
            SHARE YOUR WALLET
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setAspectRatio("portrait")}
            className={`rounded border-2 px-3 py-1 text-xs font-bold transition-colors ${
              aspectRatio === "portrait"
                ? "border-[#111] text-[#111]"
                : "border-[#E5E7EB] text-text-muted hover:text-text-primary"
            }`}
          >
            Portrait
          </button>
          <button
            onClick={() => setAspectRatio("square")}
            className={`rounded border-2 px-3 py-1 text-xs font-bold transition-colors ${
              aspectRatio === "square"
                ? "border-[#111] text-[#111]"
                : "border-[#E5E7EB] text-text-muted hover:text-text-primary"
            }`}
          >
            Square
          </button>
        </div>

        <div className="mb-4 flex justify-center overflow-hidden rounded-lg">
          <WalletFlexCard
            ref={cardRef}
            walletScore={walletScore}
            cardROIs={cardROIs}
            streak={streak}
            walletValue={walletValue}
            aspectRatio={aspectRatio}
            badgeState={badgeState}
            runwayMonths={runwayMonths}
            challengeStats={challengeStats}
            roastExcerpt={roastExcerpt}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={exporting}
            className="flex-1 rounded-full border-2 border-[#111] bg-[#111] py-3 font-display text-xs text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Download PNG"}
          </button>
          <button
            onClick={handleCopy}
            disabled={exporting}
            className="flex-1 rounded-full border-2 border-[#111] bg-transparent py-3 font-display text-xs text-[#111] transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
