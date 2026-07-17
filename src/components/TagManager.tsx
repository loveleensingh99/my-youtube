"use client";

import { useMemo, useState } from "react";
import { Pencil, Tags } from "lucide-react";
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
import { ProfileEmptyState, ProfileSection } from "@/components/ProfileSection";
import { useFeedContext } from "@/components/FeedProvider";
import { usePostsChannels } from "@/hooks/usePostsChannels";
import { getChannelTags } from "@/utils/channels";

function RenameTagDialog({
  tag,
  onRename,
}: {
  tag: string;
  onRename: (oldTag: string, newTag: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(tag);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setValue(tag);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Tag name is required.");
      return;
    }
    if (trimmed === tag) {
      setOpen(false);
      return;
    }

    onRename(tag, trimmed);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" aria-label={`Rename ${tag}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rename tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor={`rename-tag-${tag}`}>Tag name</Label>
            <Input
              id={`rename-tag-${tag}`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Finance, News, Education"
              autoFocus
              required
            />
            <p className="text-xs text-muted-foreground">
              Updates this tag on every subscription and posts channel that uses it.
            </p>
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TagManager() {
  const { channels, renameTag: renameFeedTag, refresh } = useFeedContext();
  const { postsChannels, renameTag: renamePostsTag } = usePostsChannels();

  const tags = useMemo(
    () => getChannelTags([...channels, ...postsChannels]),
    [channels, postsChannels],
  );

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const channel of [...channels, ...postsChannels]) {
      const tag = channel.category.trim();
      if (!tag) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return counts;
  }, [channels, postsChannels]);

  const handleRename = (oldTag: string, newTag: string) => {
    const feedChanged = renameFeedTag(oldTag, newTag);
    const postsChanged = renamePostsTag(oldTag, newTag);
    const total = feedChanged + postsChanged;

    if (total === 0) {
      toast.message("No channels used that tag.");
      return;
    }

    toast.success(
      `Renamed “${oldTag}” to “${newTag.trim()}” on ${total} channel${total === 1 ? "" : "s"}`,
    );
    void refresh();
  };

  return (
    <ProfileSection
      id="tags"
      title="Tags"
      description="Rename a tag once to update it across all subscriptions and posts channels."
      icon={<Tags className="h-5 w-5" />}
      count={tags.length}
    >
      {tags.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {tags.map((tag) => (
            <li
              key={tag}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{tag}</p>
                <p className="text-xs text-muted-foreground">
                  {tagCounts.get(tag) ?? 0} channel
                  {(tagCounts.get(tag) ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
              <RenameTagDialog tag={tag} onRename={handleRename} />
            </li>
          ))}
        </ul>
      ) : (
        <ProfileEmptyState
          title="No tags yet"
          description="Tags appear here after you assign them to subscriptions or posts channels."
        />
      )}
    </ProfileSection>
  );
}
