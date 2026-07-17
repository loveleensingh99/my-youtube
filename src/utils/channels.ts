import type { Channel } from "@/types";

const HIDDEN_TAGS = new Set(["general"]);

export function getChannelTags(channels: Array<Pick<Channel, "category">>): string[] {
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

export function renameChannelTag<T extends { category: string }>(
  items: T[],
  oldTag: string,
  newTag: string,
): T[] {
  const from = oldTag.trim();
  const to = newTag.trim() || "General";

  if (!from || from === to) {
    return items;
  }

  return items.map((item) =>
    item.category.trim() === from ? { ...item, category: to } : item,
  );
}

export function getChannelName(channels: Channel[], channelId: string): string | null {
  return channels.find((channel) => channel.id === channelId)?.name ?? null;
}
