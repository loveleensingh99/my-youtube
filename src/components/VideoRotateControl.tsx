"use client";

import { useEffect, type RefObject } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAutoHide } from "@/hooks/useAutoHide";
import { useScreenRotate } from "@/hooks/useScreenRotate";
import { cn } from "@/lib/utils";

interface VideoRotateControlProps {
  containerRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  /** Increment to briefly show the button again (e.g. on screen tap). */
  revealToken?: number;
  className?: string;
}

export function VideoRotateControl({
  containerRef,
  enabled,
  revealToken = 0,
  className,
}: VideoRotateControlProps) {
  const { visible, show } = useAutoHide(5000, enabled);
  const { isLandscape, isRotating, rotate, targetLabel } = useScreenRotate(containerRef);

  useEffect(() => {
    if (!enabled || revealToken <= 0) return;
    show();
  }, [enabled, revealToken, show]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-30 transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isRotating || !visible}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        className={cn(
          "h-12 w-12 rounded-full bg-black/55 text-white shadow-lg backdrop-blur-md hover:bg-black/70 hover:text-white",
          visible ? "pointer-events-auto" : "pointer-events-none",
        )}
        onClick={(event) => {
          event.stopPropagation();
          show();
          void rotate();
        }}
        aria-label={`Rotate to ${targetLabel.toLowerCase()}`}
        title={`Rotate to ${targetLabel}`}
      >
        <RotateCw
          className={cn("h-5 w-5", isLandscape && "rotate-90", isRotating && "animate-spin")}
        />
      </Button>
    </div>
  );
}
