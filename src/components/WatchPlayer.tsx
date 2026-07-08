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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getQualityLabel, loadYouTubeIframeApi, normalizeQualityLevels, YOUTUBE_PLAYER_STATE, type YouTubePlayer } from "@/lib/youtube-player-api";
import { VideoPlayerControls } from "@/components/VideoPlayerControls";
import { STORAGE_KEYS } from "@/constants/app";

export interface WatchPlayerHandle {
  seekTo: (seconds: number) => void;
}

interface WatchPlayerProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
  className?: string;
  showControls?: boolean;
  fallbackDuration?: number;
  onProgress?: (currentTime: number, duration: number) => void;
}

function readPreferredQuality(): string {
  if (typeof window === "undefined") return "auto";
  return window.localStorage.getItem(STORAGE_KEYS.preferredQuality) ?? "auto";
}

export const WatchPlayer = forwardRef<WatchPlayerHandle, WatchPlayerProps>(function WatchPlayer(
  {
    videoId,
    title,
    autoplay = false,
    className,
    showControls = true,
    fallbackDuration = 0,
    onProgress,
  },
  ref,
) {
  const containerId = useId().replace(/:/g, "");
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const onProgressRef = useRef(onProgress);
  const fallbackDurationRef = useRef(fallbackDuration);
  const durationRef = useRef(fallbackDuration);
  const preferredQualityRef = useRef(readPreferredQuality());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackQuality, setPlaybackQuality] = useState(preferredQualityRef.current);
  const [availableQualities, setAvailableQualities] = useState<string[]>(["auto"]);

  useEffect(() => {
    onProgressRef.current = onProgress;
    fallbackDurationRef.current = fallbackDuration;
  });

  const refreshQualities = useCallback((player: YouTubePlayer) => {
    try {
      const levels = player.getAvailableQualityLevels?.() ?? [];
      const current = player.getPlaybackQuality?.() ?? preferredQualityRef.current ?? "auto";
      setAvailableQualities(normalizeQualityLevels(levels, current));
      setPlaybackQuality(current);
    } catch {
      setAvailableQualities(["auto"]);
      setPlaybackQuality("auto");
    }
  }, []);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const updateProgress = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const nextCurrent = player.getCurrentTime() || 0;
    const nextDuration = player.getDuration() || fallbackDurationRef.current || 0;

    setCurrentTime(nextCurrent);
    if (nextDuration > 0) {
      setDuration(nextDuration);
      durationRef.current = nextDuration;
    }
    onProgressRef.current?.(nextCurrent, nextDuration);

    const state = player.getPlayerState();
    setIsPlaying(
      state === YOUTUBE_PLAYER_STATE.PLAYING || state === YOUTUBE_PLAYER_STATE.BUFFERING,
    );
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    updateProgress();
    progressTimerRef.current = window.setInterval(updateProgress, 250);
  }, [stopProgressTimer, updateProgress]);

  const seekToTime = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;

    const maxDuration = durationRef.current || player.getDuration() || 0;
    const next = maxDuration > 0 ? Math.min(Math.max(0, seconds), maxDuration) : Math.max(0, seconds);

    player.seekTo(next, true);
    setCurrentTime(next);
    onProgressRef.current?.(next, maxDuration);
  }, []);

  useImperativeHandle(ref, () => ({
    seekTo: seekToTime,
  }));

  const handleTogglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const state = player.getPlayerState();
    if (state === YOUTUBE_PLAYER_STATE.PLAYING || state === YOUTUBE_PLAYER_STATE.BUFFERING) {
      player.pauseVideo();
      setIsPlaying(false);
      return;
    }

    player.playVideo();
    setIsPlaying(true);
  }, []);

  const handleSkip = useCallback(
    (delta: number) => {
      const player = playerRef.current;
      if (!player) return;
      seekToTime((player.getCurrentTime() || 0) + delta);
    },
    [seekToTime],
  );

  const handleQualityChange = useCallback(
    (quality: string) => {
      const player = playerRef.current;
      if (!player) return;

      preferredQualityRef.current = quality;
      window.localStorage.setItem(STORAGE_KEYS.preferredQuality, quality);
      setPlaybackQuality(quality);

      const resumeTime = player.getCurrentTime() || 0;
      const wasPlaying =
        player.getPlayerState() === YOUTUBE_PLAYER_STATE.PLAYING ||
        player.getPlayerState() === YOUTUBE_PLAYER_STATE.BUFFERING;

      try {
        player.setPlaybackQuality(quality === "auto" ? "auto" : quality);
      } catch {
        // YouTube may ignore programmatic quality changes.
      }

      player.loadVideoById({
        videoId,
        startSeconds: resumeTime,
        suggestedQuality: quality === "auto" ? undefined : quality,
      });

      window.setTimeout(() => {
        refreshQualities(player);
        updateProgress();

        if (!wasPlaying) {
          player.pauseVideo();
          setIsPlaying(false);
        }
      }, 500);

      toast.message(`Quality set to ${getQualityLabel(quality)}`, {
        description: "Tap the video, then Settings, if the stream does not update right away.",
      });
    },
    [refreshQualities, updateProgress, videoId],
  );

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
          disablekb: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            setIsReady(true);

            const preferred = preferredQualityRef.current;
            if (preferred && preferred !== "auto") {
              try {
                event.target.setPlaybackQuality(preferred);
              } catch {
                // Ignore unsupported quality on ready.
              }
            }

            refreshQualities(event.target);
            updateProgress();

            if (autoplay) {
              event.target.playVideo();
              setIsPlaying(true);
            }
          },
          onStateChange: (event) => {
            const playing =
              event.data === YOUTUBE_PLAYER_STATE.PLAYING ||
              event.data === YOUTUBE_PLAYER_STATE.BUFFERING;
            setIsPlaying(playing);

            if (playing) {
              refreshQualities(event.target);
              startProgressTimer();
              return;
            }

            stopProgressTimer();
            updateProgress();
          },
          onPlaybackQualityChange: (event) => {
            const quality =
              typeof event.data === "string"
                ? event.data
                : (event.target.getPlaybackQuality?.() ?? "auto");
            setPlaybackQuality(quality);
            refreshQualities(event.target);
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      stopProgressTimer();
      player?.destroy();
      playerRef.current = null;
    };
  }, [
    autoplay,
    containerId,
    fallbackDuration,
    videoId,
    refreshQualities,
    startProgressTimer,
    stopProgressTimer,
    updateProgress,
  ]);

  return (
    <div className={cn("relative flex h-full w-full flex-col bg-black", className)}>
      <div className="relative min-h-0 flex-1">
        <div id={containerId} title={title} className="absolute inset-0 h-full w-full" />
      </div>

      {showControls ? (
        <div className="relative z-20 shrink-0 bg-gradient-to-t from-black via-black/95 to-transparent px-3 pb-2 pt-3">
          <VideoPlayerControls
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            isReady={isReady}
            playbackQuality={playbackQuality}
            availableQualities={availableQualities}
            onSeek={seekToTime}
            onTogglePlay={handleTogglePlay}
            onSkip={handleSkip}
            onQualityChange={handleQualityChange}
          />
        </div>
      ) : null}
    </div>
  );
});
