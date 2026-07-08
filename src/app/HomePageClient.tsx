"use client";

import { useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { VideoGrid } from "@/components/VideoGrid";
import { HistorySection } from "@/components/HistorySection";
import { ErrorState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import { RSS_MAX_VIDEOS_PER_CHANNEL } from "@/constants/app";
import { filterVideos } from "@/utils/video";

export function HomePageClient() {
  const searchParams = useSearchParams();
  const channelParam = searchParams.get("channel");

  const {
    videos,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    refresh,
    lastUpdatedLabel,
    settings,
    settingsHydrated,
    watchedIds,
    markAsWatched,
    removeFromHistory,
    continueWatching,
    recentlyWatched,
    filter,
    setFilter,
    selectedChannel,
    selectChannel,
    feedSource,
  } = useFeedContext();

  useEffect(() => {
    if (channelParam) {
      selectChannel(channelParam);
    }
  }, [channelParam, selectChannel]);

  const filteredVideos = useMemo(() => {
    if (!settingsHydrated) return [];
    return filterVideos(videos, filter, settings, watchedIds, selectedChannel);
  }, [videos, filter, settings, watchedIds, selectedChannel, settingsHydrated]);

  const firstVideoId = filteredVideos[0]?.id ?? "none";
  const feedKey = useMemo(
    () => `${filter}:${selectedChannel ?? "all"}:${filteredVideos.length}:${firstVideoId}`,
    [filter, selectedChannel, filteredVideos.length, firstVideoId],
  );

  return (
    <>
      <Header
        title="Home"
        filter={filter}
        onRefresh={() => void refresh()}
        isRefreshing={isLoading}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <FilterBar filter={filter} onFilterChange={setFilter} />

        {error ? (
          <ErrorState
            title="Feed unavailable"
            description={error}
            onRetry={() => void refresh()}
            offline
          />
        ) : (
          <>
            <HistorySection
              title="Continue Watching"
              items={continueWatching}
              onRemove={removeFromHistory}
            />

            <section className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">Your Feed</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedChannel
                        ? `Showing ${filteredVideos.length} video${filteredVideos.length === 1 ? "" : "s"} from this channel.`
                        : "Newest uploads from channels you chose. No recommendations."}
                    </p>
                  </div>
                  {!isLoading && filteredVideos.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {filteredVideos.length} visible
                    </p>
                  ) : null}
                </div>
                {feedSource !== "api" ? (
                  <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                    Add your YouTube Data API key to <code>.env.local</code> (recommended) or
                    Settings to browse full channel catalogs. Without it, RSS only provides the
                    latest {RSS_MAX_VIDEOS_PER_CHANNEL} uploads per channel.
                  </p>
                ) : (
                  <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
                    Videos load in batches as you scroll
                    {selectedChannel ? " for this channel" : ""}. Older uploads appear when you
                    reach the bottom of the feed.
                  </p>
                )}
              </div>
              <VideoGrid
                key={feedKey}
                videos={filteredVideos}
                isLoading={isLoading || !settingsHydrated}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore && feedSource === "api"}
                onLoadMore={() => void loadMore()}
                compact={settings.compactMode}
                thumbnailSize={settings.thumbnailSize}
                watchedIds={watchedIds}
                onMarkWatched={(video) =>
                  markAsWatched({
                    videoId: video.id,
                    title: video.title,
                    channelId: video.channelId,
                    channelName: video.channelName,
                    thumbnailUrl: video.thumbnailUrl,
                  })
                }
              />
            </section>

            <HistorySection
              title="Recently Watched"
              items={recentlyWatched}
              onRemove={removeFromHistory}
            />
          </>
        )}
      </main>
    </>
  );
}
