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

export function VideoGridSkeleton({ count = 4 }: { count?: number }) {
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
