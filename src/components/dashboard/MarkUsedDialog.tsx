"use client";

import { useState, useEffect, useCallback } from "react";
import type { BenefitWithCard } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/benefits/roi";
import { formatPeriodLabel } from "@/lib/benefits/deadline";
import { cn } from "@/lib/utils";

interface MarkUsedDialogProps {
  benefit: BenefitWithCard | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (benefitId: string, amount: number, isFullyUsed: boolean) => void;
}

export default function MarkUsedDialog({
  benefit,
  isOpen,
  onClose,
  onConfirm,
}: MarkUsedDialogProps) {
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (isOpen && benefit) {
      setMode("full");
      setAmount(String(benefit.cc_benefit_value));
    }
  }, [isOpen, benefit]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleConfirm = useCallback(() => {
    if (!benefit) return;
    const numAmount = parseFloat(amount) || 0;
    const isFullyUsed = mode === "full" || numAmount >= benefit.cc_benefit_value;
    onConfirm(benefit.id, numAmount, isFullyUsed);
  }, [benefit, amount, mode, onConfirm]);

  if (!isOpen || !benefit) return null;

  const maxValue = benefit.cc_benefit_value;
  const parsedAmount = parseFloat(amount) || 0;
  const isValid = parsedAmount > 0 && parsedAmount <= maxValue;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-card p-6 shadow-2xl">
        {/* Header */}
        <h3 className="text-base font-semibold text-text-primary">
          Mark Benefit as Used
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          {benefit.cc_benefit_name}
        </p>

        {/* Benefit info */}
        <div className="mt-4 flex items-center gap-4 rounded-lg bg-bg-elevated px-4 py-3">
          <div className="flex-1">
            <span className="text-xs text-text-muted">Value</span>
            <div className="font-mono-data text-sm font-semibold text-text-primary">
              {formatCurrency(maxValue)}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-xs text-text-muted">Period</span>
            <div className="text-sm text-text-primary">
              {formatPeriodLabel(benefit.cc_benefit_period)}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-xs text-text-muted">Card</span>
            <div className="text-sm text-text-primary truncate">
              {benefit.card.cc_card_name}
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mt-4 flex rounded-lg border border-border bg-bg-elevated p-1">
          <button
            onClick={() => {
              setMode("full");
              setAmount(String(maxValue));
            }}
            className={cn(
              "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "full"
                ? "bg-[#60A5FA]/15 text-[#60A5FA]"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Full
          </button>
          <button
            onClick={() => {
              setMode("partial");
              setAmount("");
            }}
            className={cn(
              "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "partial"
                ? "bg-[#60A5FA]/15 text-[#60A5FA]"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Partial
          </button>
        </div>

        {/* Amount input (partial mode) */}
        {mode === "partial" && (
          <div className="mt-4">
            <label className="text-xs text-text-secondary">Amount used</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                $
              </span>
              <input
                type="number"
                min={0}
                max={maxValue}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-border bg-bg-elevated py-2 pl-7 pr-3 font-mono-data text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-[#60A5FA] transition-colors"
              />
            </div>
            <span className="mt-1 block text-xs text-text-muted">
              Max: {formatCurrency(maxValue)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isValid
                ? "cursor-pointer bg-[#60A5FA] text-white hover:bg-[#60A5FA]/90"
                : "bg-bg-elevated text-text-muted cursor-not-allowed"
            )}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
