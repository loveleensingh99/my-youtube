"use server";

import { getYoutubeApiKey } from "@/lib/env";
import { detectVideoType } from "@/lib/video-type";
import { fetchChannelFeed } from "@/lib/rss";
import { fetchFeedBatchViaApi, fetchVideoById } from "@/lib/youtube-api";
import type { FeedBatchResult, FeedCursor } from "@/types/feed";
import type { Channel, Video } from "@/types";

async function fetchFeedBatchViaRss(channels: Channel[]): Promise<FeedBatchResult> {
  const results = await Promise.allSettled(
    channels.map(async (channel) => {
      const feed = await fetchChannelFeed(channel);
      return feed.items.map((item) => ({
        id: item.id,
        title: item.title,
        channelId: channel.id,
        channelName: channel.name,
        publishedAt: item.published,
        thumbnailUrl: item.thumbnailUrl,
        durationSeconds: item.durationSeconds,
        type: detectVideoType({
          title: item.title,
          link: item.link,
          durationSeconds: item.durationSeconds,
        }),
        link: item.link,
      }));
    }),
  );

  const errors: string[] = [];
  const videos: Video[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      videos.push(...result.value);
    } else {
      errors.push(`Failed to load ${channels[index]?.name ?? "channel"}`);
    }
  });

  videos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return {
    videos,
    cursor: { channels: {} },
    hasMore: false,
    errors,
    source: "rss",
  };
}

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
      source: "rss",
    };
  }

  const apiKey = getYoutubeApiKey(youtubeApiKey);
  if (apiKey) {
    const result = await fetchFeedBatchViaApi(channels, apiKey, cursor);
    return { ...result, source: "api" };
  }

  if (cursor && Object.keys(cursor.channels).length > 0) {
    return {
      videos: [],
      cursor,
      hasMore: false,
      errors: [],
      source: "rss",
    };
  }

  return fetchFeedBatchViaRss(channels);
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

/** @deprecated Use fetchFeedBatch for paginated loading */
export async function fetchFeedVideos(
  channels: Channel[],
  youtubeApiKey?: string | null,
) {
  const result = await fetchFeedBatch(channels, youtubeApiKey, null);
  return {
    videos: result.videos,
    errors: result.errors,
    source: result.source,
  };
}
