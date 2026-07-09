import { doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from "firebase/firestore";
import { normalizePostsChannels } from "@/lib/storage";
import type { PostsChannel } from "@/types";
import { getFirebaseDb } from "@/lib/firebase/client";

const USERS_COLLECTION = "users";

export interface RemotePostsChannelsSnapshot {
  postsChannels: PostsChannel[];
  postsChannelsUpdatedAt: number;
}

function userDocRef(userId: string) {
  const db = getFirebaseDb();
  if (!db || !userId) return null;
  return doc(db, USERS_COLLECTION, userId);
}

function getRemoteUpdatedAt(value: unknown): number {
  if (!value || typeof value !== "object") {
    return 0;
  }

  const updatedAt = (value as { toMillis?: () => number }).toMillis?.();
  return typeof updatedAt === "number" ? updatedAt : 0;
}

export function subscribeRemotePostsChannels(
  userId: string,
  onChange: (snapshot: RemotePostsChannelsSnapshot) => void,
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
        onChange({ postsChannels: [], postsChannelsUpdatedAt: 0 });
        return;
      }

      const data = snapshot.data();
      onChange({
        postsChannels: normalizePostsChannels(data.postsChannels, []),
        postsChannelsUpdatedAt: getRemoteUpdatedAt(data.postsChannelsUpdatedAt),
      });
    },
    (error) => onError?.(error),
  );
}

export async function saveRemotePostsChannels(
  userId: string,
  postsChannels: PostsChannel[],
): Promise<{ ok: true; updatedAt: number } | { ok: false; error: string }> {
  const ref = userDocRef(userId);
  if (!ref) {
    return { ok: false, error: "Firebase is not configured." };
  }

  try {
    await setDoc(
      ref,
      {
        postsChannels: postsChannels.map((channel) => ({
          id: channel.id,
          name: channel.name,
          category: channel.category,
          ...(channel.handle ? { handle: channel.handle } : {}),
          ...(channel.avatarUrl ? { avatarUrl: channel.avatarUrl } : {}),
        })),
        postsChannelsUpdatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { ok: true, updatedAt: Date.now() };
  } catch {
    return { ok: false, error: "Could not save posts channels to Firebase." };
  }
}
