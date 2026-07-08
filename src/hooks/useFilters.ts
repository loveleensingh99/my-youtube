"use client";

import { useCallback } from "react";
import { normalizeChannelId, normalizeFeedFilter, normalizeTag } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/app";
import type { FeedFilter } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

export function useFilters(defaultFilter: FeedFilter = "all") {
  const { value: filter, setValue: setStoredFilter } = useLocalStorage<FeedFilter>(
    STORAGE_KEYS.selectedFilter,
    defaultFilter,
    normalizeFeedFilter,
  );
  const { value: selectedChannel, setValue: setSelectedChannel } = useLocalStorage<
    string | null
  >(STORAGE_KEYS.selectedChannel, null, normalizeChannelId);
  const { value: selectedTag, setValue: setSelectedTag } = useLocalStorage<string | null>(
    STORAGE_KEYS.selectedTag,
    null,
    normalizeTag,
  );

  const setFilter = useCallback(
    (next: FeedFilter) => {
      setStoredFilter(normalizeFeedFilter(next, defaultFilter));
    },
    [defaultFilter, setStoredFilter],
  );

  const selectChannel = useCallback(
    (channelId: string | null) => {
      setSelectedChannel(normalizeChannelId(channelId));
      if (channelId) {
        setSelectedTag(null);
      }
    },
    [setSelectedChannel, setSelectedTag],
  );

  const selectTag = useCallback(
    (tag: string | null) => {
      setSelectedTag(normalizeTag(tag));
      if (tag) {
        setSelectedChannel(null);
      }
    },
    [setSelectedChannel, setSelectedTag],
  );

  const clearChannelFilter = useCallback(() => {
    setSelectedChannel(null);
  }, [setSelectedChannel]);

  const clearTagFilter = useCallback(() => {
    setSelectedTag(null);
  }, [setSelectedTag]);

  const clearFeedFilters = useCallback(() => {
    setSelectedChannel(null);
    setSelectedTag(null);
  }, [setSelectedChannel, setSelectedTag]);

  return {
    filter: normalizeFeedFilter(filter, defaultFilter),
    setFilter,
    selectedChannel: normalizeChannelId(selectedChannel),
    selectedTag: normalizeTag(selectedTag),
    selectChannel,
    selectTag,
    clearChannelFilter,
    clearTagFilter,
    clearFeedFilters,
    isHydrated: true,
  };
}
