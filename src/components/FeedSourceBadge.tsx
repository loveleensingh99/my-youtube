"use client";

import { cn } from "@/lib/utils";

interface FeedSourceBadgeProps {
  source: "api" | "rss";
  className?: string;
}

export function FeedSourceBadge({ source, className }: FeedSourceBadgeProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        source === "api"
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-amber-500/15 text-amber-300",
        className,
      )}
    >
      {source === "api" ? "API" : "RSS"}
    </span>
  );
}
