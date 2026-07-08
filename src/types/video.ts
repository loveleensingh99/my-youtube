export type VideoType = "video" | "short";

export interface Video {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  publishedAt: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  type: VideoType;
  link: string;
}
