import { STORAGE_KEYS } from "@/constants/app";

export function getLocalChannelsUpdatedAt(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const value = window.localStorage.getItem(STORAGE_KEYS.channelsUpdatedAt);
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function touchLocalChannelsUpdatedAt(at = Date.now()): number {
  if (typeof window === "undefined") {
    return at;
  }

  window.localStorage.setItem(STORAGE_KEYS.channelsUpdatedAt, String(at));
  return at;
}

export function channelIdsKey(channelIds: string[]): string {
  return [...channelIds].sort().join("|");
}

export function hasDeletedChannelsLocally(
  localIds: Set<string>,
  remoteIds: Set<string>,
): boolean {
  return [...remoteIds].some((id) => !localIds.has(id));
}
