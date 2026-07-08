"use client";

import { useState } from "react";
import { Pause, Play, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getQualityLabel } from "@/lib/youtube-player-api";
import { VideoSeekBar } from "@/components/VideoSeekBar";
import { QualityPickerSheet } from "@/components/QualityPickerSheet";
import { Button } from "@/components/ui/button";

interface VideoPlayerControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isReady: boolean;
  playbackQuality: string;
  availableQualities: string[];
  onSeek: (seconds: number) => void;
  onTogglePlay: () => void;
  onSkip: (seconds: number) => void;
  onQualityChange: (quality: string) => void;
  className?: string;
}

function SkipButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "back" | "forward";
  onClick: () => void;
  disabled?: boolean;
}) {
  const label = direction === "back" ? "Rewind 10 seconds" : "Forward 10 seconds";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="h-11 w-11 rounded-full text-white hover:bg-white/10 hover:text-white"
    >
      <span className="relative flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
          {direction === "back" ? (
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          ) : (
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
          )}
        </svg>
        <span className="absolute text-[9px] font-bold leading-none">10</span>
      </span>
    </Button>
  );
}

export function VideoPlayerControls({
  currentTime,
  duration,
  isPlaying,
  isReady,
  playbackQuality,
  availableQualities,
  onSeek,
  onTogglePlay,
  onSkip,
  onQualityChange,
  className,
}: VideoPlayerControlsProps) {
  const [qualityOpen, setQualityOpen] = useState(false);

  return (
    <>
      <div className={cn("relative z-20 space-y-3", className)}>
        <VideoSeekBar
          currentTime={currentTime}
          duration={duration}
          disabled={!isReady}
          onSeek={onSeek}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <SkipButton direction="back" disabled={!isReady} onClick={() => onSkip(-10)} />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!isReady}
              onClick={onTogglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="h-12 w-12 rounded-full text-white hover:bg-white/10 hover:text-white"
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="h-7 w-7 fill-current" />
              )}
            </Button>

            <SkipButton direction="forward" disabled={!isReady} onClick={() => onSkip(10)} />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!isReady}
            onClick={() => setQualityOpen(true)}
            aria-haspopup="dialog"
            className="h-9 rounded-full px-3 text-xs font-medium text-white hover:bg-white/10 hover:text-white"
          >
            <Settings2 className="mr-1.5 h-4 w-4" />
            {getQualityLabel(playbackQuality)}
          </Button>
        </div>
      </div>

      <QualityPickerSheet
        open={qualityOpen}
        onOpenChange={setQualityOpen}
        playbackQuality={playbackQuality}
        availableQualities={availableQualities}
        onQualityChange={onQualityChange}
      />
    </>
  );
}
