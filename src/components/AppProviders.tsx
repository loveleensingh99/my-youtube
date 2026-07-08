"use client";

import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";

interface AppProvidersProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export function AppProviders({ children, onRefresh }: AppProvidersProps) {
  const pathname = usePathname();
  const isWatchPage = pathname.startsWith("/watch/");
  useKeyboardShortcuts(onRefresh ?? (() => undefined));

  return (
    <>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col bg-background text-foreground">
        <div
          className={cn(
            "flex min-h-[100dvh] flex-1 flex-col",
            !isWatchPage && "pb-[calc(3.5rem+env(safe-area-inset-bottom))]",
          )}
        >
          {children}
        </div>
        {!isWatchPage ? <BottomNav /> : null}
      </div>
      <Toaster theme="dark" richColors closeButton position="top-center" />
    </>
  );
}
