"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveChannelFilterProps {
  channelName: string;
  onClear: () => void;
}

export function ActiveChannelFilter({ channelName, onClear }: ActiveChannelFilterProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 pb-3">
      <p className="truncate text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{channelName}</span> only
      </p>
      <Button type="button" variant="ghost" size="sm" onClick={onClear} className="shrink-0">
        <X className="h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}
