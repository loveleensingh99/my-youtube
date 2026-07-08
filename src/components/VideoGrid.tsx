"use client";

import { useCallback, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { ThumbnailSize, Video } from "@/types";
import { VideoCard } from "./VideoCard";
import { VideoGridSkeleton } from "./Skeleton";
import { EmptyState } from "./ErrorState";

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  compact?: boolean;
  thumbnailSize?: ThumbnailSize;
  watchedIds?: Set<string>;
  onMarkWatched?: (video: Video) => void;
}

export function VideoGrid({
  videos,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  compact = false,
  thumbnailSize = "medium",
  watchedIds = new Set(),
  onMarkWatched,
}: VideoGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
      { rootMargin: "320px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, videos.length]);

  if (isLoading) {
    return <VideoGridSkeleton compact={compact} />;
  }

  if (videos.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            compact={compact}
            thumbnailSize={thumbnailSize}
            isWatched={watchedIds.has(video.id)}
            onMarkWatched={onMarkWatched}
          />
        ))}
      </div>

      {hasMore || isLoadingMore ? (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"
          aria-live="polite"
        >
          {isLoadingMore ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading more videos...
            </>
          ) : (
            "Scroll for more videos"
          )}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          You&apos;ve reached the end of the loaded feed.
        </p>
      )}
    </>
  );
}
