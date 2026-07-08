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
import { AddChannelForm } from "@/components/AddChannelForm";

interface AddChannelModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  triggerLabel?: string;
}

export function AddChannelModal({
  open,
  onOpenChange,
  showTrigger = true,
  triggerLabel = "Add channel",
}: AddChannelModalProps) {
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
          <DialogTitle>Add a channel</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Paste a YouTube channel link, @handle, or channel ID. Search links are not supported.
        </p>
        <AddChannelForm onSuccess={() => onOpenChange?.(false)} />
      </DialogContent>
    </Dialog>
  );
}
