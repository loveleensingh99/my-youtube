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
  className?: string;
}

export function FilterBar({ filter, onFilterChange, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="tablist"
      aria-label="Feed filters"
    >
      {filters.map((item) => (
        <Button
          key={item.value}
          variant={filter === item.value ? "default" : "secondary"}
          size="sm"
          role="tab"
          aria-selected={filter === item.value}
          onClick={() => onFilterChange(item.value)}
          className="h-8 shrink-0 rounded-lg px-3 text-xs"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
