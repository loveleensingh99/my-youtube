export interface Channel {
  id: string;
  name: string;
  category: string;
  avatarUrl?: string;
}

export interface ChannelWithStats extends Channel {
  latestUpload?: string;
  videoCount: number;
  latestTitle?: string;
}
