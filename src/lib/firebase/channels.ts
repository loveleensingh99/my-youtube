import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { normalizeRemoteChannels } from "@/lib/storage";
import type { Channel } from "@/types";
import { getFirebaseDb } from "@/lib/firebase/client";

const USERS_COLLECTION = "users";

export interface RemoteChannelsSnapshot {
  channels: Channel[];
  updatedAt: number;
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

export function mergeChannels(existing: Channel[], incoming: Channel[]): Channel[] {
  const merged = new Map(existing.map((channel) => [channel.id, channel]));

  for (const channel of incoming) {
    merged.set(channel.id, channel);
  }

  return Array.from(merged.values());
}

export function subscribeRemoteChannels(
  userId: string,
  onChange: (snapshot: RemoteChannelsSnapshot) => void,
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
        onChange({ channels: [], updatedAt: 0 });
        return;
      }

      const data = snapshot.data();
      onChange({
        channels: normalizeRemoteChannels(data.channels),
        updatedAt: getRemoteUpdatedAt(data.updatedAt),
      });
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function saveRemoteChannels(
  userId: string,
  channels: Channel[],
): Promise<{ ok: true; updatedAt: number } | { ok: false; error: string }> {
  const ref = userDocRef(userId);
  if (!ref) {
    return { ok: false, error: "Firebase is not configured." };
  }

  try {
    await setDoc(
      ref,
      {
        channels: channels.map((channel) => ({
          id: channel.id,
          name: channel.name,
          category: channel.category,
          ...(channel.avatarUrl ? { avatarUrl: channel.avatarUrl } : {}),
        })),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { ok: true, updatedAt: Date.now() };
  } catch {
    return { ok: false, error: "Could not save channels to Firebase." };
  }
}

export async function touchRemoteChannelsUpdatedAt(
  userId: string,
): Promise<{ ok: true; updatedAt: number } | { ok: false; error: string }> {
  const ref = userDocRef(userId);
  if (!ref) {
    return { ok: false, error: "Firebase is not configured." };
  }

  try {
    await updateDoc(ref, {
      updatedAt: serverTimestamp(),
    });
    return { ok: true, updatedAt: Date.now() };
  } catch {
    await setDoc(
      ref,
      {
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return { ok: true, updatedAt: Date.now() };
  }
}
