import type { Channel, FeedFilter, Settings, ThumbnailSize, WatchHistoryItem } from "@/types";
import { defaultChannels } from "@/data/channels";
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
    youtubeApiKey:
      typeof raw.youtubeApiKey === "string" ? raw.youtubeApiKey.trim() : defaultSettings.youtubeApiKey,
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

export function normalizeTag(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeChannels(value: unknown, fallback: Channel[] = defaultChannels): Channel[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const channels = value
    .filter(
      (item): item is Channel =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as Channel).id === "string" &&
        (item as Channel).id.startsWith("UC") &&
        typeof (item as Channel).name === "string",
    )
    .map((item) => ({
      id: item.id,
      name: item.name.trim() || "YouTube Channel",
      category:
        typeof item.category === "string" && item.category.trim()
          ? item.category.trim()
          : "General",
    }));

  return channels.length > 0 ? channels : fallback;
}

export function clearFocusTubeStorage() {
  if (typeof window === "undefined") return;

  Object.keys(window.localStorage).forEach((key) => {
    if (key.startsWith("focustube:")) {
      window.localStorage.removeItem(key);
    }
  });

  window.dispatchEvent(new CustomEvent("focustube:storage", { detail: { key: "*" } }));
}
