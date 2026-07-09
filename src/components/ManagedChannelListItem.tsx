"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { ChannelAvatar } from "@/components/ChannelAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ManagedChannelListItemProps {
  name: string;
  subtitle: string;
  tag: string;
  avatarUrl?: string;
  editAction: ReactNode;
  onRemove: () => void;
  className?: string;
}

export function ManagedChannelListItem({
  name,
  subtitle,
  tag,
  avatarUrl,
  editAction,
  onRemove,
  className,
}: ManagedChannelListItemProps) {
  const showTag = tag.trim().toLowerCase() !== "general";

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20",
        className,
      )}
    >
      <ChannelAvatar
        channelName={name}
        avatarUrl={avatarUrl}
        size="md"
        rounded="xl"
        className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-zinc-100"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{name}</p>
         
        </div>
        {showTag ? (
            <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-medium">
              {tag}
            </Badge>
          ) : null}
        {/* <p className="truncate text-xs text-muted-foreground">{subtitle}</p> */}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {editAction}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
