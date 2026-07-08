"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { ChannelProfileHeader } from "@/components/ChannelProfileHeader";
import { VideoGrid } from "@/components/VideoGrid";
import { ChannelProfileHeaderSkeleton } from "@/components/Skeleton";
import { EmptyState, ErrorState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import { useRSSFeed } from "@/hooks/useRSSFeed";
import { filterVideos } from "@/utils/video";
import type { FeedFilter } from "@/types";

const profileFilters: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "videos", label: "Videos" },
  { value: "shorts", label: "Shorts" },
];

interface ChannelProfilePageClientProps {
  channelId: string;
}

export function ChannelProfilePageClient({ channelId }: ChannelProfilePageClientProps) {
  const router = useRouter();
  const { channels, settings, settingsHydrated } = useFeedContext();
  const [filter, setFilter] = useState<FeedFilter>("all");

  const channel = useMemo(
    () => channels.find((entry) => entry.id === channelId) ?? null,
    [channels, channelId],
  );

  const channelList = useMemo(() => (channel ? [channel] : []), [channel]);
  const feed = useRSSFeed(channelList, settings.youtubeApiKey);

  const filteredVideos = useMemo(() => {
    if (!settingsHydrated) return [];
    return filterVideos(feed.videos, filter, settings, channelId);
  }, [feed.videos, filter, settings, channelId, settingsHydrated]);

  const stats = useMemo(() => {
    const videoCount = feed.videos.filter((video) => video.type === "video").length;
    const shortCount = feed.videos.filter((video) => video.type === "short").length;
    const latestUpload = feed.videos[0]?.publishedAt;

    return { videoCount, shortCount, latestUpload };
  }, [feed.videos]);

  const isInitialLoading = feed.isLoading && feed.videos.length === 0;

  if (!channel) {
    return (
      <>
        <Header title="Channel" onBack={() => router.back()} />
        <div className="px-4 py-8">
          <EmptyState
            title="Channel not found"
            description="This channel is not in your subscriptions list."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={channel.name}
        onBack={() => router.back()}
        onRefresh={() => void feed.refresh()}
        isRefreshing={feed.isLoading}
      />

      {isInitialLoading ? (
        <ChannelProfileHeaderSkeleton />
      ) : (
        <ChannelProfileHeader
          channel={channel}
          videoCount={stats.videoCount}
          shortCount={stats.shortCount}
          latestUpload={stats.latestUpload}
        />
      )}

      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        items={profileFilters}
        className="pt-3"
      />

      <main className="flex-1">
        {feed.error ? (
          <div className="px-4 py-8">
            <ErrorState
              title="Could not load channel"
              description={feed.error}
              onRetry={() => void feed.refresh()}
            />
          </div>
        ) : (
          <VideoGrid
            videos={filteredVideos}
            isLoading={feed.isLoading || !settingsHydrated}
            isLoadingMore={feed.isLoadingMore}
            hasMore={feed.hasMore}
            onLoadMore={() => void feed.loadMore()}
            feedFilter={filter}
          />
        )}
      </main>
    </>
  );
}
