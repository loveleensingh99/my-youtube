import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { defaultChannels } from "@/data/channels";
import { normalizeChannels } from "@/lib/storage";
import type { Channel } from "@/types";

const CHANNELS_FILE = path.join(process.cwd(), "data", "channels.json");

export async function readChannelsFile(): Promise<Channel[]> {
  try {
    const raw = await readFile(CHANNELS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return normalizeChannels(parsed, defaultChannels);
  } catch {
    if (process.env.VERCEL !== "1") {
      try {
        await writeChannelsFile(defaultChannels);
      } catch {
        // Ignore write failures (e.g. read-only filesystem).
      }
    }

    return defaultChannels;
  }
}

export async function writeChannelsFile(channels: Channel[]): Promise<void> {
  const normalized = normalizeChannels(channels, []);
  const payload = normalized.map((channel) => ({
    id: channel.id,
    name: channel.name,
    category: channel.category,
    url: `https://www.youtube.com/channel/${channel.id}`,
  }));

  await mkdir(path.dirname(CHANNELS_FILE), { recursive: true });
  await writeFile(CHANNELS_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}
