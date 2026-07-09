"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CommunityPostImage } from "@/types";
import { cn } from "@/lib/utils";

interface PostImageCarouselProps {
  images: CommunityPostImage[];
  postId: string;
  className?: string;
}

function normalizeImageUrl(url: string): string {
  if (url.endsWith("=s")) {
    return `${url}1200`;
  }
  return url;
}

export function PostImageCarousel({ images, postId, className }: PostImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    images.forEach((image) => {
      const preloader = new window.Image();
      preloader.src = normalizeImageUrl(image.url);
    });
  }, [images]);

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  if (!hasMultiple) {
    return (
      <div className={cn("relative mt-3 bg-black", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={normalizeImageUrl(images[0].url)}
          alt=""
          className="mx-auto block max-h-[min(70vh,32rem)] w-full object-contain"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative mt-3", className)}>
      <div
        className="relative overflow-hidden bg-black"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? 0;
        }}
        onTouchEnd={(event) => {
          const touchEndX = event.changedTouches[0]?.clientX ?? 0;
          const delta = touchEndX - touchStartX.current;

          if (delta > 48) {
            goPrev();
          } else if (delta < -48) {
            goNext();
          }
        }}
      >
        <div
          className="flex transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {images.map((image, imageIndex) => (
            <div
              key={`${postId}-slide-${imageIndex}`}
              className="flex w-full shrink-0 items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={normalizeImageUrl(image.url)}
                alt=""
                className="mx-auto block max-h-[min(70vh,32rem)] w-full object-contain"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
          {images.map((image, dotIndex) => (
            <button
              key={`${postId}-dot-${image.url}-${dotIndex}`}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === index ? "w-3 bg-white" : "w-1.5 bg-white/50",
              )}
              aria-label={`Go to image ${dotIndex + 1}`}
            />
          ))}
        </div>

        <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {index + 1}/{images.length}
        </span>
      </div>
    </div>
  );
}
