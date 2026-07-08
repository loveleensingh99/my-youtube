"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStoredChannels, persistChannels, syncChannelsWithFile } from "@/app/actions/channels";
import { defaultChannels } from "@/data/channels";
import { normalizeChannels } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/app";
import type { Channel } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

export function useChannels() {
  const { value: channels, setValue, isHydrated } = useLocalStorage<Channel[]>(
    STORAGE_KEYS.channels,
    defaultChannels,
    normalizeChannels,
  );
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const hasSyncedRef = useRef(false);
  const channelsRef = useRef(channels);

  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  useEffect(() => {
    if (!isHydrated || hasSyncedRef.current) return;

    hasSyncedRef.current = true;

    void (async () => {
      setIsSyncing(true);
      setSyncError(null);

      try {
        const result = await syncChannelsWithFile(channelsRef.current);
        setValue(result.channels);

        if (result.error) {
          setSyncError(result.error);
        }
      } catch {
        try {
          const serverChannels = await getStoredChannels();
          setValue(serverChannels);
        } catch {
          setSyncError("Could not load channels from data/channels.json.");
        }
      } finally {
        setIsSyncing(false);
      }
    })();
  }, [isHydrated, setValue]);

  const saveChannels = useCallback(async (next: Channel[]) => {
    const result = await persistChannels(next);
    if (!result.ok) {
      setSyncError(result.error);
      return false;
    }

    setSyncError(null);
    return true;
  }, []);

  const addChannel = useCallback(
    (channel: Channel) => {
      setValue((prev) => {
        if (prev.some((entry) => entry.id === channel.id)) {
          return prev;
        }

        const next = [...prev, channel];
        void saveChannels(next);
        return next;
      });
    },
    [saveChannels, setValue],
  );

  const removeChannel = useCallback(
    (channelId: string) => {
      setValue((prev) => {
        const next = prev.filter((channel) => channel.id !== channelId);
        void saveChannels(next);
        return next;
      });
    },
    [saveChannels, setValue],
  );

  const resetChannels = useCallback(() => {
    setValue(defaultChannels);
    void saveChannels(defaultChannels);
  }, [saveChannels, setValue]);

  const hasChannel = useCallback(
    (channelId: string) => channels.some((channel) => channel.id === channelId),
    [channels],
  );

  return {
    channels,
    addChannel,
    removeChannel,
    resetChannels,
    hasChannel,
    isHydrated: isHydrated && !isSyncing,
    syncError,
  };
}
