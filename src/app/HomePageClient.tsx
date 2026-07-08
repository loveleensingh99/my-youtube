"use client";

import { useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { channels } from "@/data/channels";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { VideoGrid } from "@/components/VideoGrid";
import { HistorySection } from "@/components/HistorySection";
import { ErrorState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import { filterVideos } from "@/utils/video";

export function HomePageClient() {
  const searchParams = useSearchParams();
  const channelParam = searchParams.get("channel");

  const {
    videos,
    isLoading,
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
    clearChannelFilter,
  } = useFeedContext();

  useEffect(() => {
    if (channelParam) {
      selectChannel(channelParam);
    }
  }, [channelParam, selectChannel]);

  const selectedChannelName = useMemo(() => {
    if (!selectedChannel) return null;
    return channels.find((channel) => channel.id === selectedChannel)?.name ?? null;
  }, [selectedChannel]);

  const filteredVideos = useMemo(() => {
    if (!settingsHydrated) return [];
    return filterVideos(videos, filter, settings, watchedIds, selectedChannel);
  }, [videos, filter, settings, watchedIds, selectedChannel, settingsHydrated]);

  const feedKey = useMemo(
    () => `${filter}:${selectedChannel ?? "all"}:${filteredVideos.map((video) => video.id).join("|")}`,
    [filter, selectedChannel, filteredVideos],
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
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          selectedChannelName={selectedChannelName}
          onClearChannel={clearChannelFilter}
        />

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
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Your Feed</h2>
                <p className="text-sm text-muted-foreground">
                  Newest uploads from channels you chose. No recommendations.
                </p>
              </div>
              <VideoGrid
                key={feedKey}
                videos={filteredVideos}
                isLoading={isLoading || !settingsHydrated}
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
