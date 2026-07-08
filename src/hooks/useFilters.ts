"use client";

import { useCallback } from "react";
import { normalizeChannelId, normalizeFeedFilter } from "@/lib/storage";
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

  const setFilter = useCallback(
    (next: FeedFilter) => {
      setStoredFilter(normalizeFeedFilter(next, defaultFilter));
    },
    [defaultFilter, setStoredFilter],
  );

  const selectChannel = useCallback(
    (channelId: string | null) => {
      setSelectedChannel(normalizeChannelId(channelId));
    },
    [setSelectedChannel],
  );

  const clearChannelFilter = useCallback(() => {
    setSelectedChannel(null);
  }, [setSelectedChannel]);

  return {
    filter: normalizeFeedFilter(filter, defaultFilter),
    setFilter,
    selectedChannel: normalizeChannelId(selectedChannel),
    selectChannel,
    clearChannelFilter,
    isHydrated: true,
  };
}
