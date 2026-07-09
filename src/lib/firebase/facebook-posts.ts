import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { FACEBOOK_POSTS_COLLECTION, FACEBOOK_POSTS_PAGE_SIZE } from "@/constants/app";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { FacebookPost, FacebookPostsPage } from "@/types/facebook";

function mapDocToPost(docSnapshot: QueryDocumentSnapshot<DocumentData>): FacebookPost {
  const data = docSnapshot.data();
  return {
    pageId: String(data.pageId ?? ""),
    pageName: String(data.pageName ?? ""),
    postId: String(data.postId ?? docSnapshot.id),
    postUrl: String(data.postUrl ?? ""),
    caption: String(data.caption ?? ""),
    imageUrl: String(data.imageUrl ?? ""),
    createdTime: String(data.createdTime ?? ""),
    scrapedAt: String(data.scrapedAt ?? ""),
    source: "facebook",
  };
}

export async function fetchFacebookPostsPage(
  pageSize = FACEBOOK_POSTS_PAGE_SIZE,
  cursorId: string | null = null,
): Promise<FacebookPostsPage> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars.");
  }

  const postsRef = collection(db, FACEBOOK_POSTS_COLLECTION);
  let postsQuery = query(postsRef, orderBy("createdTime", "desc"), limit(pageSize));

  if (cursorId) {
    const cursorSnapshot = await getDoc(doc(db, FACEBOOK_POSTS_COLLECTION, cursorId));
    if (cursorSnapshot.exists()) {
      postsQuery = query(
        postsRef,
        orderBy("createdTime", "desc"),
        startAfter(cursorSnapshot),
        limit(pageSize),
      );
    }
  }

  const snapshot = await getDocs(postsQuery);
  const posts = snapshot.docs.map(mapDocToPost);
  const lastDoc = snapshot.docs.at(-1);

  return {
    posts,
    hasMore: snapshot.docs.length === pageSize,
    lastDocId: lastDoc?.id ?? null,
  };
}
