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
];

/** @deprecated Use defaultChannels or channels from useChannels / FeedContext */
export const channels = defaultChannels;
