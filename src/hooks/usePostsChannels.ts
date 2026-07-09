"use client";

import { useCallback } from "react";
import { STORAGE_KEYS } from "@/constants/app";
import { normalizePostsChannels } from "@/lib/storage";
import type { PostsChannel } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

export function usePostsChannels() {
  const { value: postsChannels, setValue } = useLocalStorage<PostsChannel[]>(
    STORAGE_KEYS.postsChannels,
    [],
    normalizePostsChannels,
  );

  const addPostsChannel = useCallback(
    (channel: PostsChannel) => {
      setValue((prev) => {
        if (prev.some((entry) => entry.id === channel.id)) {
          return prev;
        }

        return [...prev, channel];
      });
    },
    [setValue],
  );

  const removePostsChannel = useCallback(
    (channelId: string) => {
      setValue((prev) => prev.filter((channel) => channel.id !== channelId));
    },
    [setValue],
  );

  const updatePostsChannel = useCallback(
    (channelId: string, updates: Pick<PostsChannel, "name">) => {
      setValue((prev) =>
        prev.map((channel) =>
          channel.id === channelId
            ? {
                ...channel,
                name: updates.name.trim() || channel.name,
              }
            : channel,
        ),
      );
    },
    [setValue],
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
    isHydrated: true,
  };
}
