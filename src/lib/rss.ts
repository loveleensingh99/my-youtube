import Parser from "rss-parser";
import type { Channel, RSSFeed, RSSItem, Video } from "@/types";
import { RSS_BASE_URL } from "@/constants/app";
import { detectVideoType } from "@/lib/video-type";
import { getYouTubeThumbnailUrl, resolveVideoThumbnailUrl } from "@/utils/video";

const parser = new Parser({
  customFields: {
    item: [
      ["media:group", "mediaGroup"],
      ["yt:videoId", "videoId"],
      ["yt:channelId", "channelId"],
    ],
  },
});

function extractVideoId(item: Parser.Item & { videoId?: string }): string {
  if (item.videoId) return item.videoId;
  const match = item.link?.match(/(?:v=|\/shorts\/|youtu\.be\/)([\w-]{11})/);
  return match?.[1] ?? item.guid ?? item.link ?? crypto.randomUUID();
}

function extractDuration(item: Parser.Item & { mediaGroup?: unknown }): number | undefined {
  const mediaGroup = item.mediaGroup as
    | { "media:content"?: { $?: { duration?: string } } | Array<{ $?: { duration?: string } }> }
    | undefined;

  const content = mediaGroup?.["media:content"];
  const first = Array.isArray(content) ? content[0] : content;
  const duration = first?.$?.duration;

  if (!duration) return undefined;
  const parsed = Number.parseInt(duration, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function extractThumbnail(item: Parser.Item & { mediaGroup?: unknown }): string {
  const mediaGroup = item.mediaGroup as
    | { "media:thumbnail"?: { $?: { url?: string } } | Array<{ $?: { url?: string } }> }
    | undefined;

  const thumbnail = mediaGroup?.["media:thumbnail"];
  const first = Array.isArray(thumbnail) ? thumbnail[0] : thumbnail;
  const url = first?.$?.url;

  if (url) return url;

  const videoId = extractVideoId(item);
  return getYouTubeThumbnailUrl(videoId, "maxresdefault");
}

function mapRSSItemToVideo(item: Parser.Item, channel: Channel): Video {
  const id = extractVideoId(item);
  const durationSeconds = extractDuration(item);
  const link = item.link ?? `https://www.youtube.com/watch?v=${id}`;
  const type = detectVideoType({
    title: item.title ?? "",
    link,
    durationSeconds,
  });

  return {
    id,
    title: item.title ?? "Untitled video",
    channelId: channel.id,
    channelName: channel.name,
    publishedAt: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
    thumbnailUrl: resolveVideoThumbnailUrl(id, type, extractThumbnail(item)),
    durationSeconds,
    type,
    link,
  };
}

export async function fetchChannelFeed(channel: Channel): Promise<RSSFeed> {
  const url = `${RSS_BASE_URL}${channel.id}`;
  const feed = await parser.parseURL(url);

  const items: RSSItem[] = (feed.items ?? []).map((item) => {
    const video = mapRSSItemToVideo(item, channel);
    return {
      id: video.id,
      title: video.title,
      link: video.link,
      published: video.publishedAt,
      author: video.channelName,
      thumbnailUrl: video.thumbnailUrl,
      description: item.contentSnippet ?? item.content,
      durationSeconds: video.durationSeconds,
    };
  });

  return {
    title: feed.title ?? channel.name,
    link: feed.link ?? url,
    items,
  };
}

export async function fetchAllChannelVideos(channels: Channel[]): Promise<Video[]> {
  const results = await Promise.allSettled(
    channels.map(async (channel) => {
      const feed = await fetchChannelFeed(channel);
      return feed.items.map((item) => mapRSSItemToVideo(
        {
          title: item.title,
          link: item.link,
          pubDate: item.published,
          isoDate: item.published,
          guid: item.id,
          videoId: item.id,
          mediaGroup: {
            "media:thumbnail": { $: { url: item.thumbnailUrl } },
            ...(item.durationSeconds
              ? {
                  "media:content": {
                    $: { duration: String(item.durationSeconds) },
                  },
                }
              : {}),
          },
        } as Parser.Item & { videoId?: string; mediaGroup?: unknown },
        channel,
      ));
    }),
  );

  const videos = results
    .filter((result): result is PromiseFulfilledResult<Video[]> => result.status === "fulfilled")
    .flatMap((result) => result.value);

  return videos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function rssItemsToVideos(items: RSSItem[], channel: Channel): Video[] {
  return items.map((item) => ({
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
}

export function getChannelFeedUrl(channelId: string): string {
  return `${RSS_BASE_URL}${channelId}`;
}

export { mapRSSItemToVideo };
export { detectVideoType } from "@/lib/video-type";
