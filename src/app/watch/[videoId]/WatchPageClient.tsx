"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileWatchFeed } from "@/components/MobileWatchFeed";
import { LongFormWatch } from "@/components/LongFormWatch";
import { ErrorState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import { WatchPageSkeleton } from "@/components/Skeleton";
import { fetchVideoDetails } from "@/app/actions/feed";
import { createFallbackWatchVideo, filterWatchPlaylist, isValidVideoId } from "@/utils/video";
import type { Video } from "@/types";

interface WatchPageClientProps {
  videoId: string;
}

export function WatchPageClient({ videoId }: WatchPageClientProps) {
  const router = useRouter();
  const {
    videos,
    isLoading,
    hasMore,
    isLoadingMore,
    loadMore,
    settings,
    settingsHydrated,
    filter,
    selectedChannel,
  } = useFeedContext();

  const [fetchedVideo, setFetchedVideo] = useState<Video | null>(null);
  const [isFetchingVideo, setIsFetchingVideo] = useState(false);

  const playlist = useMemo(() => {
    if (!settingsHydrated) return videos;

    const scoped = filterWatchPlaylist(videos, filter, settings, selectedChannel);
    if (scoped.some((video) => video.id === videoId)) {
      return scoped;
    }

    const allChannels = filterWatchPlaylist(videos, filter, settings, null);
    if (allChannels.some((video) => video.id === videoId)) {
      return allChannels;
    }

    return scoped.length > 0 ? scoped : videos;
  }, [videos, filter, settings, selectedChannel, settingsHydrated, videoId]);

  const activeVideo = useMemo(() => {
    return (
      playlist.find((video) => video.id === videoId) ??
      fetchedVideo ??
      videos.find((video) => video.id === videoId) ??
      null
    );
  }, [playlist, fetchedVideo, videos, videoId]);

  useEffect(() => {
    if (activeVideo || !isValidVideoId(videoId)) {
      return;
    }

    setIsFetchingVideo(true);
    void fetchVideoDetails(videoId)
      .then((video) => {
        setFetchedVideo(video ?? createFallbackWatchVideo(videoId));
      })
      .finally(() => {
        setIsFetchingVideo(false);
      });
  }, [activeVideo, videoId]);

  const shortsPlaylist = useMemo(
    () => playlist.filter((video) => video.type === "short"),
    [playlist],
  );

  const upNext = useMemo(
    () => playlist.filter((video) => video.type === "video" && video.id !== videoId),
    [playlist, videoId],
  );

  if (!isValidVideoId(videoId)) {
    return (
      <main className="flex min-h-[100dvh] items-center px-4">
        <ErrorState
          title="Invalid video link"
          description="This URL does not contain a valid YouTube video ID."
          onRetry={() => router.push("/")}
        />
      </main>
    );
  }

  if ((isLoading || !settingsHydrated || isFetchingVideo) && !activeVideo) {
    return <WatchPageSkeleton />;
  }

  if (!activeVideo) {
    return (
      <main className="flex min-h-[100dvh] items-center px-4">
        <ErrorState
          title="Video unavailable"
          description="Could not load this video. Check your API key or try again later."
          onRetry={() => router.push("/")}
        />
      </main>
    );
  }

  if (activeVideo.type === "short") {
    const shortFeed =
      shortsPlaylist.length > 0 && shortsPlaylist.some((video) => video.id === videoId)
        ? shortsPlaylist
        : [activeVideo];

    return (
      <MobileWatchFeed
        key={videoId}
        videos={shortFeed}
        initialVideoId={videoId}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />
    );
  }

  return <LongFormWatch video={activeVideo} upNext={upNext} />;
}
