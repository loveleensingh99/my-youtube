import { head, put } from "@vercel/blob";
import { readChannelsFile, writeChannelsFile } from "@/lib/channels-file";
import { defaultChannels } from "@/data/channels";
import { normalizeChannels } from "@/lib/storage";
import type { Channel } from "@/types";

const CHANNELS_BLOB_PATH = "focustube/channels.json";

export type ChannelsStorageMode = "file" | "blob" | "browser";

export function getChannelsStorageMode(): ChannelsStorageMode {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return "blob";
  }

  if (process.env.VERCEL === "1") {
    return "browser";
  }

  return "file";
}

function serializeChannels(channels: Channel[]): string {
  const normalized = normalizeChannels(channels, []);
  const payload = normalized.map((channel) => ({
    id: channel.id,
    name: channel.name,
    category: channel.category,
    url: `https://www.youtube.com/channel/${channel.id}`,
  }));

  return `${JSON.stringify(payload, null, 2)}\n`;
}

async function readChannelsBlob(): Promise<Channel[]> {
  try {
    const metadata = await head(CHANNELS_BLOB_PATH);
    const response = await fetch(metadata.url, { cache: "no-store" });

    if (!response.ok) {
      return defaultChannels;
    }

    const parsed = JSON.parse(await response.text()) as unknown;
    return normalizeChannels(parsed, defaultChannels);
  } catch {
    return defaultChannels;
  }
}

async function writeChannelsBlob(channels: Channel[]): Promise<void> {
  await put(CHANNELS_BLOB_PATH, serializeChannels(channels), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readStoredChannels(): Promise<Channel[]> {
  const mode = getChannelsStorageMode();

  if (mode === "blob") {
    return readChannelsBlob();
  }

  return readChannelsFile();
}

export async function writeStoredChannels(
  channels: Channel[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const mode = getChannelsStorageMode();

  if (mode === "browser") {
    return { ok: true };
  }

  try {
    if (mode === "blob") {
      await writeChannelsBlob(channels);
    } else {
      await writeChannelsFile(channels);
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Could not save channels on the server.",
    };
  }
}

export function getChannelsStorageDescription(mode: ChannelsStorageMode): string {
  switch (mode) {
    case "blob":
      return "Channels are saved to Vercel Blob storage and sync across devices.";
    case "file":
      return "Channels are saved to data/channels.json on the server.";
    case "browser":
      return "On Vercel, channels are saved in this browser only. Add a Vercel Blob store to sync across devices.";
  }
}
