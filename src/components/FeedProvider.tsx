"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { useSettings } from "@/hooks/useSettings";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useFilters } from "@/hooks/useFilters";
import { useRefresh } from "@/hooks/useRefresh";
import type { FeedFilter, Settings, Video, WatchHistoryItem } from "@/types";

interface FeedContextValue {
  videos: Video[];
  videosByChannel: Map<string, Video[]>;
  isLoading: boolean;
  error: string | null;
  errors: string[];
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
}

const FeedContext = createContext<FeedContextValue | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const feed = useRSSFeed();
  const { settings, updateSettings, resetSettings, isHydrated: settingsHydrated } =
    useSettings();
  const history = useWatchHistory();
  const filters = useFilters(settings.defaultFilter);
  const refreshState = useRefresh({
    settings,
    lastUpdated: feed.lastUpdated,
    onRefresh: feed.refresh,
    isLoading: feed.isLoading,
  });

  const value: FeedContextValue = {
    videos: feed.videos,
    videosByChannel: feed.videosByChannel,
    isLoading: feed.isLoading,
    error: feed.error,
    errors: feed.errors,
    lastUpdated: feed.lastUpdated,
    refresh: refreshState.refresh,
    lastUpdatedLabel: refreshState.lastUpdatedLabel,
    settings,
    updateSettings,
    resetSettings,
    settingsHydrated: settingsHydrated,
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
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeedContext() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeedContext must be used within FeedProvider");
  }
  return context;
}
