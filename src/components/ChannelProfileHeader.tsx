"use client";

import { Badge } from "@/components/ui/badge";
import type { Channel } from "@/types";
import { formatPublishedDate } from "@/utils/date";
import { getChannelInitials } from "@/utils/video";

interface ChannelProfileHeaderProps {
  channel: Channel;
  videoCount: number;
  shortCount: number;
  latestUpload?: string;
}

export function ChannelProfileHeader({
  channel,
  videoCount,
  shortCount,
  latestUpload,
}: ChannelProfileHeaderProps) {
  const channelUrl = `https://www.youtube.com/channel/${channel.id}`;

  return (
    <section className="border-b border-border px-4 py-6">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl font-semibold text-foreground">
          {getChannelInitials(channel.name)}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="truncate text-xl font-semibold">{channel.name}</h1>
          <Badge variant="outline">{channel.category}</Badge>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{videoCount} videos</span>
            <span>{shortCount} shorts</span>
            {latestUpload ? <span>Latest {formatPublishedDate(latestUpload)}</span> : null}
          </div>
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-sky-400 hover:text-sky-300"
          >
            Open on YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
