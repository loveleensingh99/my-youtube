"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoHide(delayMs = 5000, enabled = true) {
  const [visible, setVisible] = useState(enabled);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    if (!enabled) {
      setVisible(false);
      clearTimer();
      return;
    }

    setVisible(true);
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      timeoutRef.current = null;
    }, delayMs);
  }, [clearTimer, delayMs, enabled]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  useEffect(() => {
    if (!enabled) {
      hide();
      return;
    }

    show();
    return clearTimer;
  }, [clearTimer, enabled, hide, show]);

  return { visible, show, hide };
}
