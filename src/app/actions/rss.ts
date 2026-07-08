"use server";

import { channels } from "@/data/channels";
import { fetchChannelFeed } from "@/lib/rss";
import type { Video } from "@/types";

export async function fetchFeedVideos(): Promise<{
  videos: Video[];
  errors: string[];
}> {
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
        type:
          item.link.includes("/shorts/") ||
          item.title.toLowerCase().includes("#shorts") ||
          (item.durationSeconds !== undefined && item.durationSeconds <= 60)
            ? ("short" as const)
            : ("video" as const),
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

  return { videos, errors };
}
