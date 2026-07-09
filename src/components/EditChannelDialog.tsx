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
import { TagInput } from "@/components/TagInput";
import { useTagSuggestions } from "@/hooks/useTagSuggestions";
import type { Channel } from "@/types";

interface EditChannelDialogProps {
  channel: Channel;
  onSave: (channelId: string, updates: Pick<Channel, "name" | "category">) => void;
}

export function EditChannelDialog({ channel, onSave }: EditChannelDialogProps) {
  const tagSuggestions = useTagSuggestions();
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
    toast.success("Channel updated");
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
          <DialogTitle>Edit channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor={`edit-name-${channel.id}`}>Display name</Label>
            <Input
              id={`edit-name-${channel.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-tag-${channel.id}`}>Tag</Label>
            <TagInput
              id={`edit-tag-${channel.id}`}
              value={tag}
              onChange={setTag}
              suggestions={tagSuggestions}
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
