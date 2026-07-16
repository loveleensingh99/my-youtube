"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { resolvePostsChannelInput } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/TagInput";
import { usePostsChannels } from "@/hooks/usePostsChannels";
import { useTagSuggestions } from "@/hooks/useTagSuggestions";

interface AddPostsChannelFormProps {
  onSuccess?: () => void;
  onAdded?: () => void;
}

export function AddPostsChannelForm({
  onSuccess,
  onAdded,
}: AddPostsChannelFormProps) {
  const { addPostsChannel, hasPostsChannel } = usePostsChannels();
  const tagSuggestions = useTagSuggestions();
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await resolvePostsChannelInput(input, name, tag);

    if ("error" in result) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    if (hasPostsChannel(result.channel.id)) {
      toast.message(`${result.channel.name} is already in your posts list`);
      setIsSubmitting(false);
      return;
    }

    addPostsChannel(result.channel);
    toast.success("Posts channel added");
    setInput("");
    setName("");
    setTag("");
    setIsSubmitting(false);
    onAdded?.();
    onSuccess?.();
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="posts-channel-input">Channel posts link</Label>
        <Input
          id="posts-channel-input"
          placeholder="https://www.youtube.com/@chdlife/posts"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* <div className="grid gap-2">
          <Label htmlFor="posts-channel-name">Display name (optional)</Label>
          <Input
            id="posts-channel-name"
            placeholder="Auto-detected from YouTube"
            value={name}
            onChange={(event) => setName(event.target.value)}
            
          />
        </div> */}
        <div className="grid gap-2">
          <Label htmlFor="posts-channel-tag">Tag (optional)</Label>
          <TagInput
            id="posts-channel-tag"
            placeholder="Finance, News, Education"
            value={tag}
            onChange={setTag}
            suggestions={tagSuggestions}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Paste a channel posts page like youtube.com/@handle/posts, a channel
        link, or @handle.
      </p>

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
        Add posts channel
      </Button>
    </form>
  );
}
