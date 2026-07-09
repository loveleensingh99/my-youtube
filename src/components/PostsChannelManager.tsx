"use client";

import { MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { AddPostsChannelModal } from "@/components/AddPostsChannelModal";
import { EditPostsChannelDialog } from "@/components/EditPostsChannelDialog";
import { ManagedChannelListItem } from "@/components/ManagedChannelListItem";
import { ProfileEmptyState, ProfileSection } from "@/components/ProfileSection";
import { usePostsChannels } from "@/hooks/usePostsChannels";

interface PostsChannelManagerProps {
  onChanged?: () => void;
}

export function PostsChannelManager({ onChanged }: PostsChannelManagerProps) {
  const { postsChannels, removePostsChannel, updatePostsChannel } = usePostsChannels();

  return (
    <ProfileSection
      title="Posts"
      description="Channels whose community posts appear on the Posts tab."
      icon={<MessageSquareText className="h-5 w-5" />}
      count={postsChannels.length}
      action={
        <AddPostsChannelModal
          onAdded={onChanged}
          triggerLabel="Add"
          triggerVariant="outline"
          triggerSize="sm"
        />
      }
    >
      {postsChannels.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {postsChannels.map((channel) => (
            <ManagedChannelListItem
              key={channel.id}
              name={channel.name}
              tag={channel.category}
              subtitle={channel.handle ? `@${channel.handle}` : channel.id}
              avatarUrl={channel.avatarUrl}
              editAction={
                <EditPostsChannelDialog
                  channel={channel}
                  onSave={(channelId, updates) => {
                    updatePostsChannel(channelId, updates);
                    onChanged?.();
                  }}
                />
              }
              onRemove={() => {
                removePostsChannel(channel.id);
                toast.message(`${channel.name} removed`);
                onChanged?.();
              }}
            />
          ))}
        </ul>
      ) : (
        <ProfileEmptyState
          title="No posts channels yet"
          description="Follow community posts from channels like youtube.com/@handle/posts."
          action={
            <AddPostsChannelModal
              onAdded={onChanged}
              triggerLabel="Add posts channel"
              triggerVariant="default"
              triggerSize="sm"
            />
          }
        />
      )}
    </ProfileSection>
  );
}
