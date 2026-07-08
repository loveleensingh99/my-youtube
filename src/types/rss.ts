export interface RSSItem {
  id: string;
  title: string;
  link: string;
  published: string;
  author: string;
  thumbnailUrl: string;
  description?: string;
  durationSeconds?: number;
}

export interface RSSFeed {
  title: string;
  link: string;
  items: RSSItem[];
}
