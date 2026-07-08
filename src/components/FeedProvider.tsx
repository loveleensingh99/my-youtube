"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { resolveChannelInput } from "@/app/actions/channels";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { useSettings } from "@/hooks/useSettings";
import { useFilters } from "@/hooks/useFilters";
import { useRefresh } from "@/hooks/useRefresh";
import { useChannels } from "@/hooks/useChannels";
import type { Channel, FeedFilter, Settings, Video } from "@/types";

interface FeedContextValue {
  channels: Channel[];
  addChannel: (channel: Channel) => void;
  updateChannel: (channelId: string, updates: Pick<Channel, "name" | "category">) => void;
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
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;
  selectedChannel: string | null;
  selectChannel: (channelId: string | null) => void;
  clearChannelFilter: () => void;
  selectedTag: string | null;
  selectTag: (tag: string | null) => void;
  clearTagFilter: () => void;
  clearFeedFilters: () => void;
  channelsSyncError: string | null;
  channelsStorageDescription: string;
  firebaseConfigured: boolean;
  firebaseSyncActive: boolean;
  getChannelAvatar: (channelId: string) => string | undefined;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const {
    channels,
    addChannel,
    updateChannel,
    removeChannel,
    hasChannel,
    isHydrated: settingsHydratedChannels,
    syncError: channelsSyncError,
    storageDescription: channelsStorageDescription,
    firebaseConfigured,
    firebaseSyncActive,
  } = useChannels();
  const { settings, updateSettings, resetSettings, isHydrated: settingsHydrated } =
    useSettings();
  const filters = useFilters(settings.defaultFilter);
  const channelsToFetch = useMemo(() => {
    if (filters.selectedTag) {
      return channels.filter((channel) => channel.category === filters.selectedTag);
    }

    return channels;
  }, [channels, filters.selectedTag]);

  const getChannelAvatar = useCallback(
    (channelId: string) => channels.find((channel) => channel.id === channelId)?.avatarUrl,
    [channels],
  );

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
      updateChannel,
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
      filter: filters.filter,
      setFilter: filters.setFilter,
      selectedChannel: filters.selectedChannel,
      selectChannel: filters.selectChannel,
      clearChannelFilter: filters.clearChannelFilter,
      selectedTag: filters.selectedTag,
      selectTag: filters.selectTag,
      clearTagFilter: filters.clearTagFilter,
      clearFeedFilters: filters.clearFeedFilters,
      channelsSyncError,
      channelsStorageDescription,
      firebaseConfigured,
      firebaseSyncActive,
      getChannelAvatar,
    }),
    [
      channels,
      addChannel,
      updateChannel,
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
      filters.filter,
      filters.setFilter,
      filters.selectedChannel,
      filters.selectChannel,
      filters.clearChannelFilter,
      filters.selectedTag,
      filters.selectTag,
      filters.clearTagFilter,
      filters.clearFeedFilters,
      channelsSyncError,
      channelsStorageDescription,
      firebaseConfigured,
      firebaseSyncActive,
      getChannelAvatar,
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
