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
import { AddChannelForm } from "@/components/AddChannelForm";

interface AddChannelModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost";
  triggerSize?: "default" | "sm";
}

export function AddChannelModal({
  open: openProp,
  onOpenChange,
  showTrigger = true,
  triggerLabel = "Add channel",
  triggerVariant = "default",
  triggerSize = "default",
}: AddChannelModalProps) {
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
          <DialogTitle>Add a channel</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Paste a YouTube channel link, @handle, or channel ID. Search links are not supported.
        </p>
        <AddChannelForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
