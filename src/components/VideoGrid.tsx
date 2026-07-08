"use client";

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { Loader2 } from "lucide-react";
import type { FeedFilter } from "@/types";
import type { Video } from "@/types";
import { segmentFeedVideos, isShortsOnlyFeed } from "@/utils/feed-layout";
import { VideoCard } from "./VideoCard";
import { ShortCard } from "./ShortCard";
import { VideoGridSkeleton } from "./Skeleton";
import { EmptyState } from "./ErrorState";

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  feedFilter?: FeedFilter;
}

export function VideoGrid({
  videos,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  feedFilter = "all",
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
            <ShortCard key={video.id} video={video} />
          ))}
        </div>

        {hasMore || isLoadingMore ? (
          <LoadMoreSentinel
            sentinelRef={sentinelRef}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
          />
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
                <VideoCard video={segment.video} />
              </div>
            );
          }

          return (
            <div
              key={`shorts-${segment.videos[0]?.id ?? index}`}
              className="grid grid-cols-2 gap-x-2 gap-y-4 border-b border-border px-2 py-3"
            >
              {segment.videos.map((video) => (
                <ShortCard key={video.id} video={video} />
              ))}
            </div>
          );
        })}
      </div>

      {hasMore || isLoadingMore ? (
        <LoadMoreSentinel
          sentinelRef={sentinelRef}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
        />
      ) : null}
    </>
  );
}

function LoadMoreSentinel({
  sentinelRef,
  isLoadingMore,
  hasMore,
}: {
  sentinelRef: RefObject<HTMLDivElement | null>;
  isLoadingMore: boolean;
  hasMore: boolean;
}) {
  return (
    <div
      ref={sentinelRef}
      className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
      aria-live="polite"
    >
      {isLoadingMore ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more...
        </>
      ) : hasMore ? (
        "Scroll for more"
      ) : null}
    </div>
  );
}
