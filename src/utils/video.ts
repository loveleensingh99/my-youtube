import type { FeedFilter, Settings, Video } from "@/types";

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

export function getChannelInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function buildEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    fs: "1",
    playsinline: "1",
    enablejsapi: "0",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice(0, page * pageSize);
}
