"use client";

import { AppProviders } from "@/components/AppProviders";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FeedProvider, useFeedContext } from "@/components/FeedProvider";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { refresh } = useFeedContext();
  return <AppProviders onRefresh={() => void refresh()}>{children}</AppProviders>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <FeedProvider>
        <AppShellInner>{children}</AppShellInner>
      </FeedProvider>
    </ErrorBoundary>
  );
}
