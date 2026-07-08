"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { WatchPlayer } from "@/components/WatchPlayer";
import { BackLink } from "@/components/HistorySection";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { useFeedContext } from "@/components/FeedProvider";
import { formatFullDate } from "@/utils/date";
import {
  createFallbackWatchVideo,
  getChannelInitials,
  isValidVideoId,
  resolveWatchVideo,
} from "@/utils/video";

interface WatchPageClientProps {
  videoId: string;
}

export function WatchPageClient({ videoId }: WatchPageClientProps) {
  const router = useRouter();
  const {
    videos,
    history,
    markAsWatched,
    removeFromHistory,
    watchedIds,
    refresh,
    lastUpdatedLabel,
    isLoading,
  } = useFeedContext();

  const resolvedVideo = useMemo(
    () => resolveWatchVideo(videoId, videos, history),
    [videoId, videos, history],
  );

  const video = resolvedVideo ?? createFallbackWatchVideo(videoId);
  const isMetadataPending = !resolvedVideo && isLoading;
  const isUnknownVideo = !resolvedVideo && !isLoading;

  const handleMarkWatched = useCallback(() => {
    markAsWatched({
      videoId: video.id,
      title: video.title,
      channelId: video.channelId,
      channelName: video.channelName,
      thumbnailUrl: video.thumbnailUrl,
    });
  }, [markAsWatched, video]);

  if (!isValidVideoId(videoId)) {
    return (
      <>
        <Header title="Watch" lastUpdatedLabel={lastUpdatedLabel} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <BackLink />
          <ErrorState
            title="Invalid video link"
            description="This URL does not contain a valid YouTube video ID."
            onRetry={() => router.push("/")}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Watch"
        onRefresh={() => void refresh()}
        isRefreshing={isLoading}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <BackLink />

        <WatchPlayer videoId={videoId} title={video.title} />

        {isUnknownVideo ? (
          <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            This video is not in your curated feed. It may be from a channel you have not added.
          </p>
        ) : null}

        <div className="space-y-4 rounded-xl border border-border/60 bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm font-semibold">
              {getChannelInitials(video.channelName)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {isMetadataPending ? "Loading video details..." : video.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {video.channelName}
                {!isMetadataPending ? ` · Published ${formatFullDate(video.publishedAt)}` : null}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {watchedIds.has(video.id) ? (
              <Button variant="outline" onClick={() => removeFromHistory(video.id)}>
                Remove from history
              </Button>
            ) : (
              <Button variant="outline" onClick={handleMarkWatched} disabled={isMetadataPending}>
                Mark as watched
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
