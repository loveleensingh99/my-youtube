import type {
  CommunityPost,
  CommunityPostImage,
  CommunityPostPoll,
  CommunityPostVideo,
  PostsChannel,
} from "@/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function pick(value: unknown, ...path: (string | number)[]): unknown {
  let current: unknown = value;

  for (const key of path) {
    if (typeof key === "number") {
      if (!Array.isArray(current)) return undefined;
      current = current[key];
    } else {
      const record = asRecord(current);
      if (!record) return undefined;
      current = record[key];
    }
  }

  return current;
}

/** Reads YouTube's text objects, which are either { simpleText } or { runs: [{ text }] }. */
function extractText(value: unknown): string {
  const record = asRecord(value);
  if (!record) return "";

  if (typeof record.simpleText === "string") {
    return record.simpleText;
  }

  if (Array.isArray(record.runs)) {
    return record.runs
      .map((run) => {
        const text = asRecord(run)?.text;
        return typeof text === "string" ? text : "";
      })
      .join("");
  }

  return "";
}

function normalizeGoogleImageUrl(url: string): string {
  let normalized = url.startsWith("//") ? `https:${url}` : url;

  // YouTube sometimes returns thumbnails ending in "=s" without a size, which 400s.
  if (normalized.endsWith("=s")) {
    normalized = `${normalized}1200`;
  }

  return normalized;
}

function largestThumbnailUrl(value: unknown): string | undefined {
  const thumbnails = pick(value, "thumbnails");
  if (!Array.isArray(thumbnails) || thumbnails.length === 0) return undefined;

  let bestUrl: string | undefined;
  let bestWidth = -1;

  for (const thumb of thumbnails) {
    const record = asRecord(thumb);
    if (!record || typeof record.url !== "string") continue;

    const width = typeof record.width === "number" ? record.width : 0;
    if (width >= bestWidth) {
      bestWidth = width;
      bestUrl = record.url;
    }
  }

  if (!bestUrl) {
    const last = asRecord(thumbnails[thumbnails.length - 1]);
    if (typeof last?.url === "string") {
      bestUrl = last.url;
    }
  }

  return bestUrl ? normalizeGoogleImageUrl(bestUrl) : undefined;
}

function collectByKey(node: unknown, key: string, out: unknown[]): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectByKey(item, key, out);
    }
    return;
  }

  const record = asRecord(node);
  if (!record) return;

  for (const [entryKey, entryValue] of Object.entries(record)) {
    if (entryKey === key && asRecord(entryValue)) {
      out.push(entryValue);
    }
    collectByKey(entryValue, key, out);
  }
}

export function extractYtInitialData(html: string): UnknownRecord | null {
  for (const marker of ['var ytInitialData = ', 'window["ytInitialData"] = ']) {
    const markerIndex = html.indexOf(marker);
    if (markerIndex === -1) continue;

    const jsonStart = markerIndex + marker.length;
    const jsonEnd = html.indexOf(";</script>", jsonStart);
    if (jsonEnd === -1) continue;

    try {
      const parsed: unknown = JSON.parse(html.slice(jsonStart, jsonEnd));
      const record = asRecord(parsed);
      if (record) return record;
    } catch {
      // Try the next marker.
    }
  }

  return null;
}

export function buildPostsPageUrl(channel: Pick<PostsChannel, "id" | "handle">): string {
  return channel.handle
    ? `https://www.youtube.com/@${channel.handle}/posts`
    : `https://www.youtube.com/channel/${channel.id}/posts`;
}

export async function fetchPostsPageData(
  url: string,
  revalidateSeconds?: number,
): Promise<UnknownRecord | null> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
      // Skips the EU consent interstitial so ytInitialData contains the posts.
      Cookie: "SOCS=CAI",
    },
    ...(revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : { cache: "no-store" }),
  });

  if (!response.ok) {
    return null;
  }

  return extractYtInitialData(await response.text());
}

export interface PostsPageChannelInfo {
  id: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
}

