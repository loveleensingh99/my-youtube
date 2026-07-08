"use client";

import { RefreshCw } from "lucide-react";
import { APP_NAME } from "@/constants/app";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function Header({ title, onRefresh, isRefreshing = false, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--yt-red)] text-xs font-bold text-white">
          FT
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight">{title ?? APP_NAME}</p>
        </div>
      </div>

      {onRefresh ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh feed"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      ) : null}
    </header>
  );
}
