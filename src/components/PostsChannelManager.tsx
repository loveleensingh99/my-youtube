"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddPostsChannelModal } from "@/components/AddPostsChannelModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostsChannels } from "@/hooks/usePostsChannels";

interface PostsChannelManagerProps {
  onChanged?: () => void;
}

export function PostsChannelManager({ onChanged }: PostsChannelManagerProps) {
  const { postsChannels, removePostsChannel } = usePostsChannels();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>Posts channels</CardTitle>
        <AddPostsChannelModal onAdded={onChanged} />
      </CardHeader>
      <CardContent>
        {postsChannels.length > 0 ? (
          <ul className="space-y-2">
            {postsChannels.map((channel) => (
              <li
                key={channel.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{channel.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {channel.handle ? `@${channel.handle}` : channel.id}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    removePostsChannel(channel.id);
                    toast.message(`${channel.name} removed`);
                    onChanged?.();
                  }}
                  aria-label={`Remove ${channel.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No posts channels yet. Add one like youtube.com/@chdlife/posts to start.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
