import { format, formatDistanceToNow, isAfter, subHours } from "date-fns";
import { NEW_VIDEO_THRESHOLD_HOURS } from "@/constants/app";

export function formatPublishedDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return format(date, "EEEE, MMMM d, yyyy");
}

export function formatDuration(seconds?: number): string | null {
  if (seconds === undefined || seconds <= 0) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function isNewVideo(dateString: string): boolean {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  return isAfter(date, subHours(new Date(), NEW_VIDEO_THRESHOLD_HOURS));
}

export function formatLastUpdated(dateString: string | null): string {
  if (!dateString) return "Never updated";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Never updated";
  return `Last updated ${formatDistanceToNow(date, { addSuffix: true })}`;
}

export function getCurrentDateLabel(): string {
  return format(new Date(), "EEEE, MMMM d");
}
