"use client";

import { useCallback, useEffect } from "react";
import { formatLastUpdated } from "@/utils/date";
import type { Settings } from "@/types";

interface UseRefreshOptions {
  settings: Settings;
  lastUpdated: string | null;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export function useRefresh({
  settings,
  lastUpdated,
  onRefresh,
  isLoading,
}: UseRefreshOptions) {
  const refresh = useCallback(async () => {
    if (isLoading) return;
    await onRefresh();
  }, [isLoading, onRefresh]);

  useEffect(() => {
    if (!settings.autoRefresh) return;

    const intervalMs = settings.refreshInterval * 60 * 1000;
    const timer = window.setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [refresh, settings.autoRefresh, settings.refreshInterval]);

  const lastUpdatedLabel = formatLastUpdated(lastUpdated);

  return {
    refresh,
    lastUpdatedLabel,
  };
}
