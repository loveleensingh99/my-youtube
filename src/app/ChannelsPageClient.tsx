"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ChannelCard } from "@/components/ChannelCard";
import { ChannelManager } from "@/components/ChannelManager";
import { ChannelCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import type { ChannelWithStats } from "@/types";

export function ChannelsPageClient() {
  const router = useRouter();
  const { channels, videosByChannel, isLoading, refresh, lastUpdatedLabel } = useFeedContext();

  const channelsWithStats = useMemo<ChannelWithStats[]>(() => {
    return channels.map((channel) => {
      const channelVideos = videosByChannel.get(channel.id) ?? [];
      const latest = channelVideos[0];

      return {
        ...channel,
        videoCount: channelVideos.length,
        latestUpload: latest?.publishedAt,
        latestTitle: latest?.title,
      };
    });
  }, [channels, videosByChannel]);

  return (
    <>
      <Header
        title="Channels"
        onRefresh={() => void refresh()}
        isRefreshing={isLoading}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <ChannelManager />

        <div>
          <h2 className="text-lg font-semibold tracking-tight">Selected channels</h2>
          <p className="text-sm text-muted-foreground">
            Only content from these creators appears in your feed.
          </p>
        </div>

        {channels.length === 0 ? (
          <EmptyState
            title="No channels yet"
            description="Add a YouTube channel above to start building your distraction-free feed."
          />
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: Math.min(channels.length, 4) }).map((_, index) => (
              <ChannelCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {channelsWithStats.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onSelect={(channelId) => {
                  router.push(`/?channel=${channelId}`);
                }}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
