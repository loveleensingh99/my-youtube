"use server";

import { readChannelsFile, writeChannelsFile } from "@/lib/channels-file";
import { defaultChannels } from "@/data/channels";
import { fetchChannelFeed } from "@/lib/rss";
import { normalizeChannels } from "@/lib/storage";
import {
  extractChannelIdFromUrl,
  extractHandleFromUrl,
  isValidChannelId,
  sanitizeChannelName,
} from "@/lib/youtube-url";
import type { Channel } from "@/types";

function channelIds(channels: Channel[]): string[] {
  return channels.map((channel) => channel.id).sort();
}

function sameChannelIds(a: Channel[], b: Channel[]): boolean {
  const aIds = channelIds(a);
  const bIds = channelIds(b);
  return aIds.length === bIds.length && aIds.every((id, index) => id === bIds[index]);
}

function isDefaultChannelList(channels: Channel[]): boolean {
  return sameChannelIds(channels, defaultChannels);
}

export async function getStoredChannels(): Promise<Channel[]> {
  return readChannelsFile();
}

export async function persistChannels(
  channels: Channel[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const normalized = normalizeChannels(channels, []);
    await writeChannelsFile(normalized);
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "Could not save channels to data/channels.json. If you deploy on Vercel, use a VPS or edit the file in your repo instead.",
    };
  }
}

export async function syncChannelsWithFile(
  localChannels: Channel[],
): Promise<{ channels: Channel[]; persisted: boolean; error?: string }> {
  const fileChannels = await readChannelsFile();

  if (isDefaultChannelList(fileChannels) && !isDefaultChannelList(localChannels)) {
    const result = await persistChannels(localChannels);
    if (!result.ok) {
      return { channels: localChannels, persisted: false, error: result.error };
    }
    return { channels: localChannels, persisted: true };
  }

  if (!sameChannelIds(fileChannels, localChannels)) {
    return { channels: fileChannels, persisted: false };
  }

  return { channels: fileChannels, persisted: false };
}

async function fetchChannelIdFromHandle(handle: string): Promise<string | null> {
  const response = await fetch(`https://www.youtube.com/@${handle}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const identifierMatch = html.match(/itemprop="identifier" content="(UC[\w-]{22})"/);
  return identifierMatch?.[1] ?? null;
}

async function getChannelName(channelId: string, fallback: string): Promise<string> {
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

  let channelId = extractChannelIdFromUrl(trimmed);

  if (!channelId) {
    const handle = extractHandleFromUrl(trimmed);
    if (!handle) {
      return { error: "Could not read that link. Use youtube.com/@handle or a UC channel ID." };
    }

    channelId = await fetchChannelIdFromHandle(handle);
    if (!channelId) {
      return { error: `Could not find channel for @${handle}. Check the link and try again.` };
    }
  }

  if (!isValidChannelId(channelId)) {
    return { error: "Invalid YouTube channel ID." };
  }

  const fallbackName = preferredName?.trim() || extractHandleFromUrl(trimmed) || channelId;
  const name = preferredName?.trim() || (await getChannelName(channelId, fallbackName));

  return {
    channel: {
      id: channelId,
      name,
      category: category.trim() || "General",
    },
  };
}
