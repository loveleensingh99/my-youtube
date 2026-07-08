"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { buildEmbedUrl } from "@/utils/video";

interface WatchPlayerProps {
  videoId: string;
  title: string;
  onStarted?: () => void;
  className?: string;
}

export function WatchPlayer({ videoId, title, onStarted, className }: WatchPlayerProps) {
  useEffect(() => {
    onStarted?.();
  }, [onStarted, videoId]);

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-xl border border-border/60 bg-black shadow-2xl shadow-black/40",
        className,
      )}
    >
      <iframe
        src={buildEmbedUrl(videoId)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        loading="lazy"
      />
    </div>
  );
}
