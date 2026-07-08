"use client";

import { MoonStar } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import { getCurrentDateLabel } from "@/utils/date";
import type { FeedFilter } from "@/types";

interface HeaderProps {
  title: string;
  filter?: FeedFilter;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdatedLabel?: string;
}

const filterLabels: Record<FeedFilter, string> = {
  all: "All content",
  videos: "Videos only",
  shorts: "Shorts only",
};

export function Header({
  title,
  filter,
  onRefresh,
  isRefreshing = false,
  lastUpdatedLabel,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 pl-12 lg:pl-0">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {getCurrentDateLabel()}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {filter ? (
            <p className="text-sm text-muted-foreground">{filterLabels[filter]}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 pl-12 lg:pl-0">
          <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-2 text-xs text-muted-foreground">
            <MoonStar className="h-3.5 w-3.5" />
            Dark mode
          </div>
          {onRefresh ? (
            <RefreshButton
              onRefresh={onRefresh}
              isLoading={isRefreshing}
              lastUpdatedLabel={lastUpdatedLabel}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
