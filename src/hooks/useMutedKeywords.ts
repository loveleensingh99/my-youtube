"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  mutedKeywordsContentKey,
  saveRemoteMutedKeywords,
  subscribeRemoteMutedKeywords,
} from "@/lib/firebase/muted-keywords";
import { normalizeMutedKeywords, normalizeSettings } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/app";

/** One-time: move any keywords left in local settings into Firebase, then strip them. */
function takeLegacyLocalMutedKeywords(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    const settings = normalizeSettings(parsed);
    const keywords = normalizeMutedKeywords(settings.mutedKeywords);

    if (keywords.length === 0) {
      return [];
    }

    const next = { ...(typeof parsed === "object" && parsed ? parsed : {}), mutedKeywords: [] };
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("focustube:storage", { detail: { key: STORAGE_KEYS.settings } }),
    );

    return keywords;
  } catch {
    return [];
  }
}

export function useMutedKeywords() {
  const { configured: firebaseConfigured, user, loading: authLoading } = useFirebaseAuthContext();
  const [mutedKeywords, setMutedKeywordsState] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const keywordsRef = useRef(mutedKeywords);
  const pendingWritesRef = useRef(0);
  const lastSavedKeyRef = useRef("");
  const hasReceivedRemoteRef = useRef(false);
  const legacyMigratedRef = useRef(false);

  const firebaseEnabled = isFirebaseConfigured() && firebaseConfigured && Boolean(user);

  useEffect(() => {
    keywordsRef.current = mutedKeywords;
  }, [mutedKeywords]);

  const setMutedKeywords = useCallback(
    async (nextInput: string[]) => {
      const next = normalizeMutedKeywords(nextInput);
      setMutedKeywordsState(next);
      keywordsRef.current = next;

      if (!user) {
        return { ok: false as const, error: "Sign in to save muted keywords." };
      }

      pendingWritesRef.current += 1;
      const nextKey = mutedKeywordsContentKey(next);

      try {
        const result = await saveRemoteMutedKeywords(user.uid, next);
        if (!result.ok) {
          setSyncError(result.error);
          return result;
        }

        lastSavedKeyRef.current = nextKey;
        setSyncError(null);
        return result;
      } finally {
        pendingWritesRef.current -= 1;
      }
    },
    [user],
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!firebaseEnabled || !user) {
      hasReceivedRemoteRef.current = false;
      lastSavedKeyRef.current = "";
      setMutedKeywordsState([]);
      setReady(true);
      setSyncError(null);
      return;
    }

    setReady(false);
    setSyncError(null);
    hasReceivedRemoteRef.current = false;

    const timeoutId = window.setTimeout(() => {
      if (!hasReceivedRemoteRef.current) {
        setSyncError("Could not load muted keywords from Firebase.");
        setReady(true);
      }
    }, 8000);

    const unsubscribe = subscribeRemoteMutedKeywords(
      user.uid,
      ({ mutedKeywords: remoteKeywords }) => {
        window.clearTimeout(timeoutId);
        hasReceivedRemoteRef.current = true;

        const remoteKey = mutedKeywordsContentKey(remoteKeywords);

        if (pendingWritesRef.current > 0) {
          setReady(true);
          return;
        }

        if (
          remoteKey === lastSavedKeyRef.current &&
          remoteKey === mutedKeywordsContentKey(keywordsRef.current)
        ) {
          setReady(true);
          setSyncError(null);
          return;
        }

        // Migrate one-time from localStorage if cloud is empty.
        if (!legacyMigratedRef.current && remoteKeywords.length === 0) {
          legacyMigratedRef.current = true;
          const legacy = takeLegacyLocalMutedKeywords();
          if (legacy.length > 0) {
            lastSavedKeyRef.current = "";
            void saveRemoteMutedKeywords(user.uid, legacy).then((result) => {
              if (result.ok) {
                lastSavedKeyRef.current = mutedKeywordsContentKey(legacy);
                setMutedKeywordsState(legacy);
                keywordsRef.current = legacy;
              }
            });
            setReady(true);
            setSyncError(null);
            return;
          }
        }

        legacyMigratedRef.current = true;
        lastSavedKeyRef.current = remoteKey;
        setMutedKeywordsState(remoteKeywords);
        keywordsRef.current = remoteKeywords;
        setReady(true);
        setSyncError(null);
      },
      () => {
        window.clearTimeout(timeoutId);
        setSyncError("Firebase sync is unavailable for muted keywords.");
        setReady(true);
      },
    );

    if (!unsubscribe) {
      window.clearTimeout(timeoutId);
      setSyncError("Firebase is not configured.");
      setReady(true);
      return;
    }

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [authLoading, firebaseEnabled, user]);

  return {
    mutedKeywords,
    setMutedKeywords,
    isHydrated: ready,
    syncError,
    firebaseConfigured,
  };
}
