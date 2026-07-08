"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { enrichChannelAvatars } from "@/app/actions/channels";
import { defaultChannels } from "@/data/channels";
import {
  channelIdsKey,
  getLocalChannelsUpdatedAt,
  hasDeletedChannelsLocally,
  touchLocalChannelsUpdatedAt,
} from "@/lib/channels-sync-state";
import { saveRemoteChannels, subscribeRemoteChannels } from "@/lib/firebase/channels";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { normalizeChannels } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/app";
import type { Channel } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

function getChannelIds(channels: Channel[]): string[] {
  return channels.map((channel) => channel.id);
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
  const lastSavedIdsKeyRef = useRef("");

  const persistChannelsLocally = useCallback(
    (next: Channel[] | ((prev: Channel[]) => Channel[])) => {
      touchLocalChannelsUpdatedAt();
      setValue(next);
    },
    [setValue],
  );

  const pushChannelsToFirebase = useCallback(async (next: Channel[]) => {
    const nextIdsKey = channelIdsKey(getChannelIds(next));
    if (nextIdsKey === lastSavedIdsKeyRef.current) {
      return;
    }

    const result = await saveRemoteChannels(next);
    if (!result.ok) {
      setSyncError(result.error);
      setFirebaseSyncActive(false);
      return;
    }

    lastSavedIdsKeyRef.current = nextIdsKey;
    touchLocalChannelsUpdatedAt(result.updatedAt);
    setSyncError(null);
  }, []);

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
        persistChannelsLocally(enriched);
        if (firebaseEnabled && firebaseSyncActive && hasSeededRemoteRef.current) {
          void pushChannelsToFirebase(enriched);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    channelsMissingAvatars,
    firebaseEnabled,
    firebaseSyncActive,
    persistChannelsLocally,
    pushChannelsToFirebase,
  ]);

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
      ({ channels: remoteChannels, updatedAt: remoteUpdatedAt }) => {
        if (cancelled) {
          return;
        }

        window.clearTimeout(timeoutId);
        const localChannels = channelsRef.current;
        const localUpdatedAt = getLocalChannelsUpdatedAt();
        const localIds = new Set(getChannelIds(localChannels));
        const remoteIds = new Set(getChannelIds(remoteChannels));
        const localIdsKey = channelIdsKey([...localIds]);
        const remoteIdsKey = channelIdsKey([...remoteIds]);

        if (!hasSeededRemoteRef.current) {
          hasSeededRemoteRef.current = true;

          if (remoteChannels.length === 0 && localChannels.length > 0) {
            void pushChannelsToFirebase(localChannels);
            return;
          }

          const deletedLocally =
            localIdsKey !== remoteIdsKey &&
            hasDeletedChannelsLocally(localIds, remoteIds) &&
            localIds.size <= remoteIds.size;

          const useLocal =
            deletedLocally ||
            localUpdatedAt > remoteUpdatedAt ||
            (localUpdatedAt > 0 && localIdsKey !== remoteIdsKey);

          if (useLocal) {
            void pushChannelsToFirebase(localChannels);
            return;
          }

          if (localIdsKey !== remoteIdsKey || remoteUpdatedAt > localUpdatedAt) {
            applyingRemoteRef.current = true;
            persistChannelsLocally(remoteChannels);
            touchLocalChannelsUpdatedAt(remoteUpdatedAt || Date.now());
            lastSavedIdsKeyRef.current = remoteIdsKey;
          }

          setSyncError(null);
          return;
        }

        if (remoteIdsKey === localIdsKey) {
          lastSavedIdsKeyRef.current = remoteIdsKey;
          setSyncError(null);
          return;
        }

        if (remoteUpdatedAt <= localUpdatedAt) {
          void pushChannelsToFirebase(localChannels);
          return;
        }

        applyingRemoteRef.current = true;
        persistChannelsLocally(remoteChannels);
        touchLocalChannelsUpdatedAt(remoteUpdatedAt);
        lastSavedIdsKeyRef.current = remoteIdsKey;
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
  }, [firebaseEnabled, firebaseSyncActive, persistChannelsLocally, pushChannelsToFirebase]);

  useEffect(() => {
    if (!firebaseEnabled || !firebaseSyncActive || !hasSeededRemoteRef.current) {
      return;
    }

    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }

    const nextIdsKey = channelIdsKey(getChannelIds(channels));
    if (nextIdsKey === lastSavedIdsKeyRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      void pushChannelsToFirebase(channelsRef.current);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [channels, firebaseEnabled, firebaseSyncActive, pushChannelsToFirebase]);

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
      persistChannelsLocally((prev) => {
        if (prev.some((entry) => entry.id === channel.id)) {
          return prev;
        }

        return [...prev, channel];
      });
    },
    [persistChannelsLocally],
  );

  const removeChannel = useCallback(
    (channelId: string) => {
      const next = channelsRef.current.filter((channel) => channel.id !== channelId);
      persistChannelsLocally(next);

      if (firebaseEnabled && firebaseSyncActive && hasSeededRemoteRef.current) {
        void pushChannelsToFirebase(next);
      }
    },
    [firebaseEnabled, firebaseSyncActive, persistChannelsLocally, pushChannelsToFirebase],
  );

  const resetChannels = useCallback(() => {
    persistChannelsLocally(defaultChannels);
    if (firebaseEnabled && firebaseSyncActive && hasSeededRemoteRef.current) {
      void pushChannelsToFirebase(defaultChannels);
    }
  }, [firebaseEnabled, firebaseSyncActive, persistChannelsLocally, pushChannelsToFirebase]);

  const hasChannel = useCallback(
    (channelId: string) => channels.some((channel) => channel.id === channelId),
    [channels],
  );

  const updateChannel = useCallback(
    (channelId: string, updates: Pick<Channel, "name" | "category">) => {
      persistChannelsLocally((prev) =>
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
    [persistChannelsLocally],
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
