"use client";

import { FilterBar } from "@/components/FilterBar";
import { TagChips } from "@/components/TagChips";
import type { FeedFilter } from "@/types";

interface FeedToolbarProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allActive?: boolean;
  filter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
}

export function FeedToolbar({
  tags,
  selectedTag,
  onSelectTag,
  allActive,
  filter,
  onFilterChange,
}: FeedToolbarProps) {
  return (
    <section className="border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-md">
      <TagChips
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={onSelectTag}
        allActive={allActive}
      />
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <FilterBar filter={filter} onFilterChange={onFilterChange} className="pt-3" />
    </section>
  );
}
