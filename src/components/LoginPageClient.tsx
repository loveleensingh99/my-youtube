"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ALLOWED_LOGIN_EMAIL, useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/constants/app";
import { getFriendlyFirebaseAuthError } from "@/lib/firebase/errors";

export function LoginPageClient() {
  const router = useRouter();
  const { configured, user, loading, signInWithEmail } = useFirebaseAuthContext();
  const [email, setEmail] = useState(ALLOWED_LOGIN_EMAIL);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Logged in");
      router.replace("/");
    } catch (error) {
      toast.error(getFriendlyFirebaseAuthError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Login" />
      <main className="flex flex-1 items-center px-4 py-8">
        <div className="w-full space-y-4">
          <section className="rounded-2xl border border-border/60 bg-linear-to-br from-card/80 via-card/40 to-muted/20 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-background/80">
                <Image src="/icon.svg" alt="" width={28} height={28} className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Welcome back</p>
                <h2 className="text-lg font-semibold tracking-tight">{APP_NAME}</h2>
              </div>
            </div>
          </section>

          <Card className="w-full border-border/60 bg-card/40">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Sign in to continue
              </CardTitle>
              <CardDescription>
                {configured
                  ? "Use your authorized email and password to access your subscriptions and posts."
                  : "Firebase is not configured. Please set Firebase env values first."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={(event) => void handleLogin(event)} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    disabled={!configured || loading || submitting}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    disabled={!configured || loading || submitting}
                    required
                  />
                </div>
                <Button type="submit" disabled={!configured || loading || submitting} className="w-full">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Login
                </Button>
              </form>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                <p className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Authorized email: {ALLOWED_LOGIN_EMAIL}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
