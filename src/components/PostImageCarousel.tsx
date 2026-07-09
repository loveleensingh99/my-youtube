"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CommunityPostImage } from "@/types";
import { cn } from "@/lib/utils";

interface PostImageCarouselProps {
  images: CommunityPostImage[];
  postId: string;
  className?: string;
}

function normalizeImageUrl(url: string, fullSize = false): string {
  if (url.endsWith("=s")) {
    return `${url}${fullSize ? "0" : "1200"}`;
  }
  if (fullSize && /=s\d+$/.test(url)) {
    return url.replace(/=s\d+$/, "=s0");
  }
  return url;
}

export function PostImageCarousel({ images, postId, className }: PostImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    images.forEach((image) => {
      const preloader = new window.Image();
      preloader.src = normalizeImageUrl(image.url);
      const fullPreloader = new window.Image();
      fullPreloader.src = normalizeImageUrl(image.url, true);
    });
  }, [images]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      } else if (event.key === "ArrowLeft" && hasMultiple) {
        setIndex((current) => (current - 1 + images.length) % images.length);
      } else if (event.key === "ArrowRight" && hasMultiple) {
        setIndex((current) => (current + 1) % images.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, hasMultiple, images.length]);

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const imageClassName =
    "mx-auto block max-h-[min(70vh,32rem)] w-full cursor-pointer object-contain transition-opacity hover:opacity-95";

  const lightbox =
    lightboxOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Full size image"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {hasMultiple ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goNext();
                  }}
                  className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <span className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  {index + 1}/{images.length}
                </span>
              </>
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeImageUrl(images[index].url, true)}
              alt=""
              className="max-h-[calc(100dvh-2rem)] max-w-full object-contain"
              decoding="async"
              referrerPolicy="no-referrer"
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body,
        )
      : null;

  if (images.length === 0) {
    return null;
  }

  if (!hasMultiple) {
    return (
      <>
        <div className={cn("relative mt-3 bg-black", className)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={normalizeImageUrl(images[0].url)}
            alt=""
            className={imageClassName}
            decoding="async"
            referrerPolicy="no-referrer"
            onClick={openLightbox}
          />
        </div>
        {lightbox}
      </>
    );
  }

  return (
    <>
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
            } else if (Math.abs(delta) < 10) {
              openLightbox();
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
                  className={imageClassName}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onClick={openLightbox}
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
      {lightbox}
    </>
  );
}
