import type { FeedFilter, Settings, Video, WatchHistoryItem } from "@/types";

export function isValidVideoId(videoId: string): boolean {
  return /^[\w-]{11}$/.test(videoId);
}

export function resolveWatchVideo(
  videoId: string,
  videos: Video[],
  history: WatchHistoryItem[],
): Video | null {
  const fromFeed = videos.find((video) => video.id === videoId);
  if (fromFeed) return fromFeed;

  const fromHistory = history.find((item) => item.videoId === videoId);
  if (!fromHistory) return null;

  return {
    id: fromHistory.videoId,
    title: fromHistory.title,
    channelId: fromHistory.channelId,
    channelName: fromHistory.channelName,
    publishedAt: fromHistory.watchedAt,
    thumbnailUrl: fromHistory.thumbnailUrl,
    type: "video",
    link: `https://www.youtube.com/watch?v=${fromHistory.videoId}`,
  };
}

export function createFallbackWatchVideo(videoId: string): Video {
  return {
    id: videoId,
    title: "Loading video details...",
    channelId: "",
    channelName: "YouTube",
    publishedAt: new Date().toISOString(),
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    type: "video",
    link: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

export function filterVideos(
  videos: Video[],
  filter: FeedFilter,
  settings: Settings,
  watchedIds: Set<string>,
  channelId?: string | null,
): Video[] {
  return videos.filter((video) => {
    if (channelId && video.channelId !== channelId) return false;
    if (filter === "videos" && video.type !== "video") return false;
    if (filter === "shorts" && video.type !== "short") return false;
    if (!settings.showVideos && video.type === "video") return false;
    if (!settings.showShorts && video.type === "short") return false;
    if (settings.hideWatchedVideos && watchedIds.has(video.id)) return false;
    return true;
  });
}

export function filterWatchPlaylist(
  videos: Video[],
  filter: FeedFilter,
  settings: Settings,
  channelId?: string | null,
): Video[] {
  return videos.filter((video) => {
    if (channelId && video.channelId !== channelId) return false;
    if (filter === "videos" && video.type !== "video") return false;
    if (filter === "shorts" && video.type !== "short") return false;
    if (!settings.showVideos && video.type === "video") return false;
    if (!settings.showShorts && video.type === "short") return false;
    return true;
  });
}

export function getChannelInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function buildEmbedUrl(
  videoId: string,
  options?: { autoplay?: boolean; origin?: string },
): string {
  const params = new URLSearchParams({
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    fs: "1",
    playsinline: "1",
    controls: "1",
    enablejsapi: "1",
  });

  if (options?.autoplay) {
    params.set("autoplay", "1");
  }

  if (options?.origin) {
    params.set("origin", options.origin);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice(0, page * pageSize);
}
