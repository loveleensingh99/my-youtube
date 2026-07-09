export function ShortCardSkeleton() {
  return (
    <div className="min-w-0 animate-pulse">
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

export function LoadMoreVideoSkeleton({ shortsOnly = false }: { shortsOnly?: boolean }) {
  if (shortsOnly) {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-4 px-2 py-2">
        <ShortCardSkeleton />
        <ShortCardSkeleton />
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      <VideoCardSkeleton />
    </div>
  );
}

export function ChannelCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border p-5">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-secondary" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-32 rounded bg-secondary" />
          <div className="h-5 w-20 rounded-full bg-secondary" />
          <div className="h-4 w-full rounded bg-secondary" />
          <div className="h-3 w-24 rounded bg-secondary" />
        </div>
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="animate-pulse px-4 py-4">
      <div className="flex gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-secondary" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-32 rounded bg-secondary" />
          <div className="h-3 w-20 rounded bg-secondary" />
          <div className="h-4 w-full rounded bg-secondary" />
          <div className="h-4 w-5/6 rounded bg-secondary" />
          <div className="aspect-video rounded-xl bg-secondary" />
        </div>
      </div>
    </div>
  );
}

export function PostsPageSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <main className="space-y-6">
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </>
  );
}

export function HeaderSkeleton({ withBack = false }: { withBack?: boolean }) {
  return (
    <div className="sticky top-0 z-20 flex animate-pulse items-center justify-between border-b border-border bg-background px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {withBack ? (
          <div className="h-9 w-9 shrink-0 rounded-full bg-secondary" />
        ) : (
          <div className="h-7 w-7 shrink-0 rounded-md bg-secondary" />
        )}
        <div className="h-5 w-28 rounded bg-secondary" />
      </div>
      <div className="h-9 w-9 shrink-0 rounded-full bg-secondary" />
    </div>
  );
}

export function TagChipsSkeleton() {
  return (
    <div className="flex animate-pulse gap-2 overflow-x-auto px-4 py-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-9 w-20 shrink-0 rounded-full bg-white/10" />
      ))}
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="px-4 pb-3 pt-3">
      <div className="flex animate-pulse rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-9 flex-1 rounded-full bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export function FeedToolbarSkeleton() {
  return (
    <section className="border-b border-white/10 bg-[#0f0f0f]/95">
      <TagChipsSkeleton />
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <FilterBarSkeleton />
    </section>
  );
}

export function HomePageSkeleton({ shortsOnly = false }: { shortsOnly?: boolean }) {
  return (
    <>
      <HeaderSkeleton />
      <FeedToolbarSkeleton />
      <VideoGridSkeleton shortsOnly={shortsOnly} />
    </>
  );
}

export function ChannelManagerSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border/60">
      <div className="flex items-start justify-between gap-3 border-b border-border/40 bg-muted/10 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-secondary" />
            <div className="h-3 w-44 rounded bg-secondary" />
          </div>
        </div>
        <div className="h-8 w-16 rounded-md bg-secondary" />
      </div>
      <div className="divide-y divide-border/50">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3.5">
            <div className="h-9 w-9 rounded-xl bg-secondary" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-secondary" />
              <div className="h-3 w-40 rounded bg-secondary" />
            </div>
            <div className="h-8 w-16 rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChannelsPageSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <main className="space-y-6 px-4 py-4">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <ChannelCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </>
  );
}

export function ChannelProfileHeaderSkeleton() {
  return (
    <section className="animate-pulse border-b border-border px-4 py-6">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 rounded-full bg-secondary" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-40 rounded bg-secondary" />
          <div className="h-5 w-20 rounded-full bg-secondary" />
          <div className="flex gap-3">
            <div className="h-3 w-16 rounded bg-secondary" />
            <div className="h-3 w-16 rounded bg-secondary" />
            <div className="h-3 w-24 rounded bg-secondary" />
          </div>
          <div className="h-3 w-28 rounded bg-secondary" />
        </div>
      </div>
    </section>
  );
}

export function ChannelProfilePageSkeleton({ shortsOnly = false }: { shortsOnly?: boolean }) {
  return (
    <>
      <HeaderSkeleton withBack />
      <ChannelProfileHeaderSkeleton />
      <FilterBarSkeleton />
      <VideoGridSkeleton shortsOnly={shortsOnly} />
    </>
  );
}

export function SettingsCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border">
      <div className="space-y-2 border-b border-border/60 px-6 py-5">
        <div className="h-6 w-24 rounded bg-secondary" />
        <div className="h-4 w-56 rounded bg-secondary" />
      </div>
      <div className="space-y-5 p-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-secondary" />
              <div className="h-3 w-44 rounded bg-secondary" />
            </div>
            <div className="h-6 w-11 rounded-full bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <main className="space-y-6 px-4 py-4">
        <div className="h-24 animate-pulse rounded-2xl bg-secondary" />
        <ChannelManagerSkeleton />
        <ChannelManagerSkeleton />
        <SettingsCardSkeleton />
        <SettingsCardSkeleton />
        <SettingsCardSkeleton />
      </main>
    </>
  );
}

export function WatchPageSkeleton() {
  return (
    <div className="fixed inset-0 z-50 animate-pulse bg-black">
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="h-10 w-10 rounded-full bg-zinc-800" />
        <div className="h-7 w-16 rounded-full bg-zinc-800" />
      </div>

      <div className="flex h-[100dvh] flex-col">
        <div className="min-h-0 flex-1 bg-zinc-900" />
        <div className="shrink-0 bg-black px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full rounded bg-zinc-800" />
              <div className="h-4 w-2/3 rounded bg-zinc-800" />
              <div className="h-3 w-40 rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WatchLoadMoreSkeleton() {
  return (
    <div className="flex h-24 snap-start items-center justify-center px-4">
      <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
    </div>
  );
}

export function WatchPlayerSkeleton() {
  return (
    <div className="absolute inset-0 animate-pulse bg-zinc-900">
      <div className="absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 bg-zinc-800/70" />
    </div>
  );
}
