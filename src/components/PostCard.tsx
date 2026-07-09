"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Heart, MessageCircle } from "lucide-react";
import { ChannelAvatar } from "@/components/ChannelAvatar";
import { PostImageCarousel } from "@/components/PostImageCarousel";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import type { CommunityPost } from "@/types";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: CommunityPost;
}

const TEXT_COLLAPSE_THRESHOLD = 220;

function PostText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > TEXT_COLLAPSE_THRESHOLD || text.split("\n").length > 4;

  if (!isLong) {
    return (
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
    );
  }

  return (
    <div className="mt-2">
      <p
        className={cn(
          "whitespace-pre-wrap text-sm leading-relaxed text-foreground",
          !expanded && "line-clamp-3",
        )}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

export function PostCard({ post }: PostCardProps) {
  const channelProfileHref = post.channelId ? `/channel/${post.channelId}` : null;
  const hasMedia = post.images.length > 0 || post.video || post.poll;

  return (
    <article className="border-b border-border py-4">
      <div className="flex gap-3 px-4">
        <ChannelAvatar
          channelName={post.channelName}
          avatarUrl={post.channelAvatarUrl}
          size="md"
          href={channelProfileHref}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {channelProfileHref ? (
                <Link
                  href={channelProfileHref}
                  className="block truncate text-sm font-semibold hover:text-foreground"
                >
                  {post.channelName}
                </Link>
              ) : (
                <p className="truncate text-sm font-semibold">{post.channelName}</p>
              )}
              <p className="text-xs text-muted-foreground">{post.publishedText}</p>
            </div>

            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open post on YouTube"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {post.text ? <PostText text={post.text} /> : null}
        </div>
      </div>

      {post.images.length > 0 ? (
        <PostImageCarousel images={post.images} postId={post.id} />
      ) : null}

      {post.video ? (
        <Link
          href={`/watch/${post.video.videoId}`}
          className="mx-4 mt-3 block overflow-hidden rounded-xl border border-border/60 bg-card/40"
        >
          <div className="relative aspect-video bg-secondary">
            {post.video.thumbnailUrl ? (
              <VideoThumbnail
                videoId={post.video.videoId}
                thumbnailUrl={post.video.thumbnailUrl}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
              />
            ) : null}
          </div>
          <p className="px-3 py-2 text-sm font-medium">{post.video.title}</p>
        </Link>
      ) : null}

      {post.poll ? (
        <div className="mx-4 mt-3 space-y-2 rounded-xl border border-border/60 bg-card/40 p-3">
          {post.poll.choices.map((choice, index) => (
            <div
              key={`${post.id}-poll-${index}`}
              className="rounded-lg border border-border/50 px-3 py-2 text-sm"
            >
              {choice.text}
            </div>
          ))}
          {post.poll.totalVotes ? (
            <p className="text-xs text-muted-foreground">{post.poll.totalVotes}</p>
          ) : null}
        </div>
      ) : null}

      {hasMedia || post.likeCount || post.commentCount ? (
        <div className="mt-3 flex items-center gap-4 px-4 text-xs text-muted-foreground">
          {post.likeCount ? (
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post.likeCount}
            </span>
          ) : null}
          {post.commentCount ? (
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.commentCount}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
