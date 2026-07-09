"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PostsChannel } from "@/types";

interface EditPostsChannelDialogProps {
  channel: PostsChannel;
  onSave: (channelId: string, updates: Pick<PostsChannel, "name" | "category">) => void;
}

export function EditPostsChannelDialog({ channel, onSave }: EditPostsChannelDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(channel.name);
  const [tag, setTag] = useState(channel.category);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setName(channel.name);
      setTag(channel.category);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedTag = tag.trim() || "General";

    if (!trimmedName) {
      toast.error("Channel name is required.");
      return;
    }

    onSave(channel.id, { name: trimmedName, category: trimmedTag });
    toast.success("Posts channel updated");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" aria-label={`Edit ${channel.name}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit posts channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor={`edit-posts-name-${channel.id}`}>Display name</Label>
            <Input
              id={`edit-posts-name-${channel.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-posts-tag-${channel.id}`}>Tag</Label>
            <Input
              id={`edit-posts-tag-${channel.id}`}
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              placeholder="Finance, News, Education"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
