import type { FeedFilter, Settings, ThumbnailSize, WatchHistoryItem } from "@/types";
import { defaultSettings } from "@/lib/defaults";

const VALID_FILTERS: FeedFilter[] = ["all", "videos", "shorts"];
const VALID_THUMBNAIL_SIZES: ThumbnailSize[] = ["small", "medium", "large"];

export function normalizeSettings(value: unknown): Settings {
  if (!value || typeof value !== "object") {
    return defaultSettings;
  }

  const raw = value as Partial<Settings>;

  return {
    autoRefresh: Boolean(raw.autoRefresh),
    refreshInterval:
      typeof raw.refreshInterval === "number" &&
      raw.refreshInterval >= 5 &&
      raw.refreshInterval <= 120
        ? raw.refreshInterval
        : defaultSettings.refreshInterval,
    compactMode: Boolean(raw.compactMode),
    showShorts: raw.showShorts !== false,
    showVideos: raw.showVideos !== false,
    hideWatchedVideos: Boolean(raw.hideWatchedVideos),
    thumbnailSize: VALID_THUMBNAIL_SIZES.includes(raw.thumbnailSize as ThumbnailSize)
      ? (raw.thumbnailSize as ThumbnailSize)
      : defaultSettings.thumbnailSize,
    defaultFilter: VALID_FILTERS.includes(raw.defaultFilter as FeedFilter)
      ? (raw.defaultFilter as FeedFilter)
      : defaultSettings.defaultFilter,
  };
}

export function normalizeWatchHistory(value: unknown): WatchHistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is WatchHistoryItem =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as WatchHistoryItem).videoId === "string" &&
        typeof (item as WatchHistoryItem).title === "string" &&
        typeof (item as WatchHistoryItem).channelId === "string" &&
        typeof (item as WatchHistoryItem).channelName === "string" &&
        typeof (item as WatchHistoryItem).thumbnailUrl === "string" &&
        typeof (item as WatchHistoryItem).watchedAt === "string",
    )
    .slice(0, 100);
}

export function normalizeFeedFilter(value: unknown, fallback: FeedFilter = "all"): FeedFilter {
  return VALID_FILTERS.includes(value as FeedFilter) ? (value as FeedFilter) : fallback;
}

export function normalizeChannelId(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function clearFocusTubeStorage() {
  if (typeof window === "undefined") return;

  Object.keys(window.localStorage).forEach((key) => {
    if (key.startsWith("focustube:")) {
      window.localStorage.removeItem(key);
    }
  });

  window.dispatchEvent(new Event("focustube:storage"));
}
