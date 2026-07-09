"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddPostsChannelForm } from "@/components/AddPostsChannelForm";

interface AddPostsChannelModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  triggerLabel?: string;
  onAdded?: () => void;
}

export function AddPostsChannelModal({
  open,
  onOpenChange,
  showTrigger = true,
  triggerLabel = "Add channel",
  onAdded,
}: AddPostsChannelModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button type="button">
            <Plus className="h-4 w-4" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a posts channel</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Add channels whose community posts you want to follow. This list is separate from your
          video subscriptions.
        </p>
        <AddPostsChannelForm
          onAdded={onAdded}
          onSuccess={() => onOpenChange?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
