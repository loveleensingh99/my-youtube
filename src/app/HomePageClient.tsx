"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { TagChips } from "@/components/TagChips";
import { ActiveChannelFilter } from "@/components/ActiveChannelFilter";
import { VideoGrid } from "@/components/VideoGrid";
import { ErrorState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import { filterVideos } from "@/utils/video";
import { getChannelName, getChannelTags } from "@/utils/channels";

export function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelParam = searchParams.get("channel");
  const tagParam = searchParams.get("tag");

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
    selectedTag,
    selectTag,
    clearFeedFilters,
  } = useFeedContext();

  const tags = useMemo(() => getChannelTags(channels), [channels]);
  const selectedChannelName = useMemo(
    () => (selectedChannel ? getChannelName(channels, selectedChannel) : null),
    [channels, selectedChannel],
  );

  useEffect(() => {
    if (channelParam) {
      selectChannel(channelParam);
      return;
    }

    if (tagParam) {
      selectTag(tagParam);
    }
  }, [channelParam, tagParam, selectChannel, selectTag]);

  const filteredVideos = useMemo(() => {
    if (!settingsHydrated) return [];
    return filterVideos(videos, filter, settings, watchedIds, selectedChannel);
  }, [videos, filter, settings, watchedIds, selectedChannel, settingsHydrated]);

  const handleSelectTag = useCallback(
    (tag: string | null) => {
      if (tag === null) {
        clearFeedFilters();
        router.push("/");
        return;
      }

      selectTag(tag);
      router.push(`/?tag=${encodeURIComponent(tag)}`);
    },
    [router, selectTag, clearFeedFilters],
  );

  const handleChannelClick = useCallback(
    (channelId: string) => {
      selectChannel(channelId);
      router.push(`/?channel=${channelId}`);
    },
    [router, selectChannel],
  );

  const handleClearChannelFilter = useCallback(() => {
    clearFeedFilters();
    router.push("/");
  }, [clearFeedFilters, router]);

  return (
    <>
      <Header title="Home" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      <TagChips
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        allActive={!selectedChannel && !selectedTag}
      />

      {selectedChannelName ? (
        <ActiveChannelFilter
          channelName={selectedChannelName}
          onClear={handleClearChannelFilter}
        />
      ) : null}

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
            onChannelClick={handleChannelClick}
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
