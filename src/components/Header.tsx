"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import { AppLogoMark } from "@/components/AppLogoMark";
import { APP_NAME } from "@/constants/app";
import { Button } from "@/components/ui/button";
import { FeedSourceBadge } from "@/components/FeedSourceBadge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  feedSource?: "api" | "rss";
  className?: string;
}

export function Header({
  title,
  onBack,
  onRefresh,
  isRefreshing = false,
  feedSource,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-background/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <AppLogoMark className="h-7 w-7 shrink-0" />
        )}
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-base font-semibold tracking-tight">{title ?? APP_NAME}</p>
          {feedSource ? <FeedSourceBadge source={feedSource} /> : null}
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
