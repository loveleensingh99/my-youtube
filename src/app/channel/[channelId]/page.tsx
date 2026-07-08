import { ChannelProfilePageClient } from "./ChannelProfilePageClient";

interface ChannelProfilePageProps {
  params: Promise<{ channelId: string }>;
}

export default async function ChannelProfilePage({ params }: ChannelProfilePageProps) {
  const { channelId } = await params;
  return <ChannelProfilePageClient channelId={channelId} />;
}
