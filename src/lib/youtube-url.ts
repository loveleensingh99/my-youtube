const CHANNEL_ID_PATTERN = /^UC[\w-]{22}$/;

export function isValidChannelId(value: string): boolean {
  return CHANNEL_ID_PATTERN.test(value);
}

export function extractChannelIdFromUrl(input: string): string | null {
  const trimmed = input.trim();

  if (isValidChannelId(trimmed)) {
    return trimmed;
  }

  const url = !trimmed.startsWith("http")
    ? trimmed.startsWith("@")
      ? `https://www.youtube.com/${trimmed}`
      : `https://www.youtube.com/@${trimmed}`
    : trimmed;

  const channelPathMatch = url.match(/youtube\.com\/channel\/(UC[\w-]{22})/i);
  if (channelPathMatch?.[1]) {
    return channelPathMatch[1];
  }

  return null;
}

export function extractHandleFromUrl(input: string): string | null {
  const trimmed = input.trim();

  if (trimmed.startsWith("@")) {
    return trimmed.slice(1);
  }

  const url = trimmed;
  if (!url.startsWith("http")) {
    return trimmed.includes("/") ? null : trimmed;
  }

  const handleMatch = url.match(/youtube\.com\/@([\w.-]+)/i);
  return handleMatch?.[1] ?? null;
}

export function sanitizeChannelName(title: string): string {
  return title.replace(/\s*-\s*YouTube\s*$/i, "").trim() || "YouTube Channel";
}
