"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { postsChannelsContentKey } from "@/lib/channels-sync-state";
import { mergeById } from "@/lib/backup";
import {
  saveRemotePostsChannels,
  subscribeRemotePostsChannels,
} from "@/lib/firebase/posts-channels";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { PostsChannel } from "@/types";

export function usePostsChannels() {
  const { configured: firebaseConfigured, user, loading: authLoading } = useFirebaseAuthContext();
  const [postsChannels, setPostsChannels] = useState<PostsChannel[]>([]);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const postsChannelsRef = useRef(postsChannels);
  const pendingWritesRef = useRef(0);
  const lastSavedKeyRef = useRef("");
  const hasReceivedRemoteRef = useRef(false);

  const firebaseEnabled = isFirebaseConfigured() && firebaseConfigured && Boolean(user);
  const firebaseSyncActive = firebaseEnabled && !authLoading && ready && !syncError;

  useEffect(() => {
    postsChannelsRef.current = postsChannels;
  }, [postsChannels]);

  const persistPostsChannels = useCallback(
    async (next: PostsChannel[]) => {
      setPostsChannels(next);
      postsChannelsRef.current = next;

      if (!user) {
        return { ok: false as const, error: "Sign in to save posts channels." };
      }

      pendingWritesRef.current += 1;
      const nextKey = postsChannelsContentKey(next);

      try {
        const result = await saveRemotePostsChannels(user.uid, next);
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
      setPostsChannels([]);
      setReady(true);
      setSyncError(null);
      return;
    }

    setReady(false);
    setSyncError(null);
    hasReceivedRemoteRef.current = false;

    const timeoutId = window.setTimeout(() => {
      if (!hasReceivedRemoteRef.current) {
        setSyncError("Could not connect to Firebase for posts channels.");
        setReady(true);
      }
    }, 8000);

    const unsubscribe = subscribeRemotePostsChannels(
      user.uid,
      ({ postsChannels: remotePostsChannels }) => {
        window.clearTimeout(timeoutId);
        hasReceivedRemoteRef.current = true;

        const remoteKey = postsChannelsContentKey(remotePostsChannels);

        if (pendingWritesRef.current > 0) {
          setReady(true);
          return;
        }

        if (
          remoteKey === lastSavedKeyRef.current &&
          remoteKey === postsChannelsContentKey(postsChannelsRef.current)
        ) {
          setReady(true);
          setSyncError(null);
          return;
        }

        lastSavedKeyRef.current = remoteKey;
        setPostsChannels(remotePostsChannels);
        postsChannelsRef.current = remotePostsChannels;
        setReady(true);
        setSyncError(null);
      },
      () => {
        window.clearTimeout(timeoutId);
        setSyncError("Firebase sync is unavailable for posts channels.");
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
  }, [authLoading, firebaseEnabled, user]);

  const addPostsChannel = useCallback(
    (channel: PostsChannel) => {
      if (postsChannelsRef.current.some((entry) => entry.id === channel.id)) {
        return;
      }

      void persistPostsChannels([...postsChannelsRef.current, channel]);
    },
    [persistPostsChannels],
  );

  const importPostsChannels = useCallback(
    (incoming: PostsChannel[]) => {
      const { merged, added, skipped } = mergeById(postsChannelsRef.current, incoming);
      if (added > 0) {
        void persistPostsChannels(merged);
      }
      return { added, skipped };
    },
    [persistPostsChannels],
  );

  const removePostsChannel = useCallback(
    (channelId: string) => {
      void persistPostsChannels(
        postsChannelsRef.current.filter((channel) => channel.id !== channelId),
      );
    },
    [persistPostsChannels],
  );

  const updatePostsChannel = useCallback(
    (channelId: string, updates: Pick<PostsChannel, "name" | "category">) => {
      void persistPostsChannels(
        postsChannelsRef.current.map((channel) =>
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
    [persistPostsChannels],
  );

  const hasPostsChannel = useCallback(
    (channelId: string) => postsChannels.some((channel) => channel.id === channelId),
    [postsChannels],
  );

  return {
    postsChannels,
    addPostsChannel,
    importPostsChannels,
    removePostsChannel,
    updatePostsChannel,
    hasPostsChannel,
    firebaseSyncActive,
    firebaseConfigured,
    syncError,
    isHydrated: ready,
    channelsStorageDescription: useMemo(() => {
      if (!firebaseConfigured) {
        return "Firebase is required to store posts channels.";
      }
      if (!user) {
        return "Sign in to load and save posts channels in the cloud.";
      }
      if (syncError) {
        return syncError;
      }
      if (!ready) {
        return "Loading posts channels from Firebase…";
      }
      return "Posts channels are stored only in Firebase and sync across your devices.";
    }, [firebaseConfigured, ready, syncError, user]),
  };
}
