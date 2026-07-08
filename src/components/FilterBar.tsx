"use client";

import { cn } from "@/lib/utils";
import type { FeedFilter } from "@/types";

const filters: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "videos", label: "Videos" },
  { value: "shorts", label: "Shorts" },
];

interface FilterBarProps {
  filter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  className?: string;
  items?: { value: FeedFilter; label: string }[];
}

export function FilterBar({
  filter,
  onFilterChange,
  className,
  items = filters,
}: FilterBarProps) {
  return (
    <div className={cn("px-4 pb-3", className)} role="tablist" aria-label="Feed filters">
      <div className="flex rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => onFilterChange(item.value)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-xs font-medium transition-all duration-200 sm:text-sm",
              filter === item.value
                ? "bg-white text-[#0f0f0f] shadow-sm"
                : "text-white/60 hover:text-white/90",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
