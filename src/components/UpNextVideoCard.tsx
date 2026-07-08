"use client";

import Link from "next/link";
import { memo } from "react";
import { ChannelAvatar } from "@/components/ChannelAvatar";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { useFeedContext } from "@/components/FeedProvider";
import type { Video } from "@/types";
import { formatDuration, formatPublishedDate, isNewVideo } from "@/utils/date";

interface UpNextVideoCardProps {
  video: Video;
}

function UpNextVideoCardComponent({ video }: UpNextVideoCardProps) {
  const { getChannelAvatar } = useFeedContext();
  const duration = formatDuration(video.durationSeconds);
  const channelProfileHref = video.channelId ? `/channel/${video.channelId}` : null;
  const isNew = isNewVideo(video.publishedAt);

  return (
    <article className="group overflow-hidden bg-black">
      <Link href={`/watch/${video.id}`} className="block" aria-label={`Watch ${video.title}`}>
        <div className="relative aspect-video w-full bg-zinc-900">
          <VideoThumbnail
            videoId={video.id}
            thumbnailUrl={video.thumbnailUrl}
            fill
            sizes="(max-width: 768px) 100vw, 1280px"
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
        <ChannelAvatar
          channelName={video.channelName}
          avatarUrl={video.channelId ? getChannelAvatar(video.channelId) : undefined}
          size="md"
          href={channelProfileHref}
          className="mt-0.5 bg-zinc-800 text-white hover:opacity-90"
        />

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
