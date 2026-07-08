"use client";

import { useCallback, useMemo } from "react";
import { normalizeWatchHistory } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/app";
import type { WatchHistoryItem } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

const EMPTY_HISTORY: WatchHistoryItem[] = [];

export function useWatchHistory() {
  const { value: history, setValue, isHydrated } = useLocalStorage<WatchHistoryItem[]>(
    STORAGE_KEYS.watchHistory,
    EMPTY_HISTORY,
    normalizeWatchHistory,
  );

  const watchedIds = useMemo(() => new Set(history.map((item) => item.videoId)), [history]);

  const markAsWatched = useCallback(
    (item: Omit<WatchHistoryItem, "watchedAt"> & { watchedAt?: string }) => {
      setValue((prev) => {
        if (prev[0]?.videoId === item.videoId) {
          return prev;
        }

        const filtered = prev.filter((entry) => entry.videoId !== item.videoId);
        return [
          {
            ...item,
            watchedAt: item.watchedAt ?? new Date().toISOString(),
          },
          ...filtered,
        ].slice(0, 100);
      });
    },
    [setValue],
  );

  const removeFromHistory = useCallback(
    (videoId: string) => {
      setValue((prev) => prev.filter((item) => item.videoId !== videoId));
    },
    [setValue],
  );

  const clearHistory = useCallback(() => {
    setValue([]);
  }, [setValue]);

  const isWatched = useCallback(
    (videoId: string) => watchedIds.has(videoId),
    [watchedIds],
  );

  const continueWatching = useMemo(
    () =>
      history
        .filter((item) => item.progress !== undefined && item.progress < 95)
        .slice(0, 6),
    [history],
  );

  const recentlyWatched = useMemo(() => history.slice(0, 12), [history]);

  return {
    history,
    watchedIds,
    markAsWatched,
    removeFromHistory,
    clearHistory,
    isWatched,
    continueWatching,
    recentlyWatched,
    isHydrated,
  };
}
