"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export function TagInput({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  className,
}: TagInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    return suggestions.filter((tag) => {
      if (!query) {
        return true;
      }

      return tag.toLowerCase().includes(query) && tag.toLowerCase() !== query;
    });
  }, [suggestions, value]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const showSuggestions = open && filteredSuggestions.length > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={`${id}-suggestions`}
      />

      {showSuggestions ? (
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-border/60 bg-popover py-1 shadow-lg"
        >
          {filteredSuggestions.map((tag) => (
            <li key={tag} role="option" aria-selected={value === tag}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(tag);
                  setOpen(false);
                }}
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
