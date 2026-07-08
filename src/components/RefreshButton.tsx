"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdatedLabel?: string;
  className?: string;
}

export function RefreshButton({
  onRefresh,
  isLoading = false,
  lastUpdatedLabel,
  className,
}: RefreshButtonProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {lastUpdatedLabel ? (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {lastUpdatedLabel}
        </span>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        aria-label="Refresh feed"
      >
        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        Refresh
      </Button>
    </div>
  );
}
