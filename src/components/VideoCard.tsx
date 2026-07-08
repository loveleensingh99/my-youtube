"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import type { Video } from "@/types";
import { formatDuration, formatPublishedDate } from "@/utils/date";
import { getChannelInitials } from "@/utils/video";

interface VideoCardProps {
  video: Video;
}

function VideoCardComponent({ video }: VideoCardProps) {
  const duration = formatDuration(video.durationSeconds);
  const channelProfileHref = video.channelId ? `/channel/${video.channelId}` : null;

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
        </div>
      </Link>

      <div className="flex gap-3 px-3 py-3">
        {channelProfileHref ? (
          <Link
            href={channelProfileHref}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground transition-colors hover:bg-secondary/80"
            aria-label={`Open ${video.channelName} channel page`}
          >
            {getChannelInitials(video.channelName)}
          </Link>
        ) : (
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground"
            aria-hidden
          >
            {getChannelInitials(video.channelName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
              {video.title}
            </h3>
          </Link>
          {channelProfileHref ? (
            <Link
              href={channelProfileHref}
              className="mt-1 block text-xs text-muted-foreground hover:text-foreground"
            >
              {video.channelName} · {formatPublishedDate(video.publishedAt)}
            </Link>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {video.channelName} · {formatPublishedDate(video.publishedAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export const VideoCard = memo(VideoCardComponent);
