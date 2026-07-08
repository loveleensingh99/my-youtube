"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";
import {
  getYouTubeShortThumbnailFallback,
  getYouTubeThumbnailFallback,
  upgradeYouTubeShortThumbnailUrl,
  upgradeYouTubeThumbnailUrl,
} from "@/utils/video";

interface VideoThumbnailProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  videoId: string;
  thumbnailUrl: string;
  variant?: "video" | "short";
}

function isYouTubeThumbnailUrl(url: string): boolean {
  return url.includes("ytimg.com") || url.includes("ggpht.com");
}

export function VideoThumbnail({
  videoId,
  thumbnailUrl,
  variant = "video",
  quality = 100,
  unoptimized: unoptimizedProp,
  ...props
}: VideoThumbnailProps) {
  const isShort = variant === "short";
  const [src, setSrc] = useState(() =>
    isShort
      ? upgradeYouTubeShortThumbnailUrl(thumbnailUrl, videoId)
      : upgradeYouTubeThumbnailUrl(thumbnailUrl, videoId),
  );

  const handleError = useCallback(() => {
    setSrc((current) => {
      const fallback = isShort
        ? getYouTubeShortThumbnailFallback(videoId, current)
        : getYouTubeThumbnailFallback(videoId, current);

      return fallback ?? current;
    });
  }, [isShort, videoId]);

  return (
    <Image
      src={src}
      alt=""
      quality={quality}
      unoptimized={unoptimizedProp ?? isYouTubeThumbnailUrl(src)}
      onError={handleError}
      {...props}
    />
  );
}
