"use client";

import { useMemo } from "react";
import { useFeedContext } from "@/components/FeedProvider";
import { usePostsChannels } from "@/hooks/usePostsChannels";
import { getChannelTags } from "@/utils/channels";

export function useTagSuggestions() {
  const { channels } = useFeedContext();
  const { postsChannels } = usePostsChannels();

  return useMemo(
    () => getChannelTags([...channels, ...postsChannels]),
    [channels, postsChannels],
  );
}
