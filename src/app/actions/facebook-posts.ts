"use server";

import { FACEBOOK_POSTS_COLLECTION, FACEBOOK_POSTS_PAGE_SIZE } from "@/constants/app";
import type { FacebookPost, FacebookPostsPage } from "@/types/facebook";

function mapDocToPost(id: string, data: Record<string, unknown>): FacebookPost {
  return {
    pageId: String(data.pageId ?? ""),
    pageName: String(data.pageName ?? ""),
    postId: String(data.postId ?? id),
    postUrl: String(data.postUrl ?? ""),
    caption: String(data.caption ?? ""),
    imageUrl: String(data.imageUrl ?? ""),
    createdTime: String(data.createdTime ?? ""),
    scrapedAt: String(data.scrapedAt ?? ""),
    source: "facebook",
  };
}

export async function fetchFacebookPostsAction(
  cursorId: string | null = null,
  pageSize = FACEBOOK_POSTS_PAGE_SIZE,
): Promise<FacebookPostsPage | null> {
  try {
    const { getAdminDb, isFirebaseAdminConfigured } = await import("@/lib/firebase/admin-shared");

    if (!isFirebaseAdminConfigured()) {
      return null;
    }

    const db = getAdminDb();
    const collectionRef = db.collection(FACEBOOK_POSTS_COLLECTION);

    let query = collectionRef.orderBy("createdTime", "desc").limit(pageSize);

    if (cursorId) {
      const cursorDoc = await collectionRef.doc(cursorId).get();
      if (cursorDoc.exists) {
        query = collectionRef
          .orderBy("createdTime", "desc")
          .startAfter(cursorDoc)
          .limit(pageSize);
      }
    }

    const snapshot = await query.get();
    const posts = snapshot.docs.map((doc) => mapDocToPost(doc.id, doc.data()));
    const lastDoc = snapshot.docs.at(-1);

    return {
      posts,
      hasMore: snapshot.docs.length === pageSize,
      lastDocId: lastDoc?.id ?? null,
    };
  } catch {
    return null;
  }
}