export function extractChannelInfo(data: UnknownRecord): PostsPageChannelInfo | null {
  const meta = asRecord(pick(data, "metadata", "channelMetadataRenderer"));
  if (!meta) return null;

  const id = typeof meta.externalId === "string" ? meta.externalId : null;
  if (!id) return null;

  const name = typeof meta.title === "string" && meta.title.trim() ? meta.title.trim() : id;
  const vanityUrl = typeof meta.vanityChannelUrl === "string" ? meta.vanityChannelUrl : "";
  const handleMatch = vanityUrl.match(/@([\w.-]+)/);
  const avatarUrl = largestThumbnailUrl(meta.avatar);

  return {
    id,
    name,
    ...(handleMatch ? { handle: handleMatch[1] } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
  };
}

/**
 * YouTube only exposes relative times ("2 weeks ago") for community posts.
 * Converts them to an approximate timestamp so posts from multiple channels
 * can be interleaved chronologically.
 */
export function estimatePublishedAt(publishedText: string, now = Date.now()): string {
  const match = publishedText.match(
    /(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i,
  );

  if (!match) {
    return new Date(now).toISOString();
  }

  const amount = Number(match[1]);
  const unitMs: Record<string, number> = {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_629_800_000,
    year: 31_557_600_000,
  };

  const offset = amount * (unitMs[match[2].toLowerCase()] ?? 0);
  return new Date(now - offset).toISOString();
}

function parseAttachment(post: UnknownRecord): {
  images: CommunityPostImage[];
  video?: CommunityPostVideo;
  poll?: CommunityPostPoll;
} {
  const attachment = asRecord(post.backstageAttachment);
  if (!attachment) return { images: [] };

  const singleImage = asRecord(attachment.backstageImageRenderer);
  if (singleImage) {
    const url = largestThumbnailUrl(singleImage.image);
    return { images: url ? [{ url }] : [] };
  }

  const multiImage = asRecord(attachment.postMultiImageRenderer);
  if (multiImage && Array.isArray(multiImage.images)) {
    const images = multiImage.images
      .map((entry): CommunityPostImage | null => {
        const url = largestThumbnailUrl(pick(entry, "backstageImageRenderer", "image"));
        return url ? { url } : null;
      })
      .filter((image): image is CommunityPostImage => image !== null);
    return { images };
  }

  const videoRenderer = asRecord(attachment.videoRenderer);
  if (videoRenderer && typeof videoRenderer.videoId === "string") {
    return {
      images: [],
      video: {
        videoId: videoRenderer.videoId,
        title: extractText(videoRenderer.title) || "Watch video",
        thumbnailUrl: largestThumbnailUrl(videoRenderer.thumbnail),
      },
    };
  }

  const pollRenderer = asRecord(attachment.pollRenderer);
  if (pollRenderer && Array.isArray(pollRenderer.choices)) {
    const choices = pollRenderer.choices
      .map((choice) => {
        const text = extractText(pick(choice, "text"));
        const imageUrl = largestThumbnailUrl(pick(choice, "image"));
        return text ? { text, ...(imageUrl ? { imageUrl } : {}) } : null;
      })
      .filter((choice): choice is { text: string; imageUrl?: string } => choice !== null);

    if (choices.length > 0) {
      const totalVotes = extractText(pollRenderer.totalVotes);
      return {
        images: [],
        poll: { choices, ...(totalVotes ? { totalVotes } : {}) },
      };
    }
  }

  return { images: [] };
}

export function extractCommunityPosts(
  data: UnknownRecord,
  channel: PostsChannel,
): CommunityPost[] {
  const renderers: unknown[] = [];
  collectByKey(data, "backstagePostRenderer", renderers);

  const posts: CommunityPost[] = [];
  const seen = new Set<string>();

  for (const renderer of renderers) {
    const post = asRecord(renderer);
    if (!post || typeof post.postId !== "string" || seen.has(post.postId)) continue;
    seen.add(post.postId);

    const text = extractText(post.contentText);
    const publishedText = extractText(post.publishedTimeText) || "recently";
    const likeCount = extractText(post.voteCount);
    const commentCount = extractText(
      pick(
        post,
        "actionButtons",
        "commentActionButtonsRenderer",
        "replyButton",
        "buttonRenderer",
        "text",
      ),
    );
    const { images, video, poll } = parseAttachment(post);

    if (!text && images.length === 0 && !video && !poll) continue;

    posts.push({
      id: post.postId,
      channelId: channel.id,
      channelName: channel.name,
      channelHandle: channel.handle,
      channelAvatarUrl: channel.avatarUrl,
      text,
      publishedText,
      publishedAtEstimate: estimatePublishedAt(publishedText),
      ...(likeCount ? { likeCount } : {}),
      ...(commentCount ? { commentCount } : {}),
      images,
      ...(video ? { video } : {}),
      ...(poll ? { poll } : {}),
      url: `https://www.youtube.com/post/${post.postId}`,
    });
  }

  return posts;
}
