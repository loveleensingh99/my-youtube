import { SHORT_MAX_DURATION_SECONDS } from "@/constants/app";
import type { VideoType } from "@/types";

export interface DetectVideoTypeInput {
  title?: string;
  link?: string;
  durationSeconds?: number;
}

export function detectVideoType({
  title = "",
  link = "",
  durationSeconds,
}: DetectVideoTypeInput): VideoType {
  const normalizedTitle = title.toLowerCase();
  const normalizedLink = link.toLowerCase();

  if (normalizedLink.includes("/shorts/") || normalizedTitle.includes("#shorts")) {
    return "short";
  }

  if (durationSeconds !== undefined && durationSeconds > 0 && durationSeconds <= SHORT_MAX_DURATION_SECONDS) {
    return "short";
  }

  return "video";
}
