"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UpNextVideoCard } from "@/components/UpNextVideoCard";
import { WatchPlayer } from "@/components/WatchPlayer";
import { Button } from "@/components/ui/button";
import type { Video } from "@/types";
import { formatDuration, formatPublishedDate } from "@/utils/date";
import { getChannelInitials } from "@/utils/video";

interface LongFormWatchProps {
  video: Video;
  upNext?: Video[];
}

export function LongFormWatch({ video, upNext = [] }: LongFormWatchProps) {
  const router = useRouter();
  const channelHref = video.channelId ? `/channel/${video.channelId}` : null;
  const duration = formatDuration(video.durationSeconds);

  return (
    <div className="min-h-[100dvh] bg-black">
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-white/10 bg-black/95 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full text-white hover:bg-white/10 hover:text-white"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <p className="truncate text-sm font-medium text-white">{video.channelName}</p>
      </div>

      <div className="aspect-video w-full bg-black">
        <WatchPlayer
          videoId={video.id}
          title={video.title}
          autoplay
          fallbackDuration={video.durationSeconds ?? 0}
          className="h-full w-full"
        />
      </div>

      <div className="space-y-4 px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div>
          <h1 className="text-base font-semibold leading-snug text-white">{video.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
            {duration ? <span>{duration}</span> : null}
            <span>{formatPublishedDate(video.publishedAt)}</span>
          </div>
        </div>

        {channelHref ? (
          <Link
            href={channelHref}
            className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 transition-colors hover:bg-white/10"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-semibold text-white">
              {getChannelInitials(video.channelName)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{video.channelName}</p>
              <p className="text-xs text-white/60">View channel</p>
            </div>
          </Link>
        ) : null}

        {upNext.length > 0 ? (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between px-0">
              <h2 className="text-sm font-semibold text-white">Up next</h2>
              <span className="text-xs text-white/50">{upNext.length} videos</span>
            </div>
            <div className="-mx-4 divide-y divide-white/10 border-y border-white/10">
              {upNext.map((entry) => (
                <UpNextVideoCard key={entry.id} video={entry} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
