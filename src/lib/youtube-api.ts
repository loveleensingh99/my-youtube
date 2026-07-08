import { API_VIDEOS_PER_PAGE } from "@/constants/app";
import { detectVideoType } from "@/lib/video-type";
import type { ChannelFeedCursor, FeedCursor } from "@/types/feed";
import type { Channel, Video } from "@/types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface PlaylistItemSnippet {
  title: string;
  publishedAt: string;
  thumbnails?: {
    high?: { url?: string };
    medium?: { url?: string };
    default?: { url?: string };
  };
  resourceId?: { videoId?: string };
}

interface PlaylistItem {
  snippet: PlaylistItemSnippet;
  contentDetails?: { videoId?: string };
}

interface PlaylistItemsResponse {
  items?: PlaylistItem[];
  nextPageToken?: string;
  error?: { message?: string };
}

interface ChannelsResponse {
  items?: Array<{
    id?: string;
    snippet?: {
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
    contentDetails?: {
      relatedPlaylists?: { uploads?: string };
    };
  }>;
  error?: { message?: string };
}

function getChannelAvatarUrl(
  snippet: NonNullable<ChannelsResponse["items"]>[number]["snippet"],
): string | undefined {
  return (
    snippet?.thumbnails?.high?.url ??
    snippet?.thumbnails?.medium?.url ??
    snippet?.thumbnails?.default?.url
  );
}

export async function fetchChannelAvatars(
  channelIds: string[],
  apiKey: string,
): Promise<Record<string, string>> {
  const avatars: Record<string, string> = {};
  const uniqueIds = [...new Set(channelIds.filter(Boolean))];

  for (let index = 0; index < uniqueIds.length; index += 50) {
    const batch = uniqueIds.slice(index, index + 50);
    const data = await youtubeGet<ChannelsResponse>(
      "channels",
      {
        part: "snippet",
        id: batch.join(","),
      },
      apiKey,
    );

    data.items?.forEach((item) => {
      const channelId = item.id;
      const avatarUrl = getChannelAvatarUrl(item.snippet);
      if (channelId && avatarUrl) {
        avatars[channelId] = avatarUrl;
      }
    });
  }

  return avatars;
}

interface VideoDetailsItem {
  id: string;
  snippet?: {
    title?: string;
    publishedAt?: string;
    channelId?: string;
    channelTitle?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
  contentDetails?: { duration?: string };
}

interface VideosListResponse {
  items?: VideoDetailsItem[];
  error?: { message?: string };
}

function parseIsoDuration(duration?: string): number | undefined {
  if (!duration) return undefined;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;

  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);
  const seconds = Number.parseInt(match[3] ?? "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

function getThumbnailFromSnippet(
  snippet: VideoDetailsItem["snippet"],
  videoId: string,
): string {
  return (
    snippet?.thumbnails?.high?.url ??
    snippet?.thumbnails?.medium?.url ??
    snippet?.thumbnails?.default?.url ??
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  );
}

function getThumbnailUrl(snippet: PlaylistItemSnippet, videoId: string): string {
  return (
    snippet.thumbnails?.high?.url ??
    snippet.thumbnails?.medium?.url ??
    snippet.thumbnails?.default?.url ??
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  );
}

function mapPlaylistItemsToVideos(
  items: PlaylistItem[],
  channel: Channel,
  durations: Map<string, number>,
): Video[] {
  const videos: Video[] = [];

  for (const item of items) {
    const videoId = item.contentDetails?.videoId ?? item.snippet.resourceId?.videoId;
    if (!videoId) continue;

    const durationSeconds = durations.get(videoId);
    const title = item.snippet.title;

    videos.push({
      id: videoId,
      title,
      channelId: channel.id,
      channelName: channel.name,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: getThumbnailUrl(item.snippet, videoId),
      durationSeconds,
      type: detectVideoType({
        title,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        durationSeconds,
      }),
      link: `https://www.youtube.com/watch?v=${videoId}`,
    });
  }

  return videos;
}

async function youtubeGet<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const searchParams = new URLSearchParams({ ...params, key: apiKey });
  const response = await fetch(`${YOUTUBE_API_BASE}/${path}?${searchParams.toString()}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`YouTube API request failed (${response.status})`);
  }

  const data = (await response.json()) as T & { error?: { message?: string } };
  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  return data;
}

async function getUploadsPlaylistId(channelId: string, apiKey: string): Promise<string> {
  const data = await youtubeGet<ChannelsResponse>(
    "channels",
    {
      part: "contentDetails",
      id: channelId,
    },
    apiKey,
  );

  const playlistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) {
    throw new Error("Uploads playlist not found for channel.");
  }

  return playlistId;
}

async function fetchVideoDurations(videoIds: string[], apiKey: string): Promise<Map<string, number>> {
  const durations = new Map<string, number>();

  if (videoIds.length === 0) {
    return durations;
  }

  for (let index = 0; index < videoIds.length; index += 50) {
    const batch = videoIds.slice(index, index + 50);
    const data = await youtubeGet<VideosListResponse>(
      "videos",
      {
        part: "contentDetails",
        id: batch.join(","),
      },
      apiKey,
    );

    data.items?.forEach((item) => {
      const seconds = parseIsoDuration(item.contentDetails?.duration);
      if (seconds !== undefined) {
        durations.set(item.id, seconds);
      }
    });
  }

  return durations;
}

async function fetchChannelFeedPage(
  channel: Channel,
  apiKey: string,
  channelCursor?: ChannelFeedCursor,
): Promise<{ videos: Video[]; cursor: ChannelFeedCursor }> {
  if (channelCursor?.nextPageToken === null) {
    return { videos: [], cursor: channelCursor };
  }

  const playlistId = channelCursor?.playlistId ?? (await getUploadsPlaylistId(channel.id, apiKey));
  const params: Record<string, string> = {
    part: "snippet,contentDetails",
    playlistId,
    maxResults: String(API_VIDEOS_PER_PAGE),
  };

  if (channelCursor?.nextPageToken) {
    params.pageToken = channelCursor.nextPageToken;
  }

  const data = await youtubeGet<PlaylistItemsResponse>("playlistItems", params, apiKey);
  const videoIds = (data.items ?? [])
    .map((item) => item.contentDetails?.videoId ?? item.snippet.resourceId?.videoId)
    .filter((id): id is string => Boolean(id));

  const durations = await fetchVideoDurations(videoIds, apiKey);
  const videos = mapPlaylistItemsToVideos(data.items ?? [], channel, durations);

  return {
    videos,
    cursor: {
      playlistId,
      nextPageToken: data.nextPageToken ?? null,
    },
  };
}

export async function fetchFeedBatchViaApi(
  channels: Channel[],
  apiKey: string,
  cursor?: FeedCursor | null,
): Promise<{ videos: Video[]; cursor: FeedCursor; hasMore: boolean; errors: string[] }> {
  const channelCursors = cursor?.channels ?? {};
  const results = await Promise.allSettled(
    channels.map((channel) =>
      fetchChannelFeedPage(channel, apiKey, channelCursors[channel.id]),
    ),
  );

  const errors: string[] = [];
  const videos: Video[] = [];
  const nextChannelCursors: Record<string, ChannelFeedCursor> = { ...channelCursors };

  results.forEach((result, index) => {
    const channel = channels[index];
    if (!channel) return;

    if (result.status === "fulfilled") {
      videos.push(...result.value.videos);
      nextChannelCursors[channel.id] = result.value.cursor;
    } else {
      const message =
        result.reason instanceof Error ? result.reason.message : "Unknown error";
      errors.push(`Failed to load ${channel.name}: ${message}`);
      nextChannelCursors[channel.id] = {
        ...(channelCursors[channel.id] ?? {}),
        nextPageToken: null,
      };
    }
  });

  videos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const hasMore = channels.some((channel) =>
    Boolean(nextChannelCursors[channel.id]?.nextPageToken),
  );

  return {
    videos,
    cursor: { channels: nextChannelCursors },
    hasMore,
    errors,
  };
}

export async function fetchVideoById(videoId: string, apiKey: string): Promise<Video | null> {
  const data = await youtubeGet<VideosListResponse>(
    "videos",
    {
      part: "snippet,contentDetails",
      id: videoId,
    },
    apiKey,
  );

  const item = data.items?.[0];
  if (!item?.snippet) {
    return null;
  }

  const durationSeconds = parseIsoDuration(item.contentDetails?.duration);
  const link = `https://www.youtube.com/watch?v=${videoId}`;

  return {
    id: videoId,
    title: item.snippet.title ?? "Untitled video",
    channelId: item.snippet.channelId ?? "",
    channelName: item.snippet.channelTitle ?? "YouTube",
    publishedAt: item.snippet.publishedAt ?? new Date().toISOString(),
    thumbnailUrl: getThumbnailFromSnippet(item.snippet, videoId),
    durationSeconds,
    type: detectVideoType({
      title: item.snippet.title ?? "",
      link,
      durationSeconds,
    }),
    link,
  };
}
