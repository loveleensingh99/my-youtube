"use client";

import { useCallback, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { Video } from "@/types";
import { VideoCard } from "./VideoCard";
import { VideoGridSkeleton } from "./Skeleton";
import { EmptyState } from "./ErrorState";

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  watchedIds?: Set<string>;
  onMarkWatched?: (video: Video) => void;
  onChannelClick?: (channelId: string) => void;
}

export function VideoGrid({
  videos,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  watchedIds = new Set(),
  onMarkWatched,
  onChannelClick,
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
      { rootMargin: "480px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, videos.length]);

  if (isLoading) {
    return <VideoGridSkeleton />;
  }

  if (videos.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="divide-y divide-border">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isWatched={watchedIds.has(video.id)}
            onMarkWatched={onMarkWatched}
            onChannelClick={onChannelClick}
          />
        ))}
      </div>

      {hasMore || isLoadingMore ? (
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
          ) : (
            "Scroll for more"
          )}
        </div>
      ) : null}
    </>
  );
}
