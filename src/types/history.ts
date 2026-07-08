export interface WatchHistoryItem {
  videoId: string;
  title: string;
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
  watchedAt: string;
  progress?: number;
}

export interface WatchHistory {
  items: WatchHistoryItem[];
}
