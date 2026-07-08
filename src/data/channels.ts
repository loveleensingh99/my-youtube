import type { Channel } from "@/types";

export const defaultChannels: Channel[] = [
  {
    id: "UCdvOCtR3a9ICLAw0DD3DpXg",
    name: "bekifaayati",
    category: "Education",
  },
  {
    id: "UCY6N8zZhs2V7gNTUxPuKWoQ",
    name: "Ishan Sharma",
    category: "Career",
  },
  {
    id: "UCRzYN32xtBf3Yxsx5BvJWJw",
    name: "warikoo",
    category: "Career",
  },
  {
    id: "UCM3Bjfpp_OyOADpFbKr8Msg",
    name: "Daily Post Punjabi",
    category: "General",
  },
];

/** @deprecated Use defaultChannels or channels from useChannels / FeedContext */
export const channels = defaultChannels;
