import type { Channel, PostsChannel } from "@/types";

export function channelIdsKey(channelIds: string[]): string {
  return [...channelIds].sort().join("|");
}

export function channelsContentKey(channels: Channel[]): string {
  return [...channels]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(
      (channel) =>
        `${channel.id}:${channel.name}:${channel.category}:${channel.avatarUrl ?? ""}`,
    )
    .join("|");
}

export function postsChannelsContentKey(channels: PostsChannel[]): string {
  return [...channels]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(
      (channel) =>
        `${channel.id}:${channel.name}:${channel.category}:${channel.handle ?? ""}:${channel.avatarUrl ?? ""}`,
    )
    .join("|");
}
