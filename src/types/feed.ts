import type { Video } from "./video";

export type FeedFilter = "all" | "videos" | "shorts";

export interface ChannelFeedCursor {
  playlistId?: string;
  nextPageToken?: string | null;
}

export interface FeedCursor {
  channels: Record<string, ChannelFeedCursor>;
}

export interface FeedBatchResult {
  videos: Video[];
  cursor: FeedCursor;
  hasMore: boolean;
  errors: string[];
  source: "api" | "rss";
}

export interface FeedState {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}
