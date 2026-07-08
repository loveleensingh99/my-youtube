"use client";

import Image from "next/image";
import Link from "next/link";
import { getChannelInitials } from "@/utils/video";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-20 w-20 text-2xl",
} as const;

interface ChannelAvatarProps {
  channelId?: string;
  channelName: string;
  avatarUrl?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
  href?: string | null;
  rounded?: "full" | "xl";
}

export function ChannelAvatar({
  channelName,
  avatarUrl,
  size = "md",
  className,
  href,
  rounded = "full",
}: ChannelAvatarProps) {
  const shapeClass = rounded === "xl" ? "rounded-xl" : "rounded-full";
  const content = avatarUrl ? (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-secondary",
        shapeClass,
        sizeClasses[size],
        className,
      )}
    >
      <Image src={avatarUrl} alt="" fill sizes="80px" className="object-cover" />
    </div>
  ) : (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-secondary font-semibold text-foreground",
        shapeClass,
        sizeClasses[size],
        className,
      )}
      aria-hidden={!href}
    >
      {getChannelInitials(channelName)}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`Open ${channelName} channel page`}>
        {content}
      </Link>
    );
  }

  return content;
}
