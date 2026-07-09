"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { STORAGE_KEYS } from "@/constants/app";
import { postsChannelsContentKey } from "@/lib/channels-sync-state";
import {
  saveRemotePostsChannels,
  subscribeRemotePostsChannels,
} from "@/lib/firebase/posts-channels";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { normalizePostsChannels } from "@/lib/storage";
import type { PostsChannel } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

function getLocalPostsUpdatedAt(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const value = window.localStorage.getItem(STORAGE_KEYS.postsChannelsUpdatedAt);
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function touchLocalPostsUpdatedAt(at = Date.now()): number {
  if (typeof window === "undefined") {
    return at;
  }

  window.localStorage.setItem(STORAGE_KEYS.postsChannelsUpdatedAt, String(at));
  return at;
}

export function usePostsChannels() {
  const { configured: firebaseConfigured, user, loading: authLoading } = useFirebaseAuthContext();
  const { value: postsChannels, setValue } = useLocalStorage<PostsChannel[]>(
    STORAGE_KEYS.postsChannels,
    [],
    normalizePostsChannels,
  );
  const firebaseEnabled = isFirebaseConfigured() && firebaseConfigured && Boolean(user);
  const [firebaseSyncActive, setFirebaseSyncActive] = useState(firebaseEnabled && !authLoading);
  const postsChannelsRef = useRef(postsChannels);
  const hasSeededRemoteRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const lastSavedKeyRef = useRef("");

  useEffect(() => {
    postsChannelsRef.current = postsChannels;
  }, [postsChannels]);

  useEffect(() => {
    setFirebaseSyncActive(firebaseEnabled && !authLoading);
    if (!firebaseEnabled) {
      hasSeededRemoteRef.current = false;
      lastSavedKeyRef.current = "";
    }
  }, [firebaseEnabled, authLoading]);

  const persistLocal = useCallback(
    (next: PostsChannel[] | ((prev: PostsChannel[]) => PostsChannel[])) => {
      touchLocalPostsUpdatedAt();
      setValue(next);
    },
    [setValue],
  );

  const pushPostsChannelsToFirebase = useCallback(
    async (next: PostsChannel[]) => {
      if (!user) {
        return;
      }

      const nextKey = postsChannelsContentKey(next);
      if (nextKey === lastSavedKeyRef.current) {
        return;
      }

      const result = await saveRemotePostsChannels(user.uid, next);
      if (!result.ok) {
        setFirebaseSyncActive(false);
        return;
      }

      touchLocalPostsUpdatedAt(result.updatedAt);
      lastSavedKeyRef.current = nextKey;
    },
    [user],
  );

  useEffect(() => {
    if (!firebaseEnabled || !firebaseSyncActive || !user) {
      return;
    }

    const unsubscribe = subscribeRemotePostsChannels(
      user.uid,
      ({ postsChannels: remotePostsChannels, postsChannelsUpdatedAt }) => {
        const localPostsChannels = postsChannelsRef.current;
        const localKey = postsChannelsContentKey(localPostsChannels);
        const remoteKey = postsChannelsContentKey(remotePostsChannels);
        const localUpdatedAt = getLocalPostsUpdatedAt();

        if (!hasSeededRemoteRef.current) {
          hasSeededRemoteRef.current = true;

          if (remotePostsChannels.length === 0 && localPostsChannels.length > 0) {
            void pushPostsChannelsToFirebase(localPostsChannels);
            return;
          }

          if (localPostsChannels.length === 0 || postsChannelsUpdatedAt > localUpdatedAt) {
            applyingRemoteRef.current = true;
            persistLocal(remotePostsChannels);
            touchLocalPostsUpdatedAt(postsChannelsUpdatedAt || Date.now());
            lastSavedKeyRef.current = remoteKey;
            return;
          }

          if (localKey !== remoteKey) {
            void pushPostsChannelsToFirebase(localPostsChannels);
          }
          return;
        }

        if (localKey === remoteKey) {
          lastSavedKeyRef.current = remoteKey;
          return;
        }

        if (postsChannelsUpdatedAt <= localUpdatedAt) {
          void pushPostsChannelsToFirebase(localPostsChannels);
          return;
        }

        applyingRemoteRef.current = true;
        persistLocal(remotePostsChannels);
        touchLocalPostsUpdatedAt(postsChannelsUpdatedAt || Date.now());
        lastSavedKeyRef.current = remoteKey;
      },
      () => {
        setFirebaseSyncActive(false);
      },
    );

    return () => unsubscribe?.();
  }, [firebaseEnabled, firebaseSyncActive, user, persistLocal, pushPostsChannelsToFirebase]);

  useEffect(() => {
    if (!firebaseEnabled || !firebaseSyncActive || !hasSeededRemoteRef.current) {
      return;
    }

    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void pushPostsChannelsToFirebase(postsChannelsRef.current);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [postsChannels, firebaseEnabled, firebaseSyncActive, pushPostsChannelsToFirebase]);

  const addPostsChannel = useCallback(
    (channel: PostsChannel) => {
      persistLocal((prev) => {
        if (prev.some((entry) => entry.id === channel.id)) {
          return prev;
        }

        return [...prev, channel];
      });
    },
    [persistLocal],
  );

  const removePostsChannel = useCallback(
    (channelId: string) => {
      persistLocal((prev) => prev.filter((channel) => channel.id !== channelId));
    },
    [persistLocal],
  );

  const updatePostsChannel = useCallback(
    (channelId: string, updates: Pick<PostsChannel, "name" | "category">) => {
      persistLocal((prev) =>
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
    [persistLocal],
  );

  const hasPostsChannel = useCallback(
    (channelId: string) => postsChannels.some((channel) => channel.id === channelId),
    [postsChannels],
  );

  return {
    postsChannels,
    addPostsChannel,
    removePostsChannel,
    updatePostsChannel,
    hasPostsChannel,
    firebaseSyncActive,
    firebaseConfigured,
    channelsStorageDescription: useMemo(() => {
      if (!firebaseConfigured) {
        return "Posts channels are currently stored only on this device.";
      }
      if (!user) {
        return "Sign in to sync posts channels across devices.";
      }
      if (!firebaseSyncActive) {
        return "Using local storage for posts channels right now.";
      }
      return "Posts channels sync to your account across devices.";
    }, [firebaseConfigured, firebaseSyncActive, user]),
    isHydrated: true,
  };
}
