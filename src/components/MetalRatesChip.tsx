"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatInr, type MetalRates } from "@/lib/ibja";
import { cn } from "@/lib/utils";

function RateRow({
  label,
  sublabel,
  value,
}: {
  label: string;
  sublabel: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
      <p className="shrink-0 text-base font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

export function MetalRatesChip({ className }: { className?: string }) {
  const [rates, setRates] = useState<MetalRates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/metal-rates");
      const data = (await response.json()) as MetalRates & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load rates");
      }
      setRates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rates");
      setRates(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRates();
  }, [loadRates]);

  const goldLabel = rates ? formatInr(rates.gold24k10g) : "—";
  const silverLabel = rates ? formatInr(rates.silver1kg) : "—";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading && !rates}
        className={cn(
          "flex w-full items-center gap-3 border-b border-white/10 bg-[#141414] px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-60",
          className,
        )}
        aria-label="View IBJA gold and silver rates"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-amber-400/90">
            IBJA · Chandigarh
          </p>
          {error && !rates ? (
            <p className="truncate text-xs text-muted-foreground">{error}</p>
          ) : (
            <p className="truncate text-sm tabular-nums text-foreground/90">
              <span className="text-muted-foreground">Gold: </span>
              {loading && !rates ? "…" : goldLabel}
              <span className="mx-1.5 text-white/20">·</span>
              <span className="text-muted-foreground">Silver: </span>
              {loading && !rates ? "…" : silverLabel}
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Metal rates</DialogTitle>
            <p className="text-xs text-muted-foreground">
              IBJA national benchmark · excl. GST &amp; making charges
              {rates ? ` · ${rates.session} session` : null}
            </p>
          </DialogHeader>

          {error && !rates ? (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => void loadRates()}
                className="text-sm font-medium text-amber-400 hover:text-amber-300"
              >
                Retry
              </button>
            </div>
          ) : (
            <div>
              <RateRow
                label="24 carat gold"
                sublabel="10 grams"
                value={rates ? formatInr(rates.gold24k10g) : "—"}
              />
              <RateRow
                label="22 carat gold"
                sublabel="10 grams"
                value={rates ? formatInr(rates.gold22k10g) : "—"}
              />
              <RateRow
                label="Silver"
                sublabel="1 kilogram"
                value={rates ? formatInr(rates.silver1kg) : "—"}
              />
            </div>
          )}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Source:{" "}
            <a
              href="https://ibjarates.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              ibjarates.com
            </a>
            . Same IBJA rate applies nationwide (including Chandigarh).
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
