"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FEED_PAGE_SIZE } from "@/constants/app";
import type { ThumbnailSize, Video } from "@/types";
import { paginate } from "@/utils/video";
import { VideoCard } from "./VideoCard";
import { VideoGridSkeleton } from "./Skeleton";
import { EmptyState } from "./ErrorState";

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  compact?: boolean;
  thumbnailSize?: ThumbnailSize;
  watchedIds?: Set<string>;
  onMarkWatched?: (video: Video) => void;
}

export function VideoGrid({
  videos,
  isLoading = false,
  compact = false,
  thumbnailSize = "medium",
  watchedIds = new Set(),
  onMarkWatched,
}: VideoGridProps) {
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleVideos = useMemo(
    () => paginate(videos, page, FEED_PAGE_SIZE),
    [page, videos],
  );

  const hasMore = visibleVideos.length < videos.length;

  const loadMore = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, visibleVideos.length]);

  if (isLoading) {
    return <VideoGridSkeleton compact={compact} />;
  }

  if (videos.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visibleVideos.map((video) => (
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
      {hasMore ? <div ref={sentinelRef} className="h-10" aria-hidden /> : null}
    </>
  );
}
