import { doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from "firebase/firestore";
import { normalizeMutedKeywords } from "@/lib/storage";
import { getFirebaseDb } from "@/lib/firebase/client";

const USERS_COLLECTION = "users";

export interface RemoteMutedKeywordsSnapshot {
  mutedKeywords: string[];
  mutedKeywordsUpdatedAt: number;
}

function userDocRef(userId: string) {
  const db = getFirebaseDb();
  if (!db || !userId) {
    return null;
  }

  return doc(db, USERS_COLLECTION, userId);
}

function getRemoteUpdatedAt(value: unknown): number {
  if (!value || typeof value !== "object") {
    return 0;
  }

  const updatedAt = (value as { toMillis?: () => number }).toMillis?.();
  return typeof updatedAt === "number" ? updatedAt : 0;
}

export function mutedKeywordsContentKey(keywords: string[]): string {
  return [...keywords]
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join("|");
}

export function subscribeRemoteMutedKeywords(
  userId: string,
  onChange: (snapshot: RemoteMutedKeywordsSnapshot) => void,
  onError?: (error: Error) => void,
): Unsubscribe | null {
  const ref = userDocRef(userId);
  if (!ref) {
    return null;
  }

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange({ mutedKeywords: [], mutedKeywordsUpdatedAt: 0 });
        return;
      }

      const data = snapshot.data();
      onChange({
        mutedKeywords: normalizeMutedKeywords(data.mutedKeywords),
        mutedKeywordsUpdatedAt: getRemoteUpdatedAt(data.mutedKeywordsUpdatedAt),
      });
    },
    (error) => onError?.(error),
  );
}

export async function saveRemoteMutedKeywords(
  userId: string,
  mutedKeywords: string[],
): Promise<{ ok: true; updatedAt: number } | { ok: false; error: string }> {
  const ref = userDocRef(userId);
  if (!ref) {
    return { ok: false, error: "Firebase is not configured." };
  }

  try {
    await setDoc(
      ref,
      {
        mutedKeywords: normalizeMutedKeywords(mutedKeywords),
        mutedKeywordsUpdatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { ok: true, updatedAt: Date.now() };
  } catch {
    return { ok: false, error: "Could not save muted keywords to Firebase." };
  }
}
