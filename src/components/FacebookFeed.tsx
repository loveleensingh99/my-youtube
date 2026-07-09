"use client";

import { useCallback, useEffect, useRef } from "react";
import { FacebookPostCard } from "@/components/FacebookPostCard";
import { EmptyState, ErrorState } from "@/components/ErrorState";
import {
  FacebookFeedSkeleton,
  FacebookLoadMoreSkeleton,
} from "@/components/Skeleton";
import { useFacebookPosts } from "@/hooks/useFacebookPosts";

export function FacebookFeed() {
  const {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    isConfigured,
    loadMore,
    refresh,
  } = useFacebookPosts();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) {
      return;
    }
    loadMore();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "480px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [handleLoadMore, hasMore, posts.length]);

  if (!isConfigured) {
    return (
      <ErrorState
        title="Firebase not configured"
        description="Add your NEXT_PUBLIC_FIREBASE_* environment variables to load Facebook posts."
      />
    );
  }

  if (isLoading) {
    return <FacebookFeedSkeleton />;
  }

  if (error && posts.length === 0) {
    return <ErrorState description={error} onRetry={refresh} />;
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No Facebook posts yet"
        description="Posts appear after you log in once and run the scraper. In a terminal: npm run facebook:login → add FACEBOOK_AUTH_PATH to .env.local → npm run scrape:facebook"
        actionLabel="Refresh"
        onAction={refresh}
      />
    );
  }

  return (
    <>
      {error ? (
        <div className="border-b border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      <div className="divide-y divide-border">
        {posts.map((post) => (
          <FacebookPostCard key={post.postId} post={post} />
        ))}
      </div>

      {isLoadingMore ? <FacebookLoadMoreSkeleton /> : null}

      {hasMore ? <div ref={sentinelRef} className="h-4" aria-hidden /> : null}
    </>
  );
}
