export function getYoutubeApiKey(clientKey?: string | null): string | null {
  const envKey = process.env.YOUTUBE_API_KEY?.trim();
  if (envKey) return envKey;

  const trimmedClientKey = clientKey?.trim();
  return trimmedClientKey || null;
}

export function isYoutubeApiConfigured(clientKey?: string | null): boolean {
  return Boolean(getYoutubeApiKey(clientKey));
}
