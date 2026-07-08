"use client";

import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface AppProvidersProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export function AppProviders({ children, onRefresh }: AppProvidersProps) {
  useKeyboardShortcuts(onRefresh ?? (() => undefined));

  return (
    <>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col lg:pl-0">{children}</div>
      </div>
      <Toaster theme="dark" richColors closeButton position="bottom-right" />
    </>
  );
}
