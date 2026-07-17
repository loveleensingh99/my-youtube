"use client";

import { ArrowLeft, Menu, RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppLogoMark } from "@/components/AppLogoMark";
import { APP_NAME } from "@/constants/app";
import { Button } from "@/components/ui/button";
import { useSideNav } from "@/components/SideNav";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function Header({
  title,
  onBack,
  onRefresh,
  isRefreshing = false,
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const { setOpen } = useSideNav();
  const showMenu = !onBack && pathname !== "/login";

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
        ) : showMenu ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
          <AppLogoMark className="h-7 w-7 shrink-0" />
        )}
        {showMenu ? <AppLogoMark className="h-7 w-7 shrink-0" /> : null}
        <div className="flex min-w-0 items-center gap-2">
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
