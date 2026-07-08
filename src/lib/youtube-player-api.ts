export interface YouTubePlayer {
  destroy(): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getAvailableQualityLevels(): string[];
  getPlaybackQuality(): string;
  setPlaybackQuality(quality: string): void;
  loadVideoById(
    videoIdOrOptions: string | { videoId: string; startSeconds?: number; suggestedQuality?: string },
    startSeconds?: number,
    suggestedQuality?: string,
  ): void;
}

export interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data?: number;
}

export interface YouTubePlayerOptions {
  videoId?: string;
  width?: string | number;
  height?: string | number;
  host?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
    onError?: (event: YouTubePlayerEvent) => void;
    onPlaybackQualityChange?: (event: YouTubePlayerEvent) => void;
  };
}

export interface YouTubePlayerConstructor {
  new (elementId: string | HTMLElement, options: YouTubePlayerOptions): YouTubePlayer;
}

export interface YouTubeIframeApi {
  Player: YouTubePlayerConstructor;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

declare global {
  interface Window {
    YT?: YouTubeIframeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeIframeApi> | null = null;

export function loadYouTubeIframeApi(): Promise<YouTubeIframeApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube IFrame API is only available in the browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        if (window.YT) {
          resolve(window.YT);
        }
      };

      if (!document.getElementById("youtube-iframe-api")) {
        const script = document.createElement("script");
        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }

  return apiPromise;
}

export function formatPlayerTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export const YOUTUBE_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

const QUALITY_LABELS: Record<string, string> = {
  auto: "Auto",
  highres: "4K",
  hd2160: "2160p",
  hd1440: "1440p",
  hd1080: "1080p",
  hd720: "720p",
  large: "480p",
  medium: "360p",
  small: "240p",
  tiny: "144p",
};

const QUALITY_ORDER = [
  "highres",
  "hd2160",
  "hd1440",
  "hd1080",
  "hd720",
  "large",
  "medium",
  "small",
  "tiny",
  "auto",
] as const;

export function getQualityLabel(quality: string): string {
  return QUALITY_LABELS[quality] ?? quality.toUpperCase();
}

export function sortQualities(qualities: string[]): string[] {
  const unique = Array.from(new Set(qualities.filter(Boolean)));
  return unique.sort((a, b) => {
    const aIndex = QUALITY_ORDER.indexOf(a as (typeof QUALITY_ORDER)[number]);
    const bIndex = QUALITY_ORDER.indexOf(b as (typeof QUALITY_ORDER)[number]);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

export function normalizeQualityLevels(levels: string[], currentQuality = "auto"): string[] {
  const filtered = sortQualities(levels.filter((level) => level && level !== "unknown"));
  if (filtered.length > 0) {
    return filtered.includes("auto") ? filtered : ["auto", ...filtered];
  }

  if (currentQuality && currentQuality !== "unknown") {
    return currentQuality === "auto" ? ["auto"] : ["auto", currentQuality];
  }

  return ["auto"];
}
