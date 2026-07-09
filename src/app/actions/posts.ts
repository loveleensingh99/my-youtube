"use server";

import {
  buildPostsPageUrl,
  extractChannelInfo,
  extractCommunityPosts,
  fetchPostsPageData,
} from "@/lib/youtube-posts";
import { extractChannelIdFromUrl, extractHandleFromUrl, isValidChannelId } from "@/lib/youtube-url";
import type { CommunityPost, PostsChannel } from "@/types";

const POSTS_REVALIDATE_SECONDS = 300;

function buildCandidateUrl(input: string): { url: string } | { error: string } {
  const trimmed = input.trim();

  if (!trimmed) {
    return { error: "Enter a YouTube channel link, @handle, or channel ID." };
  }

  if (trimmed.includes("search_query=") || trimmed.includes("/results")) {
    return {
      error: "Search links are not supported. Paste a channel page link like youtube.com/@handle.",
    };
  }

  const channelId = extractChannelIdFromUrl(trimmed);
  if (channelId && isValidChannelId(channelId)) {
    return { url: `https://www.youtube.com/channel/${channelId}/posts` };
  }

  const handle = extractHandleFromUrl(trimmed);
  if (handle) {
    return { url: `https://www.youtube.com/@${handle}/posts` };
  }

  return { error: "Could not read that link. Use youtube.com/@handle or a UC channel ID." };
}

export async function resolvePostsChannelInput(
  input: string,
  preferredName?: string,
  preferredTag?: string,
): Promise<{ channel: PostsChannel } | { error: string }> {
  const candidate = buildCandidateUrl(input);
  if ("error" in candidate) {
    return candidate;
  }

  let data: Awaited<ReturnType<typeof fetchPostsPageData>> = null;
  try {
    data = await fetchPostsPageData(candidate.url, 86400);
  } catch {
    data = null;
  }

  if (!data) {
    return { error: "Could not load that channel's posts page. Check the link and try again." };
  }

  const info = extractChannelInfo(data);
  if (!info) {
    return { error: "Could not find channel details on that page. Check the link and try again." };
  }

  return {
    channel: {
      ...info,
      name: preferredName?.trim() || info.name,
      category: preferredTag?.trim() || "General",
    },
  };
}

export interface PostsBatchResult {
  posts: CommunityPost[];
  errors: string[];
}

export async function fetchCommunityPosts(channels: PostsChannel[]): Promise<PostsBatchResult> {
  const results = await Promise.allSettled(
    channels.map(async (channel) => {
      const data = await fetchPostsPageData(buildPostsPageUrl(channel), POSTS_REVALIDATE_SECONDS);
      if (!data) {
        throw new Error(`Could not load posts for ${channel.name}.`);
      }
      return extractCommunityPosts(data, channel);
    }),
  );

  const posts: CommunityPost[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      posts.push(...result.value);
    } else {
      const channelName = channels[index]?.name ?? "channel";
      errors.push(
        result.reason instanceof Error
          ? result.reason.message
          : `Could not load posts for ${channelName}.`,
      );
    }
  });

  posts.sort(
    (a, b) =>
      new Date(b.publishedAtEstimate).getTime() - new Date(a.publishedAtEstimate).getTime(),
  );

  return { posts, errors };
}
