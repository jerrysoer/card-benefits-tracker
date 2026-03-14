"use client";

import { useState } from "react";
import { exportToPng, copyToClipboard, downloadPng } from "@/lib/export";

interface ShareActionsProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
  aspectRatio: "portrait" | "square";
  onAspectRatioChange: (ratio: "portrait" | "square") => void;
}

export default function ShareActions({
  cardRef,
  filename,
  aspectRatio,
  onAspectRatioChange,
}: ShareActionsProps) {
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (action: "download" | "copy") => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const blob = await exportToPng(cardRef.current);
      if (action === "download") {
        await downloadPng(blob, filename);
      } else {
        const success = await copyToClipboard(blob);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          await downloadPng(blob, filename);
        }
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Aspect ratio toggle */}
      <div className="flex rounded-lg border-2 border-[#2A3040]">
        <button
          onClick={() => onAspectRatioChange("portrait")}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
            aspectRatio === "portrait"
              ? "bg-[#2A3040] text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          9:16
        </button>
        <button
          onClick={() => onAspectRatioChange("square")}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
            aspectRatio === "square"
              ? "bg-[#2A3040] text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          1:1
        </button>
      </div>

      <button
        onClick={() => handleExport("download")}
        disabled={exporting}
        className="rounded-lg border-3 border-neon-green px-4 py-2 font-display text-xs text-neon-green transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {exporting ? "EXPORTING..." : "DOWNLOAD PNG"}
      </button>
      <button
        onClick={() => handleExport("copy")}
        disabled={exporting}
        className="rounded-lg border-3 border-neon-blue px-4 py-2 font-display text-xs text-neon-blue transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {copied ? "COPIED!" : "COPY TO CLIPBOARD"}
      </button>
    </div>
  );
}
