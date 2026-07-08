"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ChannelWithStats } from "@/types";
import { formatPublishedDate } from "@/utils/date";
import { getChannelInitials } from "@/utils/video";

interface ChannelCardProps {
  channel: ChannelWithStats;
  onSelect?: (channelId: string) => void;
}

export function ChannelCard({ channel, onSelect }: ChannelCardProps) {
  const content = (
    <Card className="group p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm font-semibold text-zinc-100">
          {getChannelInitials(channel.name)}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-lg font-semibold">{channel.name}</h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <Badge variant="outline">{channel.category}</Badge>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {channel.latestTitle ?? "No uploads yet"}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Radio className="h-3 w-3" />
              {channel.videoCount} videos fetched
            </span>
            {channel.latestUpload ? (
              <span>Latest {formatPublishedDate(channel.latestUpload)}</span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );

  if (onSelect) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-left"
        onClick={() => onSelect(channel.id)}
        aria-label={`Filter feed by ${channel.name}`}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Link href={`/channel/${channel.id}`}>{content}</Link>
    </motion.div>
  );
}
