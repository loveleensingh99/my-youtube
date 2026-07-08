"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { enrichChannelAvatars } from "@/app/actions/channels";
import { defaultChannels } from "@/data/channels";
import {
  mergeChannels,
  saveRemoteChannels,
  subscribeRemoteChannels,
} from "@/lib/firebase/channels";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { normalizeChannels } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/app";
import type { Channel } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

function channelIdsKey(channels: Channel[]): string {
  return channels
    .map((channel) => channel.id)
    .sort()
    .join("|");
}

export function useChannels() {
  const { value: channels, setValue } = useLocalStorage<Channel[]>(
    STORAGE_KEYS.channels,
    defaultChannels,
    normalizeChannels,
  );
  const firebaseEnabled = isFirebaseConfigured();
  const [syncError, setSyncError] = useState<string | null>(null);
  const [firebaseSyncActive, setFirebaseSyncActive] = useState(firebaseEnabled);
  const channelsRef = useRef(channels);
  const applyingRemoteRef = useRef(false);
  const hasSeededRemoteRef = useRef(false);

  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  const channelsMissingAvatars = useMemo(
    () =>
      channels
        .filter((channel) => !channel.avatarUrl)
        .map((channel) => channel.id)
        .join(","),
    [channels],
  );

  useEffect(() => {
    if (!channelsMissingAvatars) {
      return;
    }

    let cancelled = false;

    void enrichChannelAvatars(channelsRef.current).then((enriched) => {
      if (cancelled) {
        return;
      }

      const changed = enriched.some(
        (channel, index) => channel.avatarUrl !== channelsRef.current[index]?.avatarUrl,
      );

      if (changed) {
        setValue(enriched);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [channelsMissingAvatars, setValue]);

  useEffect(() => {
    if (!firebaseEnabled || !firebaseSyncActive) {
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !hasSeededRemoteRef.current) {
        setSyncError(
          "Could not connect to Firebase. Create a Firestore database in the Firebase console, or the app will use local storage only.",
        );
        setFirebaseSyncActive(false);
      }
    }, 5000);

    const unsubscribe = subscribeRemoteChannels(
      (remoteChannels) => {
        if (cancelled) {
          return;
        }

        window.clearTimeout(timeoutId);
        const localChannels = channelsRef.current;

        if (!hasSeededRemoteRef.current) {
          hasSeededRemoteRef.current = true;

          if (remoteChannels.length === 0 && localChannels.length > 0) {
            void saveRemoteChannels(localChannels).then((result) => {
              if (!result.ok) {
                setSyncError(result.error);
                setFirebaseSyncActive(false);
              } else {
                setSyncError(null);
              }
            });
            return;
          }

          const merged = mergeChannels(localChannels, remoteChannels);
          if (channelIdsKey(merged) !== channelIdsKey(remoteChannels)) {
            void saveRemoteChannels(merged);
          }

          applyingRemoteRef.current = true;
          setValue(merged);
          setSyncError(null);
          return;
        }

        applyingRemoteRef.current = true;
        setValue(remoteChannels);
        setSyncError(null);
      },
      () => {
        if (cancelled) {
          return;
        }

        window.clearTimeout(timeoutId);
        setSyncError(
          "Firebase sync is unavailable. Create a Firestore database in the Firebase console.",
        );
        setFirebaseSyncActive(false);
      },
    );

    if (!unsubscribe) {
      window.clearTimeout(timeoutId);
      setFirebaseSyncActive(false);
      return;
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      unsubscribe();
      hasSeededRemoteRef.current = false;
    };
  }, [firebaseEnabled, firebaseSyncActive, setValue]);

  useEffect(() => {
    if (!firebaseEnabled || !firebaseSyncActive || !hasSeededRemoteRef.current) {
      return;
    }

    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void saveRemoteChannels(channelsRef.current).then((result) => {
        if (!result.ok) {
          setSyncError(result.error);
          setFirebaseSyncActive(false);
        } else {
          setSyncError(null);
        }
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [channels, firebaseEnabled, firebaseSyncActive]);

  const storageDescription = useMemo(() => {
    if (!firebaseEnabled) {
      return "Channels are saved in this browser. Add Firebase settings to sync across your devices.";
    }

    if (!firebaseSyncActive) {
      return "Using local storage. Fix Firebase setup in Settings to sync across devices.";
    }

    return "Your personal channel list syncs automatically with Firebase on all your devices.";
  }, [firebaseEnabled, firebaseSyncActive]);

  const addChannel = useCallback(
    (channel: Channel) => {
      setValue((prev) => {
        if (prev.some((entry) => entry.id === channel.id)) {
          return prev;
        }

        return [...prev, channel];
      });
    },
    [setValue],
  );

  const removeChannel = useCallback(
    (channelId: string) => {
      setValue((prev) => prev.filter((channel) => channel.id !== channelId));
    },
    [setValue],
  );

  const resetChannels = useCallback(() => {
    setValue(defaultChannels);
  }, [setValue]);

  const hasChannel = useCallback(
    (channelId: string) => channels.some((channel) => channel.id === channelId),
    [channels],
  );

  const updateChannel = useCallback(
    (channelId: string, updates: Pick<Channel, "name" | "category">) => {
      setValue((prev) =>
        prev.map((channel) =>
          channel.id === channelId
            ? {
                ...channel,
                name: updates.name.trim() || channel.name,
                category: updates.category.trim() || "General",
              }
            : channel,
        ),
      );
    },
    [setValue],
  );

  return {
    channels,
    addChannel,
    updateChannel,
    removeChannel,
    resetChannels,
    hasChannel,
    isHydrated: true,
    syncError,
    storageDescription,
    firebaseConfigured: firebaseEnabled,
    firebaseSyncActive,
  };
}
