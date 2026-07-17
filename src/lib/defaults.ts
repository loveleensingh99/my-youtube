import type { Settings } from "@/types";
import { DEFAULT_REFRESH_INTERVAL_MINUTES } from "@/constants/app";

export const defaultSettings: Settings = {
  autoRefresh: false,
  refreshInterval: DEFAULT_REFRESH_INTERVAL_MINUTES,
  compactMode: false,
  showShorts: true,
  showVideos: true,
  thumbnailSize: "medium",
  defaultFilter: "all",
  youtubeApiKey: "",
  mutedKeywords: [],
};
