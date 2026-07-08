"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MobileWatchFeed } from "@/components/MobileWatchFeed";
import { ErrorState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import { filterWatchPlaylist, isValidVideoId } from "@/utils/video";

interface WatchPageClientProps {
  videoId: string;
}

export function WatchPageClient({ videoId }: WatchPageClientProps) {
  const router = useRouter();
  const {
    videos,
    history,
    isLoading,
    hasMore,
    isLoadingMore,
    loadMore,
    markAsWatched,
    settings,
    settingsHydrated,
    filter,
    selectedChannel,
  } = useFeedContext();

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

    const fromHistory = history.find((item) => item.videoId === videoId);
    if (fromHistory) {
      return [
        {
          id: fromHistory.videoId,
          title: fromHistory.title,
          channelId: fromHistory.channelId,
          channelName: fromHistory.channelName,
          publishedAt: fromHistory.watchedAt,
          thumbnailUrl: fromHistory.thumbnailUrl,
          type: "video" as const,
          link: `https://www.youtube.com/watch?v=${fromHistory.videoId}`,
        },
        ...scoped,
      ];
    }

    return scoped.length > 0 ? scoped : videos;
  }, [videos, filter, settings, selectedChannel, settingsHydrated, videoId, history]);

  const handleMarkWatched = useCallback(
    (video: (typeof playlist)[number]) => {
      markAsWatched({
        videoId: video.id,
        title: video.title,
        channelId: video.channelId,
        channelName: video.channelName,
        thumbnailUrl: video.thumbnailUrl,
      });
    },
    [markAsWatched],
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

  if (isLoading && playlist.length === 0) {
    return <main className="min-h-[100dvh] bg-black" />;
  }

  if (playlist.length === 0) {
    return (
      <main className="flex min-h-[100dvh] items-center px-4">
        <ErrorState
          title="No videos loaded"
          description="Add channels and refresh your feed before watching."
          onRetry={() => router.push("/")}
        />
      </main>
    );
  }

  return (
    <MobileWatchFeed
      key={videoId}
      videos={playlist}
      initialVideoId={videoId}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMore}
      onMarkWatched={handleMarkWatched}
    />
  );
}
