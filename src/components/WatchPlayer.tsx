"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { WatchPlayerSkeleton } from "@/components/Skeleton";
import { VideoRotateControl } from "@/components/VideoRotateControl";
import { loadYouTubeIframeApi, YOUTUBE_PLAYER_STATE, type YouTubePlayer } from "@/lib/youtube-player-api";

export interface WatchPlayerHandle {
  seekTo: (seconds: number) => void;
}

interface WatchPlayerProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
  className?: string;
  fallbackDuration?: number;
  /** Immersive full-bleed watch UI (mobile feed / landscape). */
  immersive?: boolean;
  /** Increment after a tap to re-show the rotate button for 5 seconds. */
  revealControlsToken?: number;
  onProgress?: (currentTime: number, duration: number) => void;
}

function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
  };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export const WatchPlayer = forwardRef<WatchPlayerHandle, WatchPlayerProps>(function WatchPlayer(
  {
    videoId,
    title,
    autoplay = false,
    className,
    fallbackDuration = 0,
    immersive = false,
    revealControlsToken = 0,
    onProgress,
  },
  ref,
) {
  const containerId = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const onProgressRef = useRef(onProgress);
  const fallbackDurationRef = useRef(fallbackDuration);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsPlayerReady(false);
  }, [videoId]);

  useEffect(() => {
    onProgressRef.current = onProgress;
    fallbackDurationRef.current = fallbackDuration;
  });

  useEffect(() => {
    const syncFullscreen = () => {
      const active = getFullscreenElement();
      const wrapper = wrapperRef.current;
      setIsFullscreen(Boolean(active && wrapper && (active === wrapper || wrapper.contains(active))));
    };

    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen as EventListener);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen as EventListener);
    };
  }, []);

  const seekToTime = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;

    const maxDuration = player.getDuration() || fallbackDurationRef.current || 0;
    const next = maxDuration > 0 ? Math.min(Math.max(0, seconds), maxDuration) : Math.max(0, seconds);

    player.seekTo(next, true);
    onProgressRef.current?.(next, maxDuration);
  }, []);

  useImperativeHandle(ref, () => ({
    seekTo: seekToTime,
  }));

  useEffect(() => {
    let cancelled = false;
    let player: YouTubePlayer | null = null;

    void loadYouTubeIframeApi().then((api) => {
      if (cancelled) return;

      playerRef.current?.destroy();

      player = new api.Player(containerId, {
        videoId,
        host: "https://www.youtube.com",
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          playsinline: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            setIsPlayerReady(true);
            if (autoplay) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            if (
              event.data === YOUTUBE_PLAYER_STATE.PLAYING ||
              event.data === YOUTUBE_PLAYER_STATE.BUFFERING
            ) {
              const current = event.target.getCurrentTime() || 0;
              const duration = event.target.getDuration() || fallbackDurationRef.current || 0;
              onProgressRef.current?.(current, duration);
            }
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      player?.destroy();
      playerRef.current = null;
    };
  }, [autoplay, containerId, videoId]);

  const showRotateControl = immersive || isFullscreen;

  return (
    <div ref={wrapperRef} className={cn("relative h-full w-full bg-black", className)}>
      {!isPlayerReady ? <WatchPlayerSkeleton /> : null}
      <div id={containerId} title={title} className="absolute inset-0 h-full w-full" />
      <VideoRotateControl
        containerRef={wrapperRef}
        enabled={showRotateControl}
        revealToken={revealControlsToken}
      />
    </div>
  );
});
