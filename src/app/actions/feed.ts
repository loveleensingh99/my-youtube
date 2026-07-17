"use server";

import { getYoutubeApiKey } from "@/lib/env";
import { fetchFeedBatchViaApi, fetchVideoById } from "@/lib/youtube-api";
import type { FeedBatchResult, FeedCursor } from "@/types/feed";
import type { Channel, Video } from "@/types";

export async function fetchFeedBatch(
  channels: Channel[],
  youtubeApiKey?: string | null,
  cursor?: FeedCursor | null,
): Promise<FeedBatchResult> {
  if (channels.length === 0) {
    return {
      videos: [],
      cursor: { channels: {} },
      hasMore: false,
      errors: [],
    };
  }

  const apiKey = getYoutubeApiKey(youtubeApiKey);
  if (!apiKey) {
    return {
      videos: [],
      cursor: cursor ?? { channels: {} },
      hasMore: false,
      errors: [
        "YouTube API key is required. Add YOUTUBE_API_KEY to your environment or settings.",
      ],
    };
  }

  return fetchFeedBatchViaApi(channels, apiKey, cursor);
}

export async function fetchVideoDetails(videoId: string): Promise<Video | null> {
  const apiKey = getYoutubeApiKey(null);
  if (!apiKey) {
    return null;
  }

  try {
    return await fetchVideoById(videoId, apiKey);
  } catch {
    return null;
  }
}
