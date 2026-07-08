import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function VideoCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="overflow-hidden">
      <div className={cn("animate-pulse bg-muted/40", compact ? "aspect-[4/3]" : "aspect-video")} />
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted/40" />
          <div className="h-4 w-24 rounded bg-muted/40" />
        </div>
        <div className="h-5 w-full rounded bg-muted/40" />
        <div className="h-4 w-32 rounded bg-muted/40" />
      </div>
    </Card>
  );
}

export function VideoGridSkeleton({ count = 6, compact = false }: { count?: number; compact?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <VideoCardSkeleton key={index} compact={compact} />
      ))}
    </div>
  );
}

export function ChannelCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex animate-pulse items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-muted/40" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-32 rounded bg-muted/40" />
          <div className="h-4 w-48 rounded bg-muted/40" />
          <div className="h-4 w-24 rounded bg-muted/40" />
        </div>
      </div>
    </Card>
  );
}
