export function ShortCardSkeleton() {
  return (
    <div className="animate-pulse min-w-0">
      <div className="aspect-[9/16] rounded-xl bg-secondary" />
      <div className="mt-2 space-y-1.5 px-0.5">
        <div className="h-3 w-full rounded bg-secondary" />
        <div className="h-3 w-2/3 rounded bg-secondary" />
        <div className="h-2.5 w-1/2 rounded bg-secondary" />
      </div>
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-secondary" />
      <div className="flex gap-3 px-3 py-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full rounded bg-secondary" />
          <div className="h-3 w-2/3 rounded bg-secondary" />
        </div>
      </div>
    </div>
  );
}

export function VideoGridSkeleton({
  count = 4,
  shortsOnly = false,
}: {
  count?: number;
  shortsOnly?: boolean;
}) {
  if (shortsOnly) {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-4 px-2 py-2">
        {Array.from({ length: count }).map((_, index) => (
          <ShortCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {Array.from({ length: count }).map((_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ChannelCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border p-4">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-secondary" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-32 rounded bg-secondary" />
          <div className="h-4 w-48 rounded bg-secondary" />
          <div className="h-4 w-24 rounded bg-secondary" />
        </div>
      </div>
    </div>
  );
}
