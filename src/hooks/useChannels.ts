"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { enrichChannelAvatars } from "@/app/actions/channels";
import { useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { defaultChannels } from "@/data/channels";
import {
  channelIdsKey,
  channelsContentKey,
  getLocalChannelsUpdatedAt,
  hasDeletedChannelsLocally,
  hasPersistedLocalChannels,
  touchLocalChannelsUpdatedAt,
} from "@/lib/channels-sync-state";
import { saveRemoteChannels, subscribeRemoteChannels } from "@/lib/firebase/channels";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { mergeById } from "@/lib/backup";
import { normalizeChannels } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/app";
import type { Channel } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

function getChannelIds(channels: Channel[]): string[] {
  return channels.map((channel) => channel.id);
}

function isDefaultChannelIds(channelIds: string[]): boolean {
  return channelIdsKey(channelIds) === channelIdsKey(getChannelIds(defaultChannels));
}

function shouldPreferLocalOnSeed(
  localChannels: Channel[],
  remoteChannels: Channel[],
  localUpdatedAt: number,
  remoteUpdatedAt: number,
): boolean {
  const localIds = new Set(getChannelIds(localChannels));
  const remoteIds = new Set(getChannelIds(remoteChannels));
  const localIdsKey = channelIdsKey([...localIds]);
  const remoteIdsKey = channelIdsKey([...remoteIds]);

  if (localIdsKey === remoteIdsKey) {
    return false;
  }

  const deletedLocally =
    hasDeletedChannelsLocally(localIds, remoteIds) && localIds.size <= remoteIds.size;

  if (deletedLocally) {
    return true;
  }

  if (localUpdatedAt > remoteUpdatedAt) {
    return true;
  }

  if (
    localUpdatedAt === 0 &&
    hasPersistedLocalChannels() &&
    localChannels.length > 0 &&
    (remoteUpdatedAt === 0 || isDefaultChannelIds(getChannelIds(remoteChannels)))
  ) {
    return true;
  }

  return localUpdatedAt > 0 && localUpdatedAt >= remoteUpdatedAt;
}

function applyRemoteChannels(
  remoteChannels: Channel[],
  remoteUpdatedAt: number,
  persistChannelsLocally: (next: Channel[]) => void,
  applyingRemoteRef: MutableRefObject<boolean>,
  lastSavedIdsKeyRef: MutableRefObject<string>,
) {
  applyingRemoteRef.current = true;
  persistChannelsLocally(remoteChannels);
  touchLocalChannelsUpdatedAt(remoteUpdatedAt || Date.now());
  lastSavedIdsKeyRef.current = channelsContentKey(remoteChannels);
}

export function useChannels() {
  const { configured: firebaseConfigured, user, loading: authLoading } = useFirebaseAuthContext();
  const { value: channels, setValue } = useLocalStorage<Channel[]>(
    STORAGE_KEYS.channels,
    defaultChannels,
    normalizeChannels,
  );
  const firebaseEnabled = isFirebaseConfigured() && firebaseConfigured && Boolean(user);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [firebaseSyncActive, setFirebaseSyncActive] = useState(firebaseEnabled && !authLoading);
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
    if (!user) {
      return;
    }

    const nextContentKey = channelsContentKey(next);
    if (nextContentKey === lastSavedIdsKeyRef.current) {
      return;
    }

    const result = await saveRemoteChannels(user.uid, next);
    if (!result.ok) {
      setSyncError(result.error);
      setFirebaseSyncActive(false);
      return;
    }

    lastSavedIdsKeyRef.current = nextContentKey;
    touchLocalChannelsUpdatedAt(result.updatedAt);
    setSyncError(null);
  }, [user]);

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
    setFirebaseSyncActive(firebaseEnabled && !authLoading);
    if (!firebaseEnabled) {
      hasSeededRemoteRef.current = false;
      lastSavedIdsKeyRef.current = "";
    }
  }, [firebaseEnabled, authLoading]);

  useEffect(() => {
    if (!firebaseEnabled || !firebaseSyncActive) {
      return;
    }

    if (!user) {
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
      user.uid,
      ({ channels: remoteChannels, updatedAt: remoteUpdatedAt }) => {
        if (cancelled) {
          return;
        }

        window.clearTimeout(timeoutId);
        const localChannels = channelsRef.current;
        const localUpdatedAt = getLocalChannelsUpdatedAt();
        const localContentKey = channelsContentKey(localChannels);
        const remoteContentKey = channelsContentKey(remoteChannels);

        if (!hasSeededRemoteRef.current) {
          hasSeededRemoteRef.current = true;

          if (remoteChannels.length === 0) {
            if (localChannels.length > 0 && remoteUpdatedAt === 0) {
              void pushChannelsToFirebase(localChannels);
            } else if (remoteUpdatedAt > 0) {
              applyRemoteChannels(
                remoteChannels,
                remoteUpdatedAt,
                persistChannelsLocally,
                applyingRemoteRef,
                lastSavedIdsKeyRef,
              );
            }

            setSyncError(null);
            return;
          }

          if (localChannels.length === 0) {
            applyRemoteChannels(
              remoteChannels,
              remoteUpdatedAt,
              persistChannelsLocally,
              applyingRemoteRef,
              lastSavedIdsKeyRef,
            );
            setSyncError(null);
            return;
          }

          if (shouldPreferLocalOnSeed(localChannels, remoteChannels, localUpdatedAt, remoteUpdatedAt)) {
            void pushChannelsToFirebase(localChannels);
            setSyncError(null);
            return;
          }

          applyRemoteChannels(
            remoteChannels,
            remoteUpdatedAt,
            persistChannelsLocally,
            applyingRemoteRef,
            lastSavedIdsKeyRef,
          );
          setSyncError(null);
          return;
        }

        if (localContentKey === remoteContentKey) {
          lastSavedIdsKeyRef.current = remoteContentKey;
          setSyncError(null);
          return;
        }

        if (remoteUpdatedAt <= localUpdatedAt) {
          void pushChannelsToFirebase(localChannels);
          return;
        }

        applyRemoteChannels(
          remoteChannels,
          remoteUpdatedAt,
          persistChannelsLocally,
          applyingRemoteRef,
          lastSavedIdsKeyRef,
        );
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
    };
  }, [firebaseEnabled, firebaseSyncActive, persistChannelsLocally, pushChannelsToFirebase, user]);

  useEffect(() => {
    if (!firebaseEnabled || !firebaseSyncActive || !hasSeededRemoteRef.current) {
      return;
    }

    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }

    const nextContentKey = channelsContentKey(channels);
    if (nextContentKey === lastSavedIdsKeyRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      void pushChannelsToFirebase(channelsRef.current);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [channels, firebaseEnabled, firebaseSyncActive, pushChannelsToFirebase]);

  const storageDescription = useMemo(() => {
    if (!firebaseConfigured) {
      return "Channels are saved in this browser. Add Firebase settings to enable cloud sync.";
    }

    if (!user) {
      return "Sign in to sync your channels across devices. Until then, data stays on this device.";
    }

    if (!firebaseSyncActive) {
      return "Using local storage. Check Firebase setup or internet connection.";
    }

    return "Your personal channel list syncs automatically with Firebase on all your devices.";
  }, [firebaseConfigured, firebaseSyncActive, user]);

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

  /** Merge imported subscriptions; existing ids are skipped. */
  const importChannels = useCallback(
    (incoming: Channel[]) => {
      const { merged, added, skipped } = mergeById(channelsRef.current, incoming);
      if (added > 0) {
        persistChannelsLocally(merged);
      }
      return { added, skipped };
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
    importChannels,
    updateChannel,
    removeChannel,
    resetChannels,
    hasChannel,
    isHydrated: true,
    syncError,
    storageDescription,
    firebaseConfigured,
    firebaseSyncActive,
  };
}
