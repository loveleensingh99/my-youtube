"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FACEBOOK_POSTS_PAGE_SIZE } from "@/constants/app";
import { fetchFacebookPostsAction } from "@/app/actions/facebook-posts";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { FacebookPost } from "@/types/facebook";

interface UseFacebookPostsResult {
  posts: FacebookPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  isConfigured: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useFacebookPosts(): UseFacebookPostsResult {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);
  const isConfigured = isFirebaseConfigured();

  const loadInitial = useCallback(async () => {
    if (!isConfigured) {
      setPosts([]);
      setHasMore(false);
      setError("Firebase is not configured.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    cursorRef.current = null;

    try {
      const page = await fetchFacebookPostsAction(null, FACEBOOK_POSTS_PAGE_SIZE);
      cursorRef.current = page.lastDocId;
      setPosts(page.posts);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Facebook posts");
      setPosts([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const loadMore = useCallback(async () => {
    if (!isConfigured || isLoading || isLoadingMore || !hasMore || !cursorRef.current) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const page = await fetchFacebookPostsAction(cursorRef.current, FACEBOOK_POSTS_PAGE_SIZE);
      cursorRef.current = page.lastDocId;
      setPosts((current) => {
        const seen = new Set(current.map((post) => post.postId));
        const merged = [...current];
        for (const post of page.posts) {
          if (!seen.has(post.postId)) {
            merged.push(post);
          }
        }
        return merged;
      });
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more Facebook posts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isConfigured, isLoading, isLoadingMore]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    isConfigured,
    loadMore,
    refresh: loadInitial,
  };
}
