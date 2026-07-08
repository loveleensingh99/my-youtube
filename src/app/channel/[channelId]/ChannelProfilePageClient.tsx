"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { ChannelProfileHeader } from "@/components/ChannelProfileHeader";
import { VideoGrid } from "@/components/VideoGrid";
import { ChannelProfileHeaderSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/ErrorState";
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
  const {
    channels,
    videos,
    videosByChannel,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
    feedSource,
    settings,
    settingsHydrated,
  } = useFeedContext();
  const [filter, setFilter] = useState<FeedFilter>("all");

  const channel = useMemo(
    () => channels.find((entry) => entry.id === channelId) ?? null,
    [channels, channelId],
  );

  const fallbackFeed = useRSSFeed(channel ? [channel] : [], settings.youtubeApiKey);

  const cachedChannelVideos = useMemo(
    () => videosByChannel.get(channelId) ?? videos.filter((video) => video.channelId === channelId),
    [videosByChannel, channelId, videos],
  );
  const channelVideos = cachedChannelVideos.length > 0 ? cachedChannelVideos : fallbackFeed.videos;

  const filteredVideos = useMemo(() => {
    if (!settingsHydrated) return [];
    return filterVideos(channelVideos, filter, settings, channelId);
  }, [channelVideos, filter, settings, channelId, settingsHydrated]);

  const stats = useMemo(() => {
    const videoCount = channelVideos.filter((video) => video.type === "video").length;
    const shortCount = channelVideos.filter((video) => video.type === "short").length;
    const latestUpload = channelVideos[0]?.publishedAt;

    return { videoCount, shortCount, latestUpload };
  }, [channelVideos]);

  const isInitialLoading = (isLoading || fallbackFeed.isLoading) && channelVideos.length === 0;

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
        onRefresh={() =>
          cachedChannelVideos.length > 0 ? void refresh() : void fallbackFeed.refresh()
        }
        isRefreshing={cachedChannelVideos.length > 0 ? isLoading : fallbackFeed.isLoading}
        feedSource={cachedChannelVideos.length > 0 ? feedSource : fallbackFeed.feedSource}
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
        <VideoGrid
          videos={filteredVideos}
          isLoading={isInitialLoading || !settingsHydrated}
          isLoadingMore={cachedChannelVideos.length > 0 ? isLoadingMore : fallbackFeed.isLoadingMore}
          hasMore={cachedChannelVideos.length > 0 ? hasMore : fallbackFeed.hasMore}
          onLoadMore={() =>
            cachedChannelVideos.length > 0 ? void loadMore() : void fallbackFeed.loadMore()
          }
          feedFilter={filter}
          compactMode={settings.compactMode}
          thumbnailSize={settings.thumbnailSize}
        />
      </main>
    </>
  );
}
