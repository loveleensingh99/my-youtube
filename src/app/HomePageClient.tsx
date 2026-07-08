"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { TagChips } from "@/components/TagChips";
import { VideoGrid } from "@/components/VideoGrid";
import { ErrorState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
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
    settings,
    settingsHydrated,
    filter,
    setFilter,
    selectedTag,
    selectTag,
    clearFeedFilters,
  } = useFeedContext();

  const tags = useMemo(() => getChannelTags(channels), [channels]);

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
    }
  }, [channelParam, tagParam, selectTag]);

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

  return (
    <>
      <Header title="Home" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      <TagChips
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        allActive={!selectedTag}
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
            feedFilter={filter}
          />
        )}
      </main>
    </>
  );
}
