"use client";

import { useState } from "react";
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
  triggerVariant?: "default" | "outline" | "ghost";
  triggerSize?: "default" | "sm";
  onAdded?: () => void;
}

export function AddPostsChannelModal({
  open: openProp,
  onOpenChange,
  showTrigger = true,
  triggerLabel = "Add channel",
  triggerVariant = "default",
  triggerSize = "default",
  onAdded,
}: AddPostsChannelModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button type="button" variant={triggerVariant} size={triggerSize}>
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
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
