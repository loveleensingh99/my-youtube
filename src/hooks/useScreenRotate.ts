"use client";

import { useCallback, useState, type RefObject } from "react";
import { toast } from "sonner";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

type OrientationLockType = "portrait" | "landscape";

async function ensureElementFullscreen(element: HTMLElement) {
  if (document.fullscreenElement) {
    return;
  }

  if (element.requestFullscreen) {
    await element.requestFullscreen();
    return;
  }

  const webkitElement = element as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
  };
  if (webkitElement.webkitRequestFullscreen) {
    await webkitElement.webkitRequestFullscreen();
  }
}

async function lockOrientation(type: OrientationLockType) {
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (orientation: OrientationLockType) => Promise<void>;
  };

  if (typeof orientation.lock !== "function") {
    throw new Error("Orientation lock is not supported");
  }

  await orientation.lock(type);
}

export function useScreenRotate(containerRef: RefObject<HTMLElement | null>) {
  const { isLandscape } = useDeviceOrientation();
  const [isRotating, setIsRotating] = useState(false);

  const rotate = useCallback(async () => {
    const container = containerRef.current;
    if (!container || isRotating) return;

    setIsRotating(true);
    try {
      await ensureElementFullscreen(container);
      await lockOrientation(isLandscape ? "portrait" : "landscape");
    } catch {
      toast.message(
        isLandscape
          ? "Could not switch to portrait. Try your phone’s rotation lock."
          : "Could not switch to landscape. Try your phone’s rotation lock.",
      );
    } finally {
      setIsRotating(false);
    }
  }, [containerRef, isLandscape, isRotating]);

  return {
    isLandscape,
    isRotating,
    rotate,
    targetLabel: isLandscape ? "Portrait" : "Landscape",
  };
}
