"use client";

import { useState, useRef } from "react";
import { generateRoast } from "@/lib/roast";
import ShareableCard from "@/components/shareable/ShareableCard";
import ShareActions from "@/components/shareable/ShareActions";

interface RoastModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletScore: number;
  onRoastGenerated: () => void;
}

export default function RoastModal({
  isOpen,
  onClose,
  walletScore,
  onRoastGenerated,
}: RoastModalProps) {
  const [roastText, setRoastText] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(3);
  const [limited, setLimited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square">("square");
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleRoast = async () => {
    setLoading(true);
    const result = await generateRoast(walletScore);
    setRoastText(result.text);
    setRemaining(result.remaining);
    setLimited(result.limited);
    setLoading(false);
    if (!result.limited) {
      onRoastGenerated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#2A3040] bg-[#0A0A0A] p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-text-primary"
        >
          ✕
        </button>

        <h2
          className="mb-6 text-center font-display text-lg"
          style={{ color: "#FF3131" }}
        >
          🔥 ROAST MY WALLET 🔥
        </h2>

        {!roastText && !loading && (
          <div className="text-center">
            <p className="mb-4 text-sm text-text-secondary">
              ready to hear the truth about your wallet?
            </p>
            <button
              onClick={handleRoast}
              className="rounded-lg border-3 border-neon-red px-6 py-3 font-display text-sm text-neon-red transition-opacity hover:opacity-80"
            >
              ROAST ME
            </button>
            <p className="mt-2 text-xs text-text-muted">
              {remaining} roast{remaining !== 1 ? "s" : ""} remaining today
            </p>
          </div>
        )}

        {loading && (
          <div className="py-8 text-center text-sm text-text-secondary">
            analyzing your wallet...
          </div>
        )}

        {roastText && (
          <div className="animate-roast-reveal space-y-4">
            {/* Roast text display */}
            <div className="rounded-lg border-2 border-neon-red bg-[#1A1A1A] p-4">
              <p className="text-sm italic text-text-primary">&ldquo;{roastText}&rdquo;</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRoast}
                disabled={limited}
                className="rounded-lg border-3 border-neon-red px-4 py-2 font-display text-xs text-neon-red transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {limited ? "LIMIT REACHED" : "ROAST AGAIN"}
              </button>
            </div>

            {!limited && (
              <p className="text-xs text-text-muted">
                {remaining} roast{remaining !== 1 ? "s" : ""} remaining today
              </p>
            )}

            {/* Shareable card */}
            <div className="border-t border-[#2A3040] pt-4">
              <h3 className="mb-3 font-display text-xs text-text-secondary">
                SHARE YOUR ROAST
              </h3>
              <ShareActions
                cardRef={cardRef}
                filename="cardclock-roast"
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
              />
              <div className="mt-3 flex justify-center">
                <ShareableCard ref={cardRef} aspectRatio={aspectRatio} variant="roast">
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontWeight: 700,
                      fontSize: "28px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#FF3131",
                      textAlign: "center",
                    }}
                  >
                    🔥 WALLET ROAST 🔥
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontStyle: "italic",
                        fontSize: "18px",
                        fontWeight: 400,
                        color: "#FAFAFA",
                        textAlign: "center",
                        lineHeight: 1.6,
                      }}
                    >
                      &ldquo;{roastText}&rdquo;
                    </p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        fontSize: "48px",
                        color: walletScore >= 80 ? "#39FF14" : walletScore >= 50 ? "#FFE600" : "#FF3131",
                      }}
                    >
                      {walletScore}
                    </span>
                    <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                      WALLET SCORE
                    </div>
                  </div>
                </ShareableCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
