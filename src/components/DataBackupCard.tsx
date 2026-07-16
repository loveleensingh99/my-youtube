"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useFeedContext } from "@/components/FeedProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostsChannels } from "@/hooks/usePostsChannels";
import {
  createBackup,
  downloadBackup,
  parseBackupFile,
  summarizeImport,
} from "@/lib/backup";

export function DataBackupCard() {
  const { channels, importChannels, refresh } = useFeedContext();
  const { postsChannels, importPostsChannels } = usePostsChannels();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const backup = createBackup(channels, postsChannels);
    downloadBackup(backup);
    toast.message(
      `Exported ${backup.subscriptions.length} subscription${backup.subscriptions.length === 1 ? "" : "s"} and ${backup.posts.length} posts channel${backup.posts.length === 1 ? "" : "s"}`,
    );
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setImporting(true);

    try {
      const text = await file.text();
      let parsed: unknown;

      try {
        parsed = JSON.parse(text);
      } catch {
        toast.error("Could not read that file. Choose a valid JSON backup.");
        return;
      }

      const result = parseBackupFile(parsed);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const subscriptions = importChannels(result.backup.subscriptions);
      const posts = importPostsChannels(result.backup.posts);
      const summary = summarizeImport(subscriptions, posts);
      const totalAdded = summary.subscriptionsAdded + summary.postsAdded;
      const totalSkipped = summary.subscriptionsSkipped + summary.postsSkipped;

      if (totalAdded === 0) {
        toast.message(
          totalSkipped > 0
            ? "Nothing new to import — everything was already in your lists."
            : "Backup file had no channels to import.",
        );
        return;
      }

      toast.message(
        `Imported ${summary.subscriptionsAdded} subscription${summary.subscriptionsAdded === 1 ? "" : "s"} and ${summary.postsAdded} posts channel${summary.postsAdded === 1 ? "" : "s"}${totalSkipped > 0 ? ` (${totalSkipped} already present)` : ""}`,
      );
      void refresh();
    } catch {
      toast.error("Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup</CardTitle>
        <CardDescription>
          Export subscriptions and posts channels from Firebase to a JSON file, or import a backup
          to merge into your cloud lists. Existing channels are never removed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button type="button" variant="outline" onClick={handleImportClick} disabled={importing}>
          <Upload className="h-4 w-4" />
          {importing ? "Importing…" : "Import"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => void handleImportFile(event)}
        />
      </CardContent>
    </Card>
  );
}
