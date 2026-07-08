"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddChannelModal } from "@/components/AddChannelModal";
import { EditChannelDialog } from "@/components/EditChannelDialog";
import { useFeedContext } from "@/components/FeedProvider";

export function ChannelManager() {
  const { channels, updateChannel, removeChannel, refresh } = useFeedContext();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>Your channels</CardTitle>
        <AddChannelModal />
      </CardHeader>
      <CardContent>
        {channels.length > 0 ? (
          <ul className="space-y-2">
            {channels.map((channel) => (
              <li
                key={channel.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{channel.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {channel.category} · {channel.id}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <EditChannelDialog
                    channel={channel}
                    onSave={(channelId, updates) => {
                      updateChannel(channelId, updates);
                      void refresh();
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      removeChannel(channel.id);
                      toast.message(`${channel.name} removed`);
                      void refresh();
                    }}
                    aria-label={`Remove ${channel.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No channels yet. Add one to start building your feed.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
