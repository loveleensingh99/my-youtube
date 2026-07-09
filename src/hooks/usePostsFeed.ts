"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchCommunityPosts } from "@/app/actions/posts";
import type { CommunityPost, PostsChannel } from "@/types";

const POSTS_FETCH_TIMEOUT_MS = 45000;

export function usePostsFeed(postsChannels: PostsChannel[]) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const channelsRef = useRef(postsChannels);
  const requestIdRef = useRef(0);
  const channelsKey = useMemo(
    () => postsChannels.map((channel) => channel.id).join("|"),
    [postsChannels],
  );

  useEffect(() => {
    channelsRef.current = postsChannels;
  }, [channelsKey, postsChannels]);

  const fetchPosts = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const activeChannels = channelsRef.current;

    if (activeChannels.length === 0) {
      setPosts([]);
      setErrors([]);
      setError(null);
      return true;
    }

    try {
      const result = await Promise.race([
        fetchCommunityPosts(activeChannels),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("Posts request timed out")), POSTS_FETCH_TIMEOUT_MS);
        }),
      ]);

      if (requestIdRef.current !== requestId) return false;

      setPosts(result.posts);
      setErrors(result.errors);

      if (result.posts.length === 0 && result.errors.length > 0) {
        setError(result.errors[0] ?? "Unable to load posts. Check your internet connection.");
      } else {
        setError(null);
        setLastUpdated(new Date().toISOString());
      }

      return true;
    } catch (fetchError) {
      if (requestIdRef.current !== requestId) return false;

      const message =
        fetchError instanceof Error && fetchError.message === "Posts request timed out"
          ? "Posts request timed out. Pull down to refresh and try again."
          : "Unable to load posts. Check your internet connection.";

      setError(message);
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchPosts();
    setIsLoading(false);
  }, [fetchPosts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [channelsKey, refresh]);

  return {
    posts,
    isLoading,
    error,
    errors,
    lastUpdated,
    refresh,
  };
}
