import { WatchPageClient } from "./WatchPageClient";

interface WatchPageProps {
  params: Promise<{ videoId: string }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;
  return <WatchPageClient videoId={videoId} />;
}
