"use client";

import { useState } from "react";
import { Loader2, LogOut, MessageSquareText, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useFeedContext } from "@/components/FeedProvider";
import { ALLOWED_LOGIN_EMAIL, useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePostsChannels } from "@/hooks/usePostsChannels";
import { getFriendlyFirebaseAuthError } from "@/lib/firebase/errors";

export function FirebaseAuthCard() {
  const { configured, user, loading, signInWithEmail, signOutUser } = useFirebaseAuthContext();
  const { channels } = useFeedContext();
  const { postsChannels } = usePostsChannels();
  const [email, setEmail] = useState(ALLOWED_LOGIN_EMAIL);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!configured) {
    return null;
  }

  const handleSignIn = async () => {
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Signed in");
    } catch (error) {
      toast.error(getFriendlyFirebaseAuthError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    try {
      await signOutUser();
      toast.message("Signed out");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        
      </CardHeader>
      <CardContent className="space-y-3">
      <CardDescription>
          Access is restricted to {ALLOWED_LOGIN_EMAIL}. Use this account to sync data.
        </CardDescription>
        {user ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user.email}</span>
            </p>
           
            <Button type="button" variant="outline" onClick={() => void handleSignOut()}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Sign out
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading || submitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                autoComplete="current-password"
                disabled={loading || submitting}
              />
            </div>
            <Button type="button" onClick={() => void handleSignIn()} disabled={loading || submitting}>
              Sign in
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
