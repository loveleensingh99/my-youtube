"use client";

import { useEffect, useState } from "react";

function getIsLandscape(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(orientation: landscape)").matches;
}

export function useDeviceOrientation() {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const update = () => setIsLandscape(getIsLandscape());
    update();

    const media = window.matchMedia("(orientation: landscape)");
    media.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return { isLandscape };
}
