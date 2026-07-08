"use client";

import { useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { ChannelChips } from "@/components/ChannelChips";
import { VideoGrid } from "@/components/VideoGrid";
import { ErrorState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import { filterVideos } from "@/utils/video";

export function HomePageClient() {
  const searchParams = useSearchParams();
  const channelParam = searchParams.get("channel");

  const {
    channels,
    videos,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    refresh,
    settings,
    settingsHydrated,
    watchedIds,
    markAsWatched,
    filter,
    setFilter,
    selectedChannel,
    selectChannel,
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

  return (
    <>
      <Header title="Home" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      <ChannelChips
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={selectChannel}
      />

      <FilterBar filter={filter} onFilterChange={setFilter} />

      <main className="flex-1">
        {error ? (
          <div className="px-4 py-8">
            <ErrorState
              title="Feed unavailable"
              description={error}
              onRetry={() => void refresh()}
              offline
            />
          </div>
        ) : (
          <VideoGrid
            videos={filteredVideos}
            isLoading={isLoading || !settingsHydrated}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={() => void loadMore()}
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
        )}
      </main>
    </>
  );
}
