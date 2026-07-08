"use client";

import { cn } from "@/lib/utils";
import type { Channel } from "@/types";

interface ChannelChipsProps {
  channels: Channel[];
  selectedChannel: string | null;
  onSelectChannel: (channelId: string | null) => void;
}

export function ChannelChips({
  channels,
  selectedChannel,
  onSelectChannel,
}: ChannelChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelectChannel(null)}
        className={cn(
          "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          !selectedChannel
            ? "bg-foreground text-background"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        All
      </button>
      {channels.map((channel) => (
        <button
          key={channel.id}
          type="button"
          onClick={() => onSelectChannel(channel.id)}
          className={cn(
            "max-w-[10rem] shrink-0 truncate rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            selectedChannel === channel.id
              ? "bg-foreground text-background"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {channel.name}
        </button>
      ))}
    </div>
  );
}
