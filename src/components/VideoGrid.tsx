"use client";

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import type { FeedFilter, Settings } from "@/types";
import type { Video } from "@/types";
import { segmentFeedVideos, isShortsOnlyFeed } from "@/utils/feed-layout";
import { VideoCard } from "./VideoCard";
import { ShortCard } from "./ShortCard";
import { VideoGridSkeleton, LoadMoreVideoSkeleton } from "./Skeleton";
import { EmptyState } from "./ErrorState";

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  feedFilter?: FeedFilter;
  compactMode?: boolean;
  thumbnailSize?: Settings["thumbnailSize"];
}

export function VideoGrid({
  videos,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  feedFilter = "all",
  compactMode = false,
  thumbnailSize = "medium",
}: VideoGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const segments = useMemo(() => segmentFeedVideos(videos), [videos]);
  const shortsOnly = feedFilter === "shorts" || isShortsOnlyFeed(videos);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    onLoadMore?.();
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "480px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, videos.length]);

  if (isLoading) {
    return <VideoGridSkeleton shortsOnly={shortsOnly} />;
  }

  if (videos.length === 0) {
    return <EmptyState />;
  }

  if (shortsOnly) {
    return (
      <>
        <div className="grid grid-cols-2 gap-x-2 gap-y-4 px-2 py-2">
          {videos.map((video) => (
            <ShortCard key={video.id} video={video} compactMode={compactMode} />
          ))}
        </div>

        {isLoadingMore ? <LoadMoreVideoSkeleton shortsOnly /> : null}

        {hasMore ? (
          <LoadMoreSentinel sentinelRef={sentinelRef} />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {segments.map((segment, index) => {
          if (segment.kind === "video") {
            return (
              <div key={segment.video.id} className="border-b border-border">
                <VideoCard
                  video={segment.video}
                  compactMode={compactMode}
                  thumbnailSize={thumbnailSize}
                />
              </div>
            );
          }

          return (
            <div
              key={`shorts-${segment.videos[0]?.id ?? index}`}
              className="grid grid-cols-2 gap-x-2 gap-y-4 border-b border-border px-2 py-3"
            >
              {segment.videos.map((video) => (
                <ShortCard key={video.id} video={video} compactMode={compactMode} />
              ))}
            </div>
          );
        })}
      </div>

      {isLoadingMore ? <LoadMoreVideoSkeleton /> : null}

      {hasMore ? <LoadMoreSentinel sentinelRef={sentinelRef} /> : null}
    </>
  );
}

function LoadMoreSentinel({
  sentinelRef,
}: {
  sentinelRef: RefObject<HTMLDivElement | null>;
}) {
  return <div ref={sentinelRef} className="h-4" aria-hidden />;
}
