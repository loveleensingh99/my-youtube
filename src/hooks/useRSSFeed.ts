"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchFeedVideos } from "@/app/actions/rss";
import { STORAGE_KEYS } from "@/constants/app";
import type { Video } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

export function useRSSFeed() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const hasLoadedRef = useRef(false);
  const { value: lastUpdated, setValue: setLastUpdated } = useLocalStorage<string | null>(
    STORAGE_KEYS.lastRefresh,
    null,
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFeedVideos();
      setVideos(result.videos);
      setErrors(result.errors);

      if (result.videos.length === 0 && result.errors.length > 0) {
        setError("Unable to load feeds. Check your internet connection.");
      } else {
        setLastUpdated(new Date().toISOString());
      }
    } catch {
      setError("Unable to load feeds. Check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  }, [setLastUpdated]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    void refresh();
  }, [refresh]);

  const videosByChannel = useMemo(() => {
    const map = new Map<string, Video[]>();
    videos.forEach((video) => {
      const existing = map.get(video.channelId) ?? [];
      map.set(video.channelId, [...existing, video]);
    });
    return map;
  }, [videos]);

  return {
    videos,
    videosByChannel,
    isLoading,
    error,
    errors,
    lastUpdated,
    refresh,
  };
}
