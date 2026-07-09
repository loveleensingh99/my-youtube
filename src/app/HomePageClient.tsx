"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { FeedToolbar } from "@/components/FeedToolbar";
import { VideoGrid } from "@/components/VideoGrid";
import { HomePageSkeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { filterVideos } from "@/utils/video";
import { getChannelTags } from "@/utils/channels";

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
    feedSource,
    settings,
    settingsHydrated,
    filter,
    setFilter,
    selectedTag,
    selectTag,
    clearTagFilter,
    clearFeedFilters,
  } = useFeedContext();

  const tags = useMemo(() => getChannelTags(channels), [channels]);
  const pullToRefresh = usePullToRefresh({ onRefresh: refresh });

  useEffect(() => {
    if (channelParam) {
      router.replace(`/channel/${channelParam}`);
    }
  }, [channelParam, router]);

  useEffect(() => {
    if (channelParam) {
      return;
    }

    if (tagParam) {
      selectTag(tagParam);
      return;
    }

    clearTagFilter();
  }, [channelParam, tagParam, selectTag, clearTagFilter]);

  const filteredVideos = useMemo(() => {
    if (!settingsHydrated) return [];
    return filterVideos(videos, filter, settings);
  }, [videos, filter, settings, settingsHydrated]);

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

  if (!settingsHydrated) {
    return <HomePageSkeleton shortsOnly={filter === "shorts"} />;
  }

  return (
    <div onTouchStart={pullToRefresh.onTouchStart} onTouchEnd={pullToRefresh.onTouchEnd}>
      <Header
        title="Home"
        onRefresh={() => void refresh()}
        isRefreshing={isLoading}
        feedSource={feedSource}
      />

      <FeedToolbar
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        allActive={!selectedTag}
        filter={filter}
        onFilterChange={setFilter}
      />

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
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={() => void loadMore()}
            feedFilter={filter}
            compactMode={settings.compactMode}
            thumbnailSize={settings.thumbnailSize}
          />
        )}
      </main>
    </div>
  );
}
