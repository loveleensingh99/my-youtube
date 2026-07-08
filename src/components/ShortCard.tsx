"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import type { Video } from "@/types";
import { formatDuration } from "@/utils/date";

interface ShortCardProps {
  video: Video;
}

function ShortCardComponent({ video }: ShortCardProps) {
  const duration = formatDuration(video.durationSeconds);

  return (
    <article className="group min-w-0">
      <Link href={`/watch/${video.id}`} className="block" aria-label={`Watch ${video.title}`}>
        <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-secondary">
          <Image
            src={video.thumbnailUrl}
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
          />
          {duration ? (
            <span className="absolute bottom-1.5 right-1.5 rounded px-1 py-0.5 text-[10px] font-medium text-white bg-black/80">
              {duration}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="mt-2 space-y-1 px-0.5">
        <Link href={`/watch/${video.id}`}>
          <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
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
