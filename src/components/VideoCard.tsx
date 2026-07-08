"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ThumbnailSize, Video } from "@/types";
import { formatDuration, formatPublishedDate, isNewVideo } from "@/utils/date";
import { getChannelInitials } from "@/utils/video";

interface VideoCardProps {
  video: Video;
  compact?: boolean;
  thumbnailSize?: ThumbnailSize;
  isWatched?: boolean;
  onMarkWatched?: (video: Video) => void;
}

const thumbnailSizes: Record<ThumbnailSize, string> = {
  small: "max-w-sm",
  medium: "w-full",
  large: "w-full",
};

function VideoCardComponent({
  video,
  compact = false,
  thumbnailSize = "medium",
  isWatched = false,
  onMarkWatched,
}: VideoCardProps) {
  const duration = formatDuration(video.durationSeconds);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("group", thumbnailSizes[thumbnailSize])}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/20">
        <Link href={`/watch/${video.id}`} className="block" aria-label={`Watch ${video.title}`}>
          <div className={cn("relative overflow-hidden bg-muted/20", compact ? "aspect-[4/3]" : "aspect-video")}>
            <Image
              src={video.thumbnailUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {duration ? (
              <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white">
                {duration}
              </span>
            ) : null}
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge variant={video.type === "short" ? "short" : "video"}>
                {video.type === "short" ? "Short" : "Video"}
              </Badge>
              {isNewVideo(video.publishedAt) ? <Badge variant="new">NEW</Badge> : null}
            </div>
            {isWatched ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-label="Watched" />
              </div>
            ) : null}
          </div>
        </Link>

        <div className={cn("space-y-3", compact ? "p-4" : "p-5")}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-semibold text-zinc-100"
              aria-hidden
            >
              {getChannelInitials(video.channelName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-muted-foreground">
                {video.channelName}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="h-3 w-3" />
                {formatPublishedDate(video.publishedAt)}
              </p>
            </div>
          </div>

          <Link href={`/watch/${video.id}`}>
            <h3
              className={cn(
                "line-clamp-2 font-semibold leading-snug tracking-tight transition-colors group-hover:text-foreground",
                compact ? "text-base" : "text-lg",
              )}
            >
              {video.title}
            </h3>
          </Link>

          {onMarkWatched && !isWatched ? (
            <button
              type="button"
              onClick={() => onMarkWatched(video)}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Mark as watched
            </button>
          ) : null}
        </div>
      </Card>
    </motion.article>
  );
}

export const VideoCard = memo(VideoCardComponent);
