import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { normalizeChannels } from "@/lib/storage";
import { defaultChannels } from "@/data/channels";
import type { Channel } from "@/types";
import { getFirebaseDb } from "@/lib/firebase/client";
import { getFirebaseSyncKey } from "@/lib/firebase/config";

const PERSONAL_COLLECTION = "personal";

export interface RemoteChannelsSnapshot {
  channels: Channel[];
  updatedAt: number;
}

function personalDocRef() {
  const syncKey = getFirebaseSyncKey();
  const db = getFirebaseDb();
  if (!db || !syncKey) {
    return null;
  }

  return doc(db, PERSONAL_COLLECTION, syncKey);
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
  onChange: (snapshot: RemoteChannelsSnapshot) => void,
  onError?: (error: Error) => void,
): Unsubscribe | null {
  const ref = personalDocRef();
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
        channels: normalizeChannels(data.channels, defaultChannels),
        updatedAt: getRemoteUpdatedAt(data.updatedAt),
      });
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function saveRemoteChannels(
  channels: Channel[],
): Promise<{ ok: true; updatedAt: number } | { ok: false; error: string }> {
  const ref = personalDocRef();
  if (!ref) {
    return { ok: false, error: "Firebase is not configured." };
  }

  try {
    await setDoc(ref, {
      channels: channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        category: channel.category,
        ...(channel.avatarUrl ? { avatarUrl: channel.avatarUrl } : {}),
      })),
      updatedAt: serverTimestamp(),
    });

    return { ok: true, updatedAt: Date.now() };
  } catch {
    return { ok: false, error: "Could not save channels to Firebase." };
  }
}
