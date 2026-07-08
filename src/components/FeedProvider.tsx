"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { resolveChannelInput } from "@/app/actions/channels";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { useSettings } from "@/hooks/useSettings";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useFilters } from "@/hooks/useFilters";
import { useRefresh } from "@/hooks/useRefresh";
import { useChannels } from "@/hooks/useChannels";
import type { Channel, FeedFilter, Settings, Video, WatchHistoryItem } from "@/types";

interface FeedContextValue {
  channels: Channel[];
  addChannel: (channel: Channel) => void;
  removeChannel: (channelId: string) => void;
  addChannelFromInput: (
    input: string,
    name?: string,
    category?: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  videos: Video[];
  videosByChannel: Map<string, Video[]>;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  error: string | null;
  errors: string[];
  feedSource: "api" | "rss";
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  lastUpdatedLabel: string;
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
  settingsHydrated: boolean;
  watchedIds: Set<string>;
  markAsWatched: (item: Omit<WatchHistoryItem, "watchedAt">) => void;
  removeFromHistory: (videoId: string) => void;
  clearHistory: () => void;
  continueWatching: WatchHistoryItem[];
  recentlyWatched: WatchHistoryItem[];
  history: WatchHistoryItem[];
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;
  selectedChannel: string | null;
  selectChannel: (channelId: string | null) => void;
  clearChannelFilter: () => void;
  channelsSyncError: string | null;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const {
    channels,
    addChannel,
    removeChannel,
    hasChannel,
    isHydrated: settingsHydratedChannels,
    syncError: channelsSyncError,
  } = useChannels();
  const { settings, updateSettings, resetSettings, isHydrated: settingsHydrated } =
    useSettings();
  const history = useWatchHistory();
  const filters = useFilters(settings.defaultFilter);
  const channelsToFetch = useMemo(() => {
    if (!filters.selectedChannel) return channels;
    return channels.filter((channel) => channel.id === filters.selectedChannel);
  }, [channels, filters.selectedChannel]);
  const feed = useRSSFeed(channelsToFetch, settings.youtubeApiKey);
  const refreshState = useRefresh({
    settings,
    lastUpdated: feed.lastUpdated,
    onRefresh: feed.refresh,
  });

  const addChannelFromInput = useCallback(
    async (input: string, name?: string, category?: string) => {
      const result = await resolveChannelInput(input, name, category);

      if ("error" in result) {
        return { ok: false as const, error: result.error };
      }

      if (hasChannel(result.channel.id)) {
        return { ok: false as const, error: "That channel is already in your list." };
      }

      addChannel(result.channel);
      return { ok: true as const };
    },
    [addChannel, hasChannel],
  );

  const value = useMemo<FeedContextValue>(
    () => ({
      channels,
      addChannel,
      removeChannel,
      addChannelFromInput,
      videos: feed.videos,
      videosByChannel: feed.videosByChannel,
      isLoading: feed.isLoading,
      isLoadingMore: feed.isLoadingMore,
      hasMore: feed.hasMore,
      loadMore: feed.loadMore,
      error: feed.error,
      errors: feed.errors,
      feedSource: feed.feedSource,
      lastUpdated: feed.lastUpdated,
      refresh: refreshState.refresh,
      lastUpdatedLabel: refreshState.lastUpdatedLabel,
      settings,
      updateSettings,
      resetSettings,
      settingsHydrated: settingsHydrated && settingsHydratedChannels,
      watchedIds: history.watchedIds,
      markAsWatched: history.markAsWatched,
      removeFromHistory: history.removeFromHistory,
      clearHistory: history.clearHistory,
      continueWatching: history.continueWatching,
      recentlyWatched: history.recentlyWatched,
      history: history.history,
      filter: filters.filter,
      setFilter: filters.setFilter,
      selectedChannel: filters.selectedChannel,
      selectChannel: filters.selectChannel,
      clearChannelFilter: filters.clearChannelFilter,
      channelsSyncError,
    }),
    [
      channels,
      addChannel,
      removeChannel,
      addChannelFromInput,
      feed.videos,
      feed.videosByChannel,
      feed.isLoading,
      feed.isLoadingMore,
      feed.hasMore,
      feed.loadMore,
      feed.error,
      feed.errors,
      feed.feedSource,
      feed.lastUpdated,
      refreshState.refresh,
      refreshState.lastUpdatedLabel,
      settings,
      updateSettings,
      resetSettings,
      settingsHydrated,
      settingsHydratedChannels,
      history.watchedIds,
      history.markAsWatched,
      history.removeFromHistory,
      history.clearHistory,
      history.continueWatching,
      history.recentlyWatched,
      history.history,
      filters.filter,
      filters.setFilter,
      filters.selectedChannel,
      filters.selectChannel,
      filters.clearChannelFilter,
      channelsSyncError,
    ],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeedContext() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeedContext must be used within FeedProvider");
  }
  return context;
}
