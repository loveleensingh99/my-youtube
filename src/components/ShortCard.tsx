"use client";

import Link from "next/link";
import { memo } from "react";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import type { Settings, Video } from "@/types";
import { formatDuration, isNewVideo } from "@/utils/date";
import { cn } from "@/lib/utils";

interface ShortCardProps {
  video: Video;
  compactMode?: boolean;
}

function ShortCardComponent({ video, compactMode = false }: ShortCardProps) {
  const duration = formatDuration(video.durationSeconds);
  const isNew = isNewVideo(video.publishedAt);

  return (
    <article className="group min-w-0">
      <Link href={`/watch/${video.id}`} className="block" aria-label={`Watch ${video.title}`}>
        <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-secondary">
          <VideoThumbnail
            variant="short"
            videoId={video.id}
            thumbnailUrl={video.thumbnailUrl}
            fill
            sizes="(max-width: 768px) 50vw, 540px"
            className="object-cover"
          />
          {duration ? (
            <span className="absolute bottom-1.5 right-1.5 rounded px-1 py-0.5 text-[10px] font-medium text-white bg-black/80">
              {duration}
            </span>
          ) : null}
          {isNew ? (
            <span className="absolute left-1.5 top-1.5 rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              New
            </span>
          ) : null}
        </div>
      </Link>

      <div className={cn("space-y-1 px-0.5", compactMode ? "mt-1.5" : "mt-2")}>
        <Link href={`/watch/${video.id}`}>
          <h3
            className={cn(
              "line-clamp-2 font-medium leading-snug text-foreground",
              compactMode ? "text-[11px]" : "text-xs",
            )}
          >
            {video.title}
          </h3>
        </Link>
        {video.channelId ? (
          <Link
            href={`/channel/${video.channelId}`}
            className="block truncate text-[11px] text-muted-foreground hover:text-foreground"
          >
            {video.channelName}
          </Link>
        ) : (
          <p className="truncate text-[11px] text-muted-foreground">{video.channelName}</p>
        )}
      </div>
    </article>
  );
}

export const ShortCard = memo(ShortCardComponent);
