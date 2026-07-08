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

function personalDocRef() {
  const syncKey = getFirebaseSyncKey();
  const db = getFirebaseDb();
  if (!db || !syncKey) {
    return null;
  }

  return doc(db, PERSONAL_COLLECTION, syncKey);
}

export function mergeChannels(existing: Channel[], incoming: Channel[]): Channel[] {
  const merged = new Map(existing.map((channel) => [channel.id, channel]));

  for (const channel of incoming) {
    merged.set(channel.id, channel);
  }

  return Array.from(merged.values());
}

export function subscribeRemoteChannels(
  onChange: (channels: Channel[]) => void,
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
        onChange([]);
        return;
      }

      const data = snapshot.data();
      onChange(normalizeChannels(data.channels, defaultChannels));
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function saveRemoteChannels(
  channels: Channel[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ref = personalDocRef();
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
        })),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save channels to Firebase." };
  }
}
