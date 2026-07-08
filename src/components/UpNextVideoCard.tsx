"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import type { Video } from "@/types";
import { formatDuration, formatPublishedDate, isNewVideo } from "@/utils/date";
import { getChannelInitials } from "@/utils/video";

interface UpNextVideoCardProps {
  video: Video;
}

function UpNextVideoCardComponent({ video }: UpNextVideoCardProps) {
  const duration = formatDuration(video.durationSeconds);
  const channelProfileHref = video.channelId ? `/channel/${video.channelId}` : null;
  const isNew = isNewVideo(video.publishedAt);

  return (
    <article className="group overflow-hidden bg-black">
      <Link href={`/watch/${video.id}`} className="block" aria-label={`Watch ${video.title}`}>
        <div className="relative aspect-video w-full bg-zinc-900">
          <Image
            src={video.thumbnailUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          {duration ? (
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
              {duration}
            </span>
          ) : null}
          {isNew ? (
            <span className="absolute left-2 top-2 rounded bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              New
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex gap-3 px-4 py-3">
        {channelProfileHref ? (
          <Link
            href={channelProfileHref}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white transition-colors hover:bg-zinc-700"
            aria-label={`Open ${video.channelName} channel page`}
          >
            {getChannelInitials(video.channelName)}
          </Link>
        ) : (
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white"
            aria-hidden
          >
            {getChannelInitials(video.channelName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white">
              {video.title}
            </h3>
          </Link>
          {channelProfileHref ? (
            <Link
              href={channelProfileHref}
              className="mt-1 block text-xs text-white/60 hover:text-white/90"
            >
              {video.channelName} · {formatPublishedDate(video.publishedAt)}
            </Link>
          ) : (
            <p className="mt-1 text-xs text-white/60">
              {video.channelName} · {formatPublishedDate(video.publishedAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export const UpNextVideoCard = memo(UpNextVideoCardComponent);
