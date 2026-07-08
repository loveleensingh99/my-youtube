"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { WatchPlayer } from "@/components/WatchPlayer";
import { BackLink } from "@/components/HistorySection";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { useFeedContext } from "@/components/FeedProvider";
import { formatFullDate } from "@/utils/date";
import { getChannelInitials } from "@/utils/video";

interface WatchPageClientProps {
  videoId: string;
}

export function WatchPageClient({ videoId }: WatchPageClientProps) {
  const router = useRouter();
  const {
    videos,
    markAsWatched,
    removeFromHistory,
    watchedIds,
    refresh,
    lastUpdatedLabel,
    isLoading,
  } = useFeedContext();

  const video = useMemo(
    () => videos.find((item) => item.id === videoId),
    [videoId, videos],
  );

  const handleStarted = () => {
    if (!video) return;
    markAsWatched({
      videoId: video.id,
      title: video.title,
      channelId: video.channelId,
      channelName: video.channelName,
      thumbnailUrl: video.thumbnailUrl,
    });
  };

  if (!video && !isLoading) {
    return (
      <>
        <Header title="Watch" lastUpdatedLabel={lastUpdatedLabel} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <BackLink />
          <ErrorState
            title="Video not found"
            description="This video isn't in your curated feed. It may be from an unselected channel."
            onRetry={() => router.push("/")}
          />
        </main>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Header
          title="Watch"
          onRefresh={() => void refresh()}
          isRefreshing={isLoading}
          lastUpdatedLabel={lastUpdatedLabel}
        />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="aspect-video animate-pulse rounded-xl bg-muted/40" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Watch" lastUpdatedLabel={lastUpdatedLabel} />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <BackLink />

        <WatchPlayer videoId={video.id} title={video.title} onStarted={handleStarted} />

        <div className="space-y-4 rounded-xl border border-border/60 bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm font-semibold">
              {getChannelInitials(video.channelName)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{video.title}</h1>
              <p className="text-sm text-muted-foreground">
                {video.channelName} · Published {formatFullDate(video.publishedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {watchedIds.has(video.id) ? (
              <Button variant="outline" onClick={() => removeFromHistory(video.id)}>
                Remove from history
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  markAsWatched({
                    videoId: video.id,
                    title: video.title,
                    channelId: video.channelId,
                    channelName: video.channelName,
                    thumbnailUrl: video.thumbnailUrl,
                  })
                }
              >
                Mark as watched
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
