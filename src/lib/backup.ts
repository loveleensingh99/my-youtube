import { normalizePostsChannels, normalizeRemoteChannels } from "@/lib/storage";
import type { Channel, PostsChannel } from "@/types";
import {
  BACKUP_VERSION,
  type BackupImportResult,
  type LumenBackup,
} from "@/types/backup";

export { BACKUP_VERSION };
export type { BackupImportResult, LumenBackup };

export function createBackup(
  subscriptions: Channel[],
  posts: PostsChannel[],
): LumenBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    subscriptions,
    posts,
  };
}

export function serializeBackup(backup: LumenBackup): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

export function downloadBackup(backup: LumenBackup, filename?: string) {
  const blob = new Blob([serializeBackup(backup)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = backup.exportedAt.slice(0, 10);
  anchor.href = url;
  anchor.download = filename ?? `lumen-backup-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Merge incoming records into existing ones by id.
 * Existing entries are kept; duplicates (and duplicate ids within incoming) are skipped.
 */
export function mergeById<T extends { id: string }>(
  existing: T[],
  incoming: T[],
): { merged: T[]; added: number; skipped: number } {
  const ids = new Set(existing.map((item) => item.id));
  const toAdd: T[] = [];

  for (const item of incoming) {
    if (ids.has(item.id)) {
      continue;
    }

    ids.add(item.id);
    toAdd.push(item);
  }

  return {
    merged: toAdd.length > 0 ? [...existing, ...toAdd] : existing,
    added: toAdd.length,
    skipped: incoming.length - toAdd.length,
  };
}

export function parseBackupFile(raw: unknown):
  | { ok: true; backup: LumenBackup }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Backup file must be a JSON object." };
  }

  const data = raw as Record<string, unknown>;

  if (typeof data.version !== "number" || !Number.isFinite(data.version)) {
    return { ok: false, error: "Backup file is missing a valid version field." };
  }

  if (data.version > BACKUP_VERSION) {
    return {
      ok: false,
      error: `This backup (v${data.version}) is newer than this app supports (v${BACKUP_VERSION}). Update the app and try again.`,
    };
  }

  if (data.version < 1) {
    return { ok: false, error: "Backup file version is not supported." };
  }

  if (!("subscriptions" in data) || !("posts" in data)) {
    return {
      ok: false,
      error: 'Backup file must include both "subscriptions" and "posts" arrays.',
    };
  }

  if (!Array.isArray(data.subscriptions) || !Array.isArray(data.posts)) {
    return {
      ok: false,
      error: 'Backup "subscriptions" and "posts" must be arrays.',
    };
  }

  const subscriptions = normalizeRemoteChannels(data.subscriptions);
  const posts = normalizePostsChannels(data.posts, []);

  if (data.subscriptions.length > 0 && subscriptions.length === 0) {
    return {
      ok: false,
      error: "No valid subscriptions found in the backup file.",
    };
  }

  if (data.posts.length > 0 && posts.length === 0) {
    return {
      ok: false,
      error: "No valid posts channels found in the backup file.",
    };
  }

  return {
    ok: true,
    backup: {
      version: data.version,
      exportedAt:
        typeof data.exportedAt === "string" && data.exportedAt.trim()
          ? data.exportedAt
          : new Date().toISOString(),
      subscriptions,
      posts,
    },
  };
}

export function summarizeImport(
  subscriptions: { added: number; skipped: number },
  posts: { added: number; skipped: number },
): BackupImportResult {
  return {
    subscriptionsAdded: subscriptions.added,
    subscriptionsSkipped: subscriptions.skipped,
    postsAdded: posts.added,
    postsSkipped: posts.skipped,
  };
}
