"use server";

import { fetchChannelFeed } from "@/lib/rss";
import { fetchChannelDetails } from "@/lib/youtube-api";
import {
  extractChannelIdFromUrl,
  extractChannelNameFromHtml,
  extractHandleFromUrl,
  isValidChannelId,
  sanitizeChannelName,
} from "@/lib/youtube-url";
import type { Channel } from "@/types";

function getYoutubeApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY?.trim() || null;
}

export async function enrichChannelAvatars(channels: Channel[]): Promise<Channel[]> {
  const apiKey = getYoutubeApiKey();
  if (!apiKey) {
    return channels;
  }

  const missingIds = channels.filter((channel) => !channel.avatarUrl).map((channel) => channel.id);
  if (missingIds.length === 0) {
    return channels;
  }

  try {
    const details = await fetchChannelDetails(missingIds, apiKey);
    return channels.map((channel) => {
      const detail = details[channel.id];
      const apiTitle = detail?.title;
      const shouldUpgradeName =
        Boolean(apiTitle) &&
        (channel.name === channel.id ||
          channel.name.startsWith("UC") ||
          (!channel.name.includes(" ") && apiTitle!.includes(" ")));

      return {
        ...channel,
        name: shouldUpgradeName ? apiTitle! : channel.name,
        avatarUrl: channel.avatarUrl ?? detail?.avatarUrl,
      };
    });
  } catch {
    return channels;
  }
}

async function fetchChannelPage(handle: string): Promise<{ id: string | null; name: string | null }> {
  const response = await fetch(`https://www.youtube.com/@${handle}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return { id: null, name: null };
  }

  const html = await response.text();
  const identifierMatch = html.match(/itemprop="identifier" content="(UC[\w-]{22})"/);

  return {
    id: identifierMatch?.[1] ?? null,
    name: extractChannelNameFromHtml(html),
  };
}

async function getChannelNameFromRss(channelId: string, fallback: string): Promise<string> {
  try {
    const feed = await fetchChannelFeed({
      id: channelId,
      name: fallback,
      category: "General",
    });
    return sanitizeChannelName(feed.title);
  } catch {
    return fallback;
  }
}

function looksLikeHandleOrId(name: string, handle: string | null, channelId: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized === channelId.toLowerCase() ||
    (handle !== null && normalized === handle.toLowerCase()) ||
    normalized.startsWith("uc")
  );
}

export async function resolveChannelInput(
  input: string,
  preferredName?: string,
  category = "General",
): Promise<{ channel: Channel } | { error: string }> {
  const trimmed = input.trim();

  if (!trimmed) {
    return { error: "Enter a YouTube channel link, @handle, or channel ID." };
  }

  if (trimmed.includes("search_query=") || trimmed.includes("/results")) {
    return {
      error: "Search links are not supported. Paste a channel page link like youtube.com/@handle.",
    };
  }

  const handle = extractHandleFromUrl(trimmed);
  let channelId = extractChannelIdFromUrl(trimmed);
  let scrapedName: string | null = null;

  if (!channelId) {
    if (!handle) {
      return { error: "Could not read that link. Use youtube.com/@handle or a UC channel ID." };
    }

    const page = await fetchChannelPage(handle);
    channelId = page.id;
    scrapedName = page.name;

    if (!channelId) {
      return { error: `Could not find channel for @${handle}. Check the link and try again.` };
    }
  }

  if (!isValidChannelId(channelId)) {
    return { error: "Invalid YouTube channel ID." };
  }

  const apiKey = getYoutubeApiKey();
  let apiTitle: string | undefined;
  let avatarUrl: string | undefined;

  if (apiKey) {
    try {
      const details = await fetchChannelDetails([channelId], apiKey);
      apiTitle = details[channelId]?.title;
      avatarUrl = details[channelId]?.avatarUrl;
    } catch {
      apiTitle = undefined;
      avatarUrl = undefined;
    }
  }

  const fallbackName = preferredName?.trim() || scrapedName || handle || channelId;
  let name = preferredName?.trim() || apiTitle || scrapedName || fallbackName;

  if (!preferredName?.trim() && looksLikeHandleOrId(name, handle, channelId)) {
    name = await getChannelNameFromRss(channelId, name);
  } else if (!preferredName?.trim() && !apiTitle && !scrapedName) {
    name = await getChannelNameFromRss(channelId, name);
  }

  return {
    channel: {
      id: channelId,
      name: sanitizeChannelName(name),
      category: category.trim() || "General",
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  };
}
