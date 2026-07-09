"use client";

import { useCallback, useRef } from "react";

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

interface UseVerticalSwipeOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  threshold?: number;
  maxTapDuration?: number;
  maxTapDistance?: number;
}

export function useVerticalSwipe({
  onSwipeUp,
  onSwipeDown,
  onTap,
  threshold = 48,
  maxTapDuration = 280,
  maxTapDistance = 12,
}: UseVerticalSwipeOptions) {
  const startRef = useRef<TouchPoint | null>(null);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;

    startRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const start = startRef.current;
      startRef.current = null;
      if (!start) return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      const duration = Date.now() - start.time;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absY >= threshold && absY > absX) {
        if (deltaY < 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
        return;
      }

      if (duration <= maxTapDuration && absX <= maxTapDistance && absY <= maxTapDistance) {
        onTap?.();
      }
    },
    [maxTapDistance, maxTapDuration, onSwipeDown, onSwipeUp, onTap, threshold],
  );

  return { onTouchStart, onTouchEnd };
}
