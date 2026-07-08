"use client";

import { useCallback, useEffect, useMemo } from "react";
import { formatLastUpdated } from "@/utils/date";
import type { Settings } from "@/types";

interface UseRefreshOptions {
  settings: Settings;
  lastUpdated: string | null;
  onRefresh: () => Promise<void>;
}

export function useRefresh({ settings, lastUpdated, onRefresh }: UseRefreshOptions) {
  const refresh = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  useEffect(() => {
    if (!settings.autoRefresh) return;

    const intervalMs = settings.refreshInterval * 60 * 1000;
    const timer = window.setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [refresh, settings.autoRefresh, settings.refreshInterval]);

  const lastUpdatedLabel = useMemo(
    () => formatLastUpdated(lastUpdated),
    [lastUpdated],
  );

  return {
    refresh,
    lastUpdatedLabel,
  };
}
