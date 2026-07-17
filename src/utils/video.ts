import type { FeedFilter, Settings, Video, VideoType } from "@/types";

const YT_THUMBNAIL_PATTERN =
  /https:\/\/i\.ytimg\.com\/vi\/([\w-]{11})\/([\w\d]+)\.jpg(?:\?.*)?$/i;

export function extractYouTubeVideoIdFromThumbnailUrl(url: string): string | null {
  const match = url.match(/\/vi\/([\w-]{11})\//);
  return match?.[1] ?? null;
}

export type YouTubeThumbnailQuality =
  | "maxresdefault"
  | "sddefault"
  | "hqdefault"
  | "mqdefault"
  | "default";

export type YouTubeShortThumbnailQuality =
  | "oar2"
  | "oar1"
  | "oardefault"
  | "maxresdefault"
  | "sddefault"
  | "hqdefault";

export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: YouTubeThumbnailQuality = "maxresdefault",
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

export function getYouTubeShortThumbnailUrl(
  videoId: string,
  quality: YouTubeShortThumbnailQuality = "oar2",
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

export function upgradeYouTubeThumbnailUrl(url: string, videoId?: string): string {
  const id = videoId ?? extractYouTubeVideoIdFromThumbnailUrl(url);
  if (!id) return url;

  const match = url.match(YT_THUMBNAIL_PATTERN);
  if (match?.[2] === "maxresdefault") return url;

  return getYouTubeThumbnailUrl(id, "maxresdefault");
}

export function upgradeYouTubeShortThumbnailUrl(url: string, videoId?: string): string {
  const id = videoId ?? extractYouTubeVideoIdFromThumbnailUrl(url);
  if (!id) return url;

  const match = url.match(YT_THUMBNAIL_PATTERN);
  if (match?.[2]?.startsWith("oar")) return url;

  return getYouTubeShortThumbnailUrl(id, "oar2");
}

export function getYouTubeThumbnailFallback(
  videoId: string,
  currentUrl: string,
): string | null {
  if (currentUrl.includes("maxresdefault")) {
    return getYouTubeThumbnailUrl(videoId, "sddefault");
  }

  if (currentUrl.includes("sddefault")) {
    return getYouTubeThumbnailUrl(videoId, "hqdefault");
  }

  return null;
}

export function getYouTubeShortThumbnailFallback(
  videoId: string,
  currentUrl: string,
): string | null {
  if (currentUrl.includes("oar2")) {
    return getYouTubeShortThumbnailUrl(videoId, "oar1");
  }

  if (currentUrl.includes("oar1") || currentUrl.includes("oardefault")) {
    return getYouTubeShortThumbnailUrl(videoId, "maxresdefault");
  }

  if (currentUrl.includes("maxresdefault")) {
    return getYouTubeThumbnailUrl(videoId, "sddefault");
  }

  if (currentUrl.includes("sddefault")) {
    return getYouTubeThumbnailUrl(videoId, "hqdefault");
  }

  return null;
}

export function resolveVideoThumbnailUrl(
  videoId: string,
  type: VideoType,
  existingUrl?: string,
): string {
  if (type === "short") {
    return upgradeYouTubeShortThumbnailUrl(existingUrl ?? "", videoId);
  }

  return upgradeYouTubeThumbnailUrl(
    existingUrl ?? getYouTubeThumbnailUrl(videoId),
    videoId,
  );
}

export function isValidVideoId(videoId: string): boolean {
  return /^[\w-]{11}$/.test(videoId);
}

export function createFallbackWatchVideo(videoId: string): Video {
  return {
    id: videoId,
    title: "Loading video details...",
    channelId: "",
    channelName: "YouTube",
    publishedAt: new Date().toISOString(),
    thumbnailUrl: getYouTubeThumbnailUrl(videoId, "maxresdefault"),
    type: "video",
    link: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

export function titleMatchesMutedKeywords(title: string, keywords: string[]): boolean {
  if (keywords.length === 0) {
    return false;
  }

  const normalizedTitle = title.toLowerCase();
  return keywords.some((keyword) => {
    const trimmed = keyword.trim().toLowerCase();
    return trimmed.length > 0 && normalizedTitle.includes(trimmed);
  });
}

export function filterVideos(
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
    if (titleMatchesMutedKeywords(video.title, settings.mutedKeywords)) return false;
    return true;
  });
}

export function filterWatchPlaylist(
  videos: Video[],
  filter: FeedFilter,
  settings: Settings,
  channelId?: string | null,
): Video[] {
  return filterVideos(videos, filter, settings, channelId);
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
