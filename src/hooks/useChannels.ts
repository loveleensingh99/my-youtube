"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getChannelsStorageInfo,
  persistChannels,
  syncChannelsWithFile,
} from "@/app/actions/channels";
import { defaultChannels } from "@/data/channels";
import { normalizeChannels } from "@/lib/storage";
import type { ChannelsStorageMode } from "@/lib/channels-store";
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
  const [storageMode, setStorageMode] = useState<ChannelsStorageMode>("browser");
  const [storageDescription, setStorageDescription] = useState("");
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
        const [result, storageInfo] = await Promise.all([
          syncChannelsWithFile(channelsRef.current),
          getChannelsStorageInfo(),
        ]);

        setStorageMode(storageInfo.mode);
        setStorageDescription(storageInfo.description);

        const currentIds = channelsRef.current.map((channel) => channel.id).sort().join("|");
        const nextIds = result.channels.map((channel) => channel.id).sort().join("|");

        if (currentIds !== nextIds) {
          setValue(result.channels);
        }

        if (result.error) {
          setSyncError(result.error);
        }
      } catch {
        setSyncError("Could not sync channels from the server.");
      } finally {
        setIsSyncing(false);
      }
    })();
  }, [isHydrated, setValue]);

  const saveChannels = useCallback(
    async (next: Channel[]) => {
      const result = await persistChannels(next);
      if (!result.ok) {
        setSyncError(result.error);
        return false;
      }

      setSyncError(null);
      return true;
    },
    [],
  );

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

  const updateChannel = useCallback(
    (channelId: string, updates: Pick<Channel, "name" | "category">) => {
      setValue((prev) => {
        const next = prev.map((channel) =>
          channel.id === channelId
            ? {
                ...channel,
                name: updates.name.trim() || channel.name,
                category: updates.category.trim() || "General",
              }
            : channel,
        );
        void saveChannels(next);
        return next;
      });
    },
    [saveChannels, setValue],
  );

  return {
    channels,
    addChannel,
    updateChannel,
    removeChannel,
    resetChannels,
    hasChannel,
    isHydrated: isHydrated && !isSyncing,
    syncError,
    storageMode,
    storageDescription,
  };
}
