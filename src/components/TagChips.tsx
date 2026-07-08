"use client";

import { cn } from "@/lib/utils";

interface TagChipsProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allActive?: boolean;
}

export function TagChips({
  tags,
  selectedTag,
  onSelectTag,
  allActive = !selectedTag,
}: TagChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <FilterChip
        label="All"
        isActive={!selectedTag && allActive}
        onClick={() => onSelectTag(null)}
      />
      {tags.map((tag) => (
        <FilterChip
          key={tag}
          label={tag}
          isActive={selectedTag === tag}
          onClick={() => onSelectTag(tag)}
          className="max-w-[10rem] truncate"
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  isActive,
  onClick,
  className,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-white text-[#0f0f0f] shadow-sm"
          : "bg-white/10 text-white/90 hover:bg-white/15",
        className,
      )}
    >
      {label}
    </button>
  );
}
