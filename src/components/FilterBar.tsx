"use client";

import { cn } from "@/lib/utils";
import type { FeedFilter } from "@/types";
import { Button } from "@/components/ui/button";

const filters: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "videos", label: "Videos" },
  { value: "shorts", label: "Shorts" },
];

interface FilterBarProps {
  filter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  selectedChannelName?: string | null;
  onClearChannel?: () => void;
  className?: string;
}

export function FilterBar({
  filter,
  onFilterChange,
  selectedChannelName,
  onClearChannel,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div
        className="inline-flex rounded-xl border border-border/60 bg-card/50 p-1 backdrop-blur-xl"
        role="tablist"
        aria-label="Feed filters"
      >
        {filters.map((item) => (
          <Button
            key={item.value}
            variant={filter === item.value ? "default" : "ghost"}
            size="sm"
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => onFilterChange(item.value)}
            className="rounded-lg"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {selectedChannelName ? (
        <Button variant="outline" size="sm" onClick={onClearChannel} className="rounded-lg">
          Channel: {selectedChannelName}
          <span className="ml-1 text-muted-foreground">×</span>
        </Button>
      ) : null}
    </div>
  );
}
