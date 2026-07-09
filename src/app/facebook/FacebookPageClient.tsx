"use client";

import { FacebookFeed } from "@/components/FacebookFeed";
import { Header } from "@/components/Header";

export function FacebookPageClient() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header title="Facebook" />
      <p className="border-b border-border px-4 pb-3 text-xs text-muted-foreground">
        Latest posts from your followed pages
      </p>
      <main className="flex-1">
        <FacebookFeed />
      </main>
    </div>
  );
}
