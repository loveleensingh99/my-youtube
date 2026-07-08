"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getQualityLabel } from "@/lib/youtube-player-api";

export const DEFAULT_QUALITY_OPTIONS = [
  "auto",
  "hd1080",
  "hd720",
  "large",
  "medium",
  "small",
  "tiny",
] as const;

interface QualityPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playbackQuality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
}

export function QualityPickerSheet({
  open,
  onOpenChange,
  playbackQuality,
  availableQualities,
  onQualityChange,
}: QualityPickerSheetProps) {
  const options =
    availableQualities.length > 1
      ? availableQualities
      : [...DEFAULT_QUALITY_OPTIONS];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed bottom-0 left-1/2 top-auto max-h-[70dvh] w-[calc(100%-1rem)] max-w-lg -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-2xl border-border/60 bg-[#212121] p-0 text-white sm:w-full">
        <DialogHeader className="border-b border-white/10 px-5 py-4 text-left">
          <DialogTitle className="text-base font-semibold text-white">Video quality</DialogTitle>
          <p className="text-xs text-white/60">
            Choose a quality, then use the gear icon on the video if it does not switch immediately.
          </p>
        </DialogHeader>

        <div className="max-h-[50dvh] overflow-y-auto py-2">
          {options.map((quality) => {
            const active = quality === playbackQuality;

            return (
              <button
                key={quality}
                type="button"
                onClick={() => {
                  onQualityChange(quality);
                  onOpenChange(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-5 py-3.5 text-left text-sm transition-colors hover:bg-white/10",
                  active && "bg-white/5 text-[#ff0000]",
                )}
              >
                <span>{getQualityLabel(quality)}</span>
                {active ? <span aria-hidden>✓</span> : null}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
