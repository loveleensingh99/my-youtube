"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { WatchPlayer } from "@/components/WatchPlayer";
import { Button } from "@/components/ui/button";
import type { Video } from "@/types";
import { formatPublishedDate } from "@/utils/date";
import { getChannelInitials } from "@/utils/video";

interface MobileWatchFeedProps {
  videos: Video[];
  initialVideoId: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  onMarkWatched?: (video: Video) => void;
}

export function MobileWatchFeed({
  videos,
  initialVideoId,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onMarkWatched,
}: MobileWatchFeedProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVideoId, setActiveVideoId] = useState(initialVideoId);
  const loadMoreLockRef = useRef(false);
  const markedVideoIdsRef = useRef(new Set<string>());
  const activeVideoIdRef = useRef(activeVideoId);
  const onMarkWatchedRef = useRef(onMarkWatched);
  const onLoadMoreRef = useRef(onLoadMore);
  const videosRef = useRef(videos);
  const hasMoreRef = useRef(hasMore);
  const hasScrolledToInitialRef = useRef(false);

  useEffect(() => {
    activeVideoIdRef.current = activeVideoId;
    onMarkWatchedRef.current = onMarkWatched;
    onLoadMoreRef.current = onLoadMore;
    videosRef.current = videos;
    hasMoreRef.current = hasMore;
  });

  const activeIndex = videos.findIndex((video) => video.id === activeVideoId);
  const activeVideo = videos[activeIndex] ?? videos[0];

  const markVideoOnce = useCallback((video: Video) => {
    if (markedVideoIdsRef.current.has(video.id)) return;
    markedVideoIdsRef.current.add(video.id);
    onMarkWatchedRef.current?.(video);
  }, []);

  useEffect(() => {
    const initialVideo = videosRef.current.find((entry) => entry.id === initialVideoId);
    if (initialVideo) {
      markVideoOnce(initialVideo);
    }
  }, [initialVideoId, markVideoOnce]);

  useEffect(() => {
    if (hasScrolledToInitialRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const targetIndex = videos.findIndex((video) => video.id === initialVideoId);
    if (targetIndex < 0) return;

    const target = container.children[targetIndex] as HTMLElement | undefined;
    target?.scrollIntoView({ block: "start" });
    hasScrolledToInitialRef.current = true;
  }, [initialVideoId, videos]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.55)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const videoId = visible.target.getAttribute("data-video-id");
        if (!videoId || videoId === activeVideoIdRef.current) return;

        activeVideoIdRef.current = videoId;
        setActiveVideoId(videoId);
        window.history.replaceState(null, "", `/watch/${videoId}`);

        const currentVideos = videosRef.current;
        const index = currentVideos.findIndex((video) => video.id === videoId);
        const video = currentVideos[index];
        if (video) {
          markVideoOnce(video);
        }

        if (
          hasMoreRef.current &&
          index >= currentVideos.length - 2 &&
          !loadMoreLockRef.current
        ) {
          loadMoreLockRef.current = true;
          void Promise.resolve(onLoadMoreRef.current?.()).finally(() => {
            loadMoreLockRef.current = false;
          });
        }
      },
      {
        root: container,
        threshold: [0.55, 0.75, 0.9],
      },
    );

    const slides = Array.from(container.querySelectorAll<HTMLElement>("[data-video-id]"));
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [markVideoOnce, videos.length]);

  if (!activeVideo) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
          onClick={() => router.push("/")}
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="rounded-full bg-black/40 px-3 py-1 text-xs text-white/90">
          {activeIndex + 1} / {videos.length}
          {hasMore ? "+" : ""}
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-[100dvh] snap-y snap-mandatory overflow-y-auto overscroll-y-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {videos.map((video, index) => {
          const isActive = video.id === activeVideoId;

          return (
            <section
              key={video.id}
              data-video-id={video.id}
              className="flex h-[100dvh] snap-start snap-always flex-col bg-black"
            >
              <div className="relative min-h-0 flex-1">
                {isActive ? (
                  <WatchPlayer
                    videoId={video.id}
                    title={video.title}
                    autoplay
                    fallbackDuration={video.durationSeconds ?? 0}
                    className="h-full"
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <Image
                      src={video.thumbnailUrl}
                      alt=""
                      fill
                      sizes="100vw"
                      className="object-contain"
                      priority={Math.abs(index - activeIndex) <= 1}
                    />
                  </div>
                )}
              </div>

              <div className="shrink-0 bg-black px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
                    {getChannelInitials(video.channelName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="line-clamp-2 text-sm font-semibold text-white">{video.title}</h1>
                    <p className="mt-1 text-xs text-white/70">
                      {video.channelName} · {formatPublishedDate(video.publishedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {isLoadingMore ? (
          <div className="flex h-24 snap-start items-center justify-center text-sm text-white/60">
            Loading more videos...
          </div>
        ) : null}
      </div>
    </div>
  );
}
