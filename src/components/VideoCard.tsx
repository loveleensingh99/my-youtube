"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { ChannelAvatar } from "@/components/ChannelAvatar";
import { useFeedContext } from "@/components/FeedProvider";
import type { Settings, Video } from "@/types";
import { formatDuration, formatPublishedDate, isNewVideo } from "@/utils/date";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  compactMode?: boolean;
  thumbnailSize?: Settings["thumbnailSize"];
}

function VideoCardComponent({
  video,
  compactMode = false,
  thumbnailSize = "medium",
}: VideoCardProps) {
  const { getChannelAvatar } = useFeedContext();
  const duration = formatDuration(video.durationSeconds);
  const channelProfileHref = video.channelId ? `/channel/${video.channelId}` : null;
  const isNew = isNewVideo(video.publishedAt);
  const avatarUrl = video.channelId ? getChannelAvatar(video.channelId) : undefined;

  return (
    <article className="group">
      <Link href={`/watch/${video.id}`} className="block" aria-label={`Watch ${video.title}`}>
        <div
          className={cn(
            "relative overflow-hidden bg-secondary",
            thumbnailSize === "small" && "aspect-video max-h-40",
            thumbnailSize === "medium" && "aspect-video",
            thumbnailSize === "large" && "aspect-video min-h-[14rem]",
          )}
        >
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
          {isNew ? (
            <span className="absolute left-2 top-2 rounded bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              New
            </span>
          ) : null}
        </div>
      </Link>

      <div className={cn("flex gap-3 px-3", compactMode ? "py-2" : "py-3")}>
        <ChannelAvatar
          channelName={video.channelName}
          avatarUrl={avatarUrl}
          size={compactMode ? "sm" : "md"}
          href={channelProfileHref}
          className="mt-0.5 transition-colors hover:opacity-90"
        />

        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.id}`}>
            <h3
              className={cn(
                "line-clamp-2 font-medium leading-snug text-foreground",
                compactMode ? "text-xs" : "text-sm",
              )}
            >
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
