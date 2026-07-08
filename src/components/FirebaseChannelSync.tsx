"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeedContext } from "@/components/FeedProvider";

export function FirebaseChannelSync() {
  const { firebaseConfigured, firebaseSyncActive, channelsSyncError, channelsStorageDescription } =
    useFeedContext();

  if (!firebaseConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cloud sync</CardTitle>
          <CardDescription>
            Add Firebase settings in <code className="text-xs">.env.local</code> to sync your
            personal channel list across devices. No sign-in needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
            <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
            <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
            <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
            <li>NEXT_PUBLIC_FIREBASE_SYNC_KEY</li>
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cloud sync</CardTitle>
        <CardDescription>{channelsStorageDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {channelsSyncError ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            {channelsSyncError}
          </div>
        ) : firebaseSyncActive ? (
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <Check className="h-4 w-4" />
            <span>Firebase sync is active for your personal list.</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Channels are saved locally on this device. Set up Firestore in the Firebase console to
            enable cloud sync.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
