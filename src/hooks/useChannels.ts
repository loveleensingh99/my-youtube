"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { enrichChannelAvatars } from "@/app/actions/channels";
import { useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { channelsContentKey } from "@/lib/channels-sync-state";
import { mergeById } from "@/lib/backup";
import { clearLegacyChannelLocalStorage } from "@/lib/storage";
import { saveRemoteChannels, subscribeRemoteChannels } from "@/lib/firebase/channels";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { Channel } from "@/types";
import { renameChannelTag } from "@/utils/channels";

export function useChannels() {
  const { configured: firebaseConfigured, user, loading: authLoading } = useFirebaseAuthContext();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const channelsRef = useRef(channels);
  const pendingWritesRef = useRef(0);
  const lastSavedKeyRef = useRef("");
  const hasReceivedRemoteRef = useRef(false);

  const firebaseEnabled = isFirebaseConfigured() && firebaseConfigured && Boolean(user);
  const firebaseSyncActive = firebaseEnabled && !authLoading && ready && !syncError;

  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  useEffect(() => {
    clearLegacyChannelLocalStorage();
  }, []);

  const persistChannels = useCallback(
    async (next: Channel[]) => {
      setChannels(next);
      channelsRef.current = next;

      if (!user) {
        return { ok: false as const, error: "Sign in to save channels." };
      }

      pendingWritesRef.current += 1;
      const nextKey = channelsContentKey(next);

      try {
        const result = await saveRemoteChannels(user.uid, next);
        if (!result.ok) {
          setSyncError(result.error);
          return result;
        }

        lastSavedKeyRef.current = nextKey;
        setSyncError(null);
        return result;
      } finally {
        pendingWritesRef.current -= 1;
      }
    },
    [user],
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!firebaseEnabled || !user) {
      hasReceivedRemoteRef.current = false;
      lastSavedKeyRef.current = "";
      setChannels([]);
      setReady(true);
      setSyncError(
        firebaseConfigured
          ? null
          : "Firebase is not configured. Channel lists require cloud storage.",
      );
      return;
    }

    setReady(false);
    setSyncError(null);
    hasReceivedRemoteRef.current = false;

    const timeoutId = window.setTimeout(() => {
      if (!hasReceivedRemoteRef.current) {
        setSyncError(
          "Could not connect to Firebase. Create a Firestore database in the Firebase console.",
        );
        setReady(true);
      }
    }, 8000);

    const unsubscribe = subscribeRemoteChannels(
      user.uid,
      ({ channels: remoteChannels }) => {
        window.clearTimeout(timeoutId);
        hasReceivedRemoteRef.current = true;

        const remoteKey = channelsContentKey(remoteChannels);

        if (pendingWritesRef.current > 0) {
          setReady(true);
          return;
        }

        if (remoteKey === lastSavedKeyRef.current && remoteKey === channelsContentKey(channelsRef.current)) {
          setReady(true);
          setSyncError(null);
          return;
        }

        lastSavedKeyRef.current = remoteKey;
        setChannels(remoteChannels);
        channelsRef.current = remoteChannels;
        setReady(true);
        setSyncError(null);
      },
      () => {
        window.clearTimeout(timeoutId);
        setSyncError(
          "Firebase sync is unavailable. Create a Firestore database in the Firebase console.",
        );
        setReady(true);
      },
    );

    if (!unsubscribe) {
      window.clearTimeout(timeoutId);
      setSyncError("Firebase is not configured.");
      setReady(true);
      return;
    }

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [authLoading, firebaseConfigured, firebaseEnabled, user]);

  const channelsMissingAvatars = useMemo(
    () =>
      channels
        .filter((channel) => !channel.avatarUrl)
        .map((channel) => channel.id)
        .join(","),
    [channels],
  );

  useEffect(() => {
    if (!ready || !firebaseEnabled || !channelsMissingAvatars) {
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
        void persistChannels(enriched);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [channelsMissingAvatars, firebaseEnabled, persistChannels, ready]);

  const addChannel = useCallback(
    (channel: Channel) => {
      if (channelsRef.current.some((entry) => entry.id === channel.id)) {
        return;
      }

      void persistChannels([...channelsRef.current, channel]);
    },
    [persistChannels],
  );

  const importChannels = useCallback(
    (incoming: Channel[]) => {
      const { merged, added, skipped } = mergeById(channelsRef.current, incoming);
      if (added > 0) {
        void persistChannels(merged);
      }
      return { added, skipped };
    },
    [persistChannels],
  );

  const removeChannel = useCallback(
    (channelId: string) => {
      void persistChannels(channelsRef.current.filter((channel) => channel.id !== channelId));
    },
    [persistChannels],
  );

  const updateChannel = useCallback(
    (channelId: string, updates: Pick<Channel, "name" | "category">) => {
      void persistChannels(
        channelsRef.current.map((channel) =>
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
    [persistChannels],
  );

  const renameTag = useCallback(
    (oldTag: string, newTag: string) => {
      const previous = channelsRef.current;
      const next = renameChannelTag(previous, oldTag, newTag);
      const changed = previous.reduce(
        (count, channel, index) =>
          channel.category !== next[index]?.category ? count + 1 : count,
        0,
      );

      if (changed === 0) {
        return 0;
      }

      void persistChannels(next);
      return changed;
    },
    [persistChannels],
  );

  const hasChannel = useCallback(
    (channelId: string) => channels.some((channel) => channel.id === channelId),
    [channels],
  );

  const storageDescription = useMemo(() => {
    if (!firebaseConfigured) {
      return "Firebase is required to store your subscriptions.";
    }

    if (!user) {
      return "Sign in to load and save your subscriptions in the cloud.";
    }

    if (syncError) {
      return syncError;
    }

    if (!ready) {
      return "Loading subscriptions from Firebase…";
    }

    return "Subscriptions are stored only in Firebase and sync across your devices.";
  }, [firebaseConfigured, ready, syncError, user]);

  return {
    channels,
    addChannel,
    importChannels,
    updateChannel,
    renameTag,
    removeChannel,
    hasChannel,
    isHydrated: ready,
    syncError,
    storageDescription,
    firebaseConfigured,
    firebaseSyncActive,
  };
}
