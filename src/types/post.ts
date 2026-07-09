export interface PostsChannel {
  id: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
}

export interface CommunityPostImage {
  url: string;
  width?: number;
  height?: number;
}

export interface CommunityPostVideo {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
}

export interface CommunityPostPollChoice {
  text: string;
  imageUrl?: string;
}

export interface CommunityPostPoll {
  choices: CommunityPostPollChoice[];
  totalVotes?: string;
}

export interface CommunityPost {
  id: string;
  channelId: string;
  channelName: string;
  channelHandle?: string;
  channelAvatarUrl?: string;
  text: string;
  publishedText: string;
  /** Approximate timestamp derived from YouTube's relative published text, used for sorting. */
  publishedAtEstimate: string;
  likeCount?: string;
  commentCount?: string;
  images: CommunityPostImage[];
  video?: CommunityPostVideo;
  poll?: CommunityPostPoll;
  url: string;
}
