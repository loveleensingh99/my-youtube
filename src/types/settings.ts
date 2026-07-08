import type { FeedFilter } from "./feed";

export type ThumbnailSize = "small" | "medium" | "large";

export interface Settings {
  autoRefresh: boolean;
  refreshInterval: number;
  compactMode: boolean;
  showShorts: boolean;
  showVideos: boolean;
  thumbnailSize: ThumbnailSize;
  defaultFilter: FeedFilter;
  youtubeApiKey: string;
}
