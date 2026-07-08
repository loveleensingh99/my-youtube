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
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelectTag(null)}
        className={cn(
          "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          !selectedTag && allActive
            ? "bg-foreground text-background"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelectTag(tag)}
          className={cn(
            "max-w-[10rem] shrink-0 truncate rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            selectedTag === tag
              ? "bg-foreground text-background"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
