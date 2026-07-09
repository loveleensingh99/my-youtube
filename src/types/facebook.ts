export interface FacebookPageConfig {
  pageId: string;
  pageName: string;
  url: string;
}

export interface FacebookPost {
  pageId: string;
  pageName: string;
  postId: string;
  postUrl: string;
  caption: string;
  imageUrl: string;
  createdTime: string;
  scrapedAt: string;
  source: "facebook";
}

export interface FacebookPostsPage {
  posts: FacebookPost[];
  hasMore: boolean;
  lastDocId: string | null;
}
