"use client";

import { Toaster } from "sonner";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { SideNav, SideNavProvider } from "@/components/SideNav";
import { useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";

interface AppProvidersProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export function AppProviders({ children, onRefresh }: AppProvidersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { configured, loading, user } = useFirebaseAuthContext();
  const isWatchPage = pathname.startsWith("/watch/");
  const isLoginPage = pathname === "/login";
  useKeyboardShortcuts(onRefresh ?? (() => undefined));

  useEffect(() => {
    if (!configured || loading) {
      return;
    }

    if (!user && !isLoginPage) {
      router.replace("/login");
      return;
    }

    if (user && isLoginPage) {
      router.replace("/");
    }
  }, [configured, isLoginPage, loading, router, user]);

  const shouldHideApp = configured && !loading && ((isLoginPage && !!user) || (!isLoginPage && !user));

  return (
    <SideNavProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background text-foreground">
        <div
          className={cn(
            "flex min-h-dvh flex-1 flex-col",
            !isWatchPage && "pb-[calc(3.5rem+env(safe-area-inset-bottom))]",
          )}
        >
          {shouldHideApp ? null : children}
        </div>
        {!isWatchPage && !isLoginPage ? (
          <>
            <BottomNav />
            <SideNav />
          </>
        ) : null}
      </div>
      <Toaster theme="dark" richColors closeButton position="top-center" />
    </SideNavProvider>
  );
}
