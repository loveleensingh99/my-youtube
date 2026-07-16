import type { Channel, PostsChannel } from "@/types";

/** Bump when the backup file shape changes in a breaking way. */
export const BACKUP_VERSION = 1;

export interface LumenBackup {
  version: number;
  exportedAt: string;
  subscriptions: Channel[];
  posts: PostsChannel[];
}

export interface BackupImportResult {
  subscriptionsAdded: number;
  subscriptionsSkipped: number;
  postsAdded: number;
  postsSkipped: number;
}
