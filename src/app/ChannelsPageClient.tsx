"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ChannelCard } from "@/components/ChannelCard";
import { ChannelManager } from "@/components/ChannelManager";
import { ChannelCardSkeleton, ChannelsPageSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/ErrorState";
import { useFeedContext } from "@/components/FeedProvider";
import type { ChannelWithStats } from "@/types";

export function ChannelsPageClient() {
  const router = useRouter();
  const { channels, videosByChannel, isLoading, refresh, settingsHydrated } = useFeedContext();

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

  if (!settingsHydrated) {
    return <ChannelsPageSkeleton />;
  }

  return (
    <>
      <Header title="Subscriptions" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      <main className="space-y-6 px-4 py-4">
        {channels.length === 0 ? (
          <EmptyState
            title="No channels yet"
            description="Add a YouTube channel below to start building your feed."
          />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: Math.min(channels.length, 4) }).map((_, index) => (
              <ChannelCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {channelsWithStats.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onSelect={(channelId) => {
                  router.push(`/channel/${channelId}`);
                }}
              />
            ))}
          </div>
        )}

        <ChannelManager />
      </main>
    </>
  );
}
