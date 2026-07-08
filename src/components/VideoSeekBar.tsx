"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { formatPlayerTime } from "@/lib/youtube-player-api";

interface VideoSeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  className?: string;
  disabled?: boolean;
}

export function VideoSeekBar({
  currentTime,
  duration,
  onSeek,
  className,
  disabled = false,
}: VideoSeekBarProps) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const safeDuration = duration > 0 ? duration : 0;
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent =
    safeDuration > 0 ? Math.min(100, Math.max(0, (displayTime / safeDuration) * 100)) : 0;

  const handleSeek = useCallback(
    (value: number) => {
      if (disabled || safeDuration <= 0) return;
      const next = Math.min(Math.max(0, value), safeDuration);
      setScrubTime(next);
      onSeek(next);
    },
    [disabled, onSeek, safeDuration],
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="relative h-5 touch-none">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25" />
        <div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#ff0000]"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#ff0000] shadow-sm"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />
        <input
          type="range"
          min={0}
          max={safeDuration || 1}
          step={0.1}
          value={Math.min(displayTime, safeDuration || 0)}
          disabled={disabled || safeDuration <= 0}
          aria-label="Seek video"
          aria-valuemin={0}
          aria-valuemax={safeDuration}
          aria-valuenow={displayTime}
          aria-valuetext={`${formatPlayerTime(displayTime)} of ${formatPlayerTime(safeDuration)}`}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          onPointerDown={() => {
            setIsScrubbing(true);
            setScrubTime(displayTime);
          }}
          onPointerUp={() => setIsScrubbing(false)}
          onPointerCancel={() => setIsScrubbing(false)}
          onChange={(event) => handleSeek(Number(event.target.value))}
          onInput={(event) => {
            setIsScrubbing(true);
            handleSeek(Number(event.currentTarget.value));
          }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] font-medium tabular-nums text-white/80">
        <span>{formatPlayerTime(displayTime)}</span>
        <span>{formatPlayerTime(safeDuration)}</span>
      </div>
    </div>
  );
}
