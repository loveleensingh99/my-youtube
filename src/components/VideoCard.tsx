"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { MoreVertical } from "lucide-react";
import type { Video } from "@/types";
import { formatDuration, formatPublishedDate } from "@/utils/date";
import { getChannelInitials } from "@/utils/video";

interface VideoCardProps {
  video: Video;
  isWatched?: boolean;
  onMarkWatched?: (video: Video) => void;
}

function VideoCardComponent({ video, isWatched = false, onMarkWatched }: VideoCardProps) {
  const duration = formatDuration(video.durationSeconds);

  return (
    <article className="group">
      <Link href={`/watch/${video.id}`} className="block" aria-label={`Watch ${video.title}`}>
        <div className="relative aspect-video overflow-hidden bg-secondary">
          <Image
            src={video.thumbnailUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          {duration ? (
            <span className="absolute bottom-2 right-2 rounded px-1.5 py-0.5 text-[11px] font-medium text-white bg-black/80">
              {duration}
            </span>
          ) : null}
          {isWatched ? (
            <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
              Watched
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex gap-3 px-3 py-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground"
          aria-hidden
        >
          {getChannelInitials(video.channelName)}
        </div>

        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
              {video.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {video.channelName} · {formatPublishedDate(video.publishedAt)}
          </p>
        </div>

        {onMarkWatched && !isWatched ? (
          <button
            type="button"
            onClick={() => onMarkWatched(video)}
            className="mt-0.5 shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Mark as watched"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}
      </div>
    </article>
  );
}

export const VideoCard = memo(VideoCardComponent);
