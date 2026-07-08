"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WatchHistoryItem } from "@/types";
import { formatPublishedDate } from "@/utils/date";

interface HistorySectionProps {
  title: string;
  items: WatchHistoryItem[];
  onRemove?: (videoId: string) => void;
}

export function HistorySection({ title, items, onRemove }: HistorySectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.videoId} className="overflow-hidden">
            <Link href={`/watch/${item.videoId}`} className="block">
              <div className="relative aspect-video bg-muted/20">
                <Image
                  src={item.thumbnailUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </Link>
            <CardHeader className="space-y-2 p-4">
              <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {item.channelName} · {formatPublishedDate(item.watchedAt)}
              </p>
            </CardHeader>
            {onRemove ? (
              <CardContent className="p-4 pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.videoId)}
                  aria-label={`Remove ${item.title} from history`}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}

export function BackLink({ href = "/" }: { href?: string }) {
  return (
    <Button asChild variant="ghost" size="sm" className="mb-6">
      <Link href={href}>
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>
    </Button>
  );
}
