"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFeedContext } from "@/components/FeedProvider";

export function ChannelManager() {
  const {
    channels,
    addChannelFromInput,
    removeChannel,
    refresh,
    channelsSyncError,
    channelsStorageDescription,
  } = useFeedContext();
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await addChannelFromInput(input, name, category);

    if (!result.ok) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success("Channel added");
    setInput("");
    setName("");
    setCategory("");
    setIsSubmitting(false);
    void refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a channel</CardTitle>
        <CardDescription>
          Paste a YouTube channel link, @handle, or channel ID. Search links are not supported.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-xs text-sky-100">
          {channelsStorageDescription}
        </div>

        {channelsSyncError ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            {channelsSyncError}
          </div>
        ) : null}

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="channel-input">Channel link or ID</Label>
            <Input
              id="channel-input"
              placeholder="https://www.youtube.com/@bekifaayati"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="channel-name">Display name (optional)</Label>
              <Input
                id="channel-name"
                placeholder="Auto-detected from YouTube"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="channel-category">Category (optional)</Label>
              <Input
                id="channel-category"
                placeholder="Education"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add channel
          </Button>
        </form>

        {channels.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Your channels ({channels.length})</h3>
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
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
