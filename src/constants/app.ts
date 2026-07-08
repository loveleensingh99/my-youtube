export const APP_NAME = "FocusTube";
export const APP_DESCRIPTION =
  "A distraction-free YouTube client for intentional viewing.";

export const STORAGE_KEYS = {
  settings: "focustube:settings",
  watchHistory: "focustube:watch-history",
  channels: "focustube:channels",
  lastRefresh: "focustube:last-refresh",
  selectedFilter: "focustube:selected-filter",
  selectedChannel: "focustube:selected-channel",
  selectedTag: "focustube:selected-tag",
  sidebarCollapsed: "focustube:sidebar-collapsed",
  channelsSectionExpanded: "focustube:channels-section-expanded",
} as const;

export const RSS_BASE_URL =
  "https://www.youtube.com/feeds/videos.xml?channel_id=";

export const YOUTUBE_EMBED_PARAMS = {
  modestbranding: "1",
  rel: "0",
  iv_load_policy: "3",
  fs: "1",
  playsinline: "1",
} as const;

export const NEW_VIDEO_THRESHOLD_HOURS = 24;
export const SHORT_MAX_DURATION_SECONDS = 60;
export const FEED_PAGE_SIZE = 12;
export const API_VIDEOS_PER_PAGE = 15;
export const RSS_MAX_VIDEOS_PER_CHANNEL = 15;
export const DEFAULT_REFRESH_INTERVAL_MINUTES = 15;
