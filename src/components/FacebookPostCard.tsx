"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FacebookPost } from "@/types/facebook";
import { formatPublishedDate } from "@/utils/date";

interface FacebookPostCardProps {
  post: FacebookPost;
}

export function FacebookPostCard({ post }: FacebookPostCardProps) {
  const publishedLabel = formatPublishedDate(post.createdTime);

  return (
    <article className="overflow-hidden border-b border-border">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{post.pageName}</p>
          <p className="text-xs text-muted-foreground">{publishedLabel}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Open
          </a>
        </Button>
      </div>

      {post.imageUrl ? (
        <div className="relative aspect-[4/3] w-full bg-secondary">
          <Image
            src={post.imageUrl}
            alt={post.caption || `${post.pageName} post`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
            unoptimized={post.imageUrl.includes("fbcdn.net")}
          />
        </div>
      ) : null}

      {post.caption ? (
        <p className="whitespace-pre-wrap px-3 py-3 text-sm leading-relaxed text-foreground/90">
          {post.caption}
        </p>
      ) : (
        <p className="px-3 py-3 text-sm text-muted-foreground">No caption available.</p>
      )}
    </article>
  );
}
