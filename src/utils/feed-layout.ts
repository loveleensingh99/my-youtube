import type { Video } from "@/types";

type VideoSegment = { kind: "video"; video: Video };
type ShortsSegment = { kind: "shorts"; videos: Video[] };
export type FeedSegment = VideoSegment | ShortsSegment;

export function segmentFeedVideos(videos: Video[]): FeedSegment[] {
  const segments: FeedSegment[] = [];
  let shortBuffer: Video[] = [];

  const flushShorts = () => {
    if (shortBuffer.length === 0) {
      return;
    }

    segments.push({ kind: "shorts", videos: [...shortBuffer] });
    shortBuffer = [];
  };

  for (const video of videos) {
    if (video.type === "short") {
      shortBuffer.push(video);
      continue;
    }

    flushShorts();
    segments.push({ kind: "video", video });
  }

  flushShorts();
  return segments;
}

export function isShortsOnlyFeed(videos: Video[]): boolean {
  return videos.length > 0 && videos.every((video) => video.type === "short");
}
