"use client";

import { useCallback, useRef } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  enabled?: boolean;
  threshold?: number;
}

export function usePullToRefresh({
  onRefresh,
  enabled = true,
  threshold = 72,
}: UsePullToRefreshOptions) {
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const refreshingRef = useRef(false);

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled || refreshingRef.current) return;
      if (window.scrollY > 0) return;

      startYRef.current = event.touches[0]?.clientY ?? 0;
      pullingRef.current = true;
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled || !pullingRef.current || refreshingRef.current) return;

      const endY = event.changedTouches[0]?.clientY ?? 0;
      const distance = endY - startYRef.current;
      pullingRef.current = false;

      if (distance >= threshold && window.scrollY <= 0) {
        refreshingRef.current = true;
        void Promise.resolve(onRefresh()).finally(() => {
          refreshingRef.current = false;
        });
      }
    },
    [enabled, onRefresh, threshold],
  );

  return { onTouchStart, onTouchEnd };
}
