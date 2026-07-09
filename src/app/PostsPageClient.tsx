"use client";

import { Header } from "@/components/Header";
import { EmptyState, ErrorState } from "@/components/ErrorState";
import { PostCard } from "@/components/PostCard";
import { PostsChannelManager } from "@/components/PostsChannelManager";
import { PostCardSkeleton } from "@/components/Skeleton";
import { usePostsChannels } from "@/hooks/usePostsChannels";
import { usePostsFeed } from "@/hooks/usePostsFeed";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

export function PostsPageClient() {
  const { postsChannels } = usePostsChannels();
  const { posts, isLoading, error, errors, refresh } = usePostsFeed(postsChannels);
  const pullToRefresh = usePullToRefresh({ onRefresh: refresh });

  return (
    <div onTouchStart={pullToRefresh.onTouchStart} onTouchEnd={pullToRefresh.onTouchEnd}>
      <Header title="Posts" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      <main className="space-y-6 px-0 py-0">
        {postsChannels.length === 0 ? (
          <div className="space-y-6 px-4 py-4">
            <EmptyState
              title="No posts channels yet"
              description="Add YouTube channels whose community posts you want to follow, like youtube.com/@chdlife/posts."
            />
            <PostsChannelManager onChanged={() => void refresh()} />
          </div>
        ) : error && posts.length === 0 ? (
          <div className="space-y-6 px-4 py-4">
            <ErrorState description={error} onRetry={() => void refresh()} />
            <PostsChannelManager onChanged={() => void refresh()} />
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
            ) : posts.length === 0 ? (
              <div className="px-4 py-4">
                <EmptyState
                  title="No posts found"
                  description="These channels may not have published community posts recently."
                  actionLabel="Refresh"
                  onAction={() => void refresh()}
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            <div className="px-4 pb-4">
              <PostsChannelManager onChanged={() => void refresh()} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
