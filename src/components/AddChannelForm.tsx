"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/TagInput";
import { useFeedContext } from "@/components/FeedProvider";
import { useTagSuggestions } from "@/hooks/useTagSuggestions";

interface AddChannelFormProps {
  onSuccess?: () => void;
}

export function AddChannelForm({ onSuccess }: AddChannelFormProps) {
  const {
    addChannelFromInput,
    refresh,
    channelsSyncError,
    channelsStorageDescription,
  } = useFeedContext();
  const tagSuggestions = useTagSuggestions();
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await addChannelFromInput(input, name, tag);

    if (!result.ok) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success("Channel added");
    setInput("");
    setName("");
    setTag("");
    setIsSubmitting(false);
    void refresh();
    onSuccess?.();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-xs text-sky-100">
        {channelsStorageDescription}
      </div>

      {channelsSyncError ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
          {channelsSyncError}
        </div>
      ) : null}

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-4"
      >
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
          {/* <div className="grid gap-2">
            <Label htmlFor="channel-name">Display name (optional)</Label>
            <Input
              id="channel-name"
              placeholder="Auto-detected from YouTube"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div> */}
          <div className="grid gap-2">
            <Label htmlFor="channel-tag">Tag (optional)</Label>
            <TagInput
              id="channel-tag"
              placeholder="Finance, News, Education"
              value={tag}
              onChange={setTag}
              suggestions={tagSuggestions}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add channel
        </Button>
      </form>
    </div>
  );
}
