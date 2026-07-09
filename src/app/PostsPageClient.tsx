"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { EmptyState, ErrorState } from "@/components/ErrorState";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/Skeleton";
import { TagChips } from "@/components/TagChips";
import { usePostsChannels } from "@/hooks/usePostsChannels";
import { usePostsFeed } from "@/hooks/usePostsFeed";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { getChannelTags } from "@/utils/channels";

export function PostsPageClient() {
  const router = useRouter();
  const { postsChannels } = usePostsChannels();
  const { posts, isLoading, error, errors, refresh } = usePostsFeed(postsChannels);
  const pullToRefresh = usePullToRefresh({ onRefresh: refresh });
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tags = useMemo(() => getChannelTags(postsChannels), [postsChannels]);

  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;

    const channelIdsInTag = new Set(
      postsChannels
        .filter((channel) => channel.category === selectedTag)
        .map((channel) => channel.id),
    );

    return posts.filter((post) => channelIdsInTag.has(post.channelId));
  }, [posts, postsChannels, selectedTag]);

  return (
    <div onTouchStart={pullToRefresh.onTouchStart} onTouchEnd={pullToRefresh.onTouchEnd}>
      <Header title="Posts" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      {postsChannels.length > 0 && tags.length > 0 ? (
        <section className="border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-md">
          <TagChips tags={tags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
        </section>
      ) : null}

      <main className="space-y-6 px-0 py-0">
        {postsChannels.length === 0 ? (
          <div className="px-4 py-4">
            <EmptyState
              title="No posts channels yet"
              description="Add channels from your Profile to follow community posts, like youtube.com/@handle/posts."
              actionLabel="Go to Profile"
              onAction={() => router.push("/settings")}
            />
          </div>
        ) : error && posts.length === 0 ? (
          <div className="px-4 py-4">
            <ErrorState description={error} onRetry={() => void refresh()} />
          </div>
        ) : (
          <>
            {errors.length > 0 ? (
              <div className="mx-4 mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                {errors.join(" ")}
              </div>
            ) : null}

            {isLoading && posts.length === 0 ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 3 }).map((_, index) => (
                  <PostCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="px-4 py-4">
                <EmptyState
                  title="No posts found"
                  description={
                    selectedTag
                      ? `No recent posts from channels tagged "${selectedTag}".`
                      : "These channels may not have published community posts recently."
                  }
                  actionLabel={selectedTag ? "Show all posts" : "Refresh"}
                  onAction={selectedTag ? () => setSelectedTag(null) : () => void refresh()}
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
