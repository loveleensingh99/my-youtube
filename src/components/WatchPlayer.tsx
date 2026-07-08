"use client";

import { cn } from "@/lib/utils";
import { buildEmbedUrl } from "@/utils/video";

interface WatchPlayerProps {
  videoId: string;
  title: string;
  className?: string;
}

export function WatchPlayer({ videoId, title, className }: WatchPlayerProps) {
  const embedUrl = buildEmbedUrl(videoId);

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-xl border border-border/60 bg-black shadow-2xl shadow-black/40",
        className,
      )}
    >
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
