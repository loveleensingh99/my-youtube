"use client";

import { ListVideo } from "lucide-react";
import { toast } from "sonner";
import { AddChannelModal } from "@/components/AddChannelModal";
import { EditChannelDialog } from "@/components/EditChannelDialog";
import { ManagedChannelListItem } from "@/components/ManagedChannelListItem";
import { ProfileEmptyState, ProfileSection } from "@/components/ProfileSection";
import { useFeedContext } from "@/components/FeedProvider";

export function ChannelManager() {
  const { channels, updateChannel, removeChannel, refresh } = useFeedContext();

  return (
    <ProfileSection
      id="subscriptions"
      title="Subscriptions"
      description="Channels that appear in your Home feed and Subs list."
      icon={<ListVideo className="h-5 w-5" />}
      count={channels.length}
      action={
        <AddChannelModal
          triggerLabel="Add"
          triggerVariant="outline"
          triggerSize="sm"
        />
      }
    >
      {channels.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {channels.map((channel) => (
            <ManagedChannelListItem
              key={channel.id}
              name={channel.name}
              tag={channel.category}
              subtitle={channel.id}
              avatarUrl={channel.avatarUrl}
              editAction={
                <EditChannelDialog
                  channel={channel}
                  onSave={(channelId, updates) => {
                    updateChannel(channelId, updates);
                    void refresh();
                  }}
                />
              }
              onRemove={() => {
                removeChannel(channel.id);
                toast.message(`${channel.name} removed`);
                void refresh();
              }}
            />
          ))}
        </ul>
      ) : (
        <ProfileEmptyState
          title="No subscriptions yet"
          description="Add YouTube channels to build your personalized video feed."
          action={
            <AddChannelModal
              triggerLabel="Add subscription"
              triggerVariant="default"
              triggerSize="sm"
            />
          }
        />
      )}
    </ProfileSection>
  );
}
