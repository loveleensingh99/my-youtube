import type { Video } from "./video";

export type FeedFilter = "all" | "videos" | "shorts";

export interface FeedState {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}
