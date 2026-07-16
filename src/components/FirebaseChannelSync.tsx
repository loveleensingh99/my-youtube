"use client";

import { Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { useFeedContext } from "@/components/FeedProvider";
import { usePostsChannels } from "@/hooks/usePostsChannels";

export function FirebaseChannelSync() {
  const { user } = useFirebaseAuthContext();
  const {
    firebaseSyncActive: postsSyncActive,
    channelsStorageDescription: postsStorageDescription,
    isHydrated: postsReady,
  } = usePostsChannels();
  const {
    firebaseConfigured,
    firebaseSyncActive,
    channelsSyncError,
    channelsStorageDescription,
    settingsHydrated,
  } = useFeedContext();

  if (!firebaseConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cloud storage</CardTitle>
          <CardDescription>
            Subscriptions and posts channels are stored only in Firebase. Add the settings below
            in <code className="text-xs">.env.local</code>, then sign in.
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
        <CardTitle>Cloud storage</CardTitle>
        <CardDescription>
          {user
            ? "Your subscriptions and posts channels live in Firebase for this account — not in the browser."
            : "Sign in to load your lists from Firebase."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {channelsSyncError ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            {channelsSyncError}
          </div>
        ) : !settingsHydrated ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading subscriptions from Firebase…</span>
          </div>
        ) : firebaseSyncActive ? (
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <Check className="h-4 w-4" />
            <span>Subscriptions connected to Firebase.</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{channelsStorageDescription}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Posts channels:{" "}
          {!postsReady ? (
            <span>Loading…</span>
          ) : postsSyncActive ? (
            <span className="text-emerald-300">Connected</span>
          ) : (
            postsStorageDescription
          )}
        </p>
      </CardContent>
    </Card>
  );
}
