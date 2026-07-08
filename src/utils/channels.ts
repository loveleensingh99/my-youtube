import type { Channel } from "@/types";

const HIDDEN_TAGS = new Set(["general"]);

export function getChannelTags(channels: Channel[]): string[] {
  const tags = new Set<string>();

  for (const channel of channels) {
    const tag = channel.category.trim();
    if (!tag || HIDDEN_TAGS.has(tag.toLowerCase())) {
      continue;
    }

    tags.add(tag);
  }

  return [...tags].sort((a, b) => a.localeCompare(b));
}

export function getChannelName(channels: Channel[], channelId: string): string | null {
  return channels.find((channel) => channel.id === channelId)?.name ?? null;
}
