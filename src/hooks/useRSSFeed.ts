"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchFeedBatch } from "@/app/actions/rss";
import type { FeedCursor } from "@/types/feed";
import type { Channel, Video } from "@/types";

const RSS_FETCH_TIMEOUT_MS = 30000;
const API_FETCH_TIMEOUT_MS = 45000;

function mergeVideos(existing: Video[], incoming: Video[]): Video[] {
  const seen = new Set(existing.map((video) => video.id));
  const merged = [...existing];

  incoming.forEach((video) => {
    if (seen.has(video.id)) return;
    seen.add(video.id);
    merged.push(video);
  });

  return merged.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function useRSSFeed(channels: Channel[], youtubeApiKey = "") {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedSource, setFeedSource] = useState<"api" | "rss">("rss");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const channelsRef = useRef(channels);
  const apiKeyRef = useRef(youtubeApiKey);
  const cursorRef = useRef<FeedCursor | null>(null);
  const requestIdRef = useRef(0);
  const channelsKey = useMemo(() => channels.map((channel) => channel.id).join("|"), [channels]);
  const fetchKey = useMemo(
    () => `${channelsKey}:${youtubeApiKey.trim() ? "api" : "rss"}`,
    [channelsKey, youtubeApiKey],
  );

  useEffect(() => {
    channelsRef.current = channels;
    apiKeyRef.current = youtubeApiKey;
  }, [channelsKey, channels, youtubeApiKey]);

  const fetchBatch = useCallback(async (cursor: FeedCursor | null, append: boolean) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const activeChannels = channelsRef.current;
    const activeApiKey = apiKeyRef.current.trim();
    const timeoutMs = activeApiKey ? API_FETCH_TIMEOUT_MS : RSS_FETCH_TIMEOUT_MS;

    if (activeChannels.length === 0) {
      setVideos([]);
      setErrors([]);
      setHasMore(false);
      cursorRef.current = null;
      setFeedSource(activeApiKey ? "api" : "rss");
      return true;
    }

    try {
      const result = await Promise.race([
        fetchFeedBatch(activeChannels, activeApiKey || null, cursor),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("Feed request timed out")), timeoutMs);
        }),
      ]);

      if (requestIdRef.current !== requestId) return false;

      setVideos((current) => (append ? mergeVideos(current, result.videos) : result.videos));
      setErrors(result.errors);
      setHasMore(result.hasMore);
      cursorRef.current = result.cursor;
      setFeedSource(result.source);

      if (result.videos.length === 0 && result.errors.length > 0 && !append) {
        setError(result.errors[0] ?? "Unable to load feeds. Check your API key and internet connection.");
      } else {
        setError(null);
        if (!append) {
          setLastUpdated(new Date().toISOString());
        }
      }

      return true;
    } catch (fetchError) {
      if (requestIdRef.current !== requestId) return false;

      const message =
        fetchError instanceof Error && fetchError.message === "Feed request timed out"
          ? "Feed request timed out. Scroll again to load more videos."
          : "Unable to load feeds. Check your API key and internet connection.";

      setError(message);
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    cursorRef.current = null;
    await fetchBatch(null, false);
    setIsLoading(false);
  }, [fetchBatch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;

    setIsLoadingMore(true);
    await fetchBatch(cursorRef.current, true);
    setIsLoadingMore(false);
  }, [fetchBatch, hasMore, isLoading, isLoadingMore]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchKey, refresh]);

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
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    errors,
    feedSource,
    lastUpdated,
    refresh,
  };
}
