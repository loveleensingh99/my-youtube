"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { useFeedContext } from "@/components/FeedProvider";
import { usePostsChannels } from "@/hooks/usePostsChannels";

export function FirebaseChannelSync() {
  const { user } = useFirebaseAuthContext();
  const { firebaseSyncActive: postsSyncActive, channelsStorageDescription: postsStorageDescription } =
    usePostsChannels();
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
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cloud sync</CardTitle>
        <CardDescription>
          {user
            ? "Your lists are tied to your signed-in account."
            : "Sign in above to enable account-based sync."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {channelsSyncError ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            {channelsSyncError}
          </div>
        ) : firebaseSyncActive ? (
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <Check className="h-4 w-4" />
            <span>Subscriptions sync is active.</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{channelsStorageDescription}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Posts channels:{" "}
          {postsSyncActive ? (
            <span className="text-emerald-300">Sync active</span>
          ) : (
            postsStorageDescription
          )}
        </p>
      </CardContent>
    </Card>
  );
}
