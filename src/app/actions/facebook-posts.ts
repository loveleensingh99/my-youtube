"use server";

import type { DocumentData } from "firebase-admin/firestore";
import { FACEBOOK_POSTS_COLLECTION, FACEBOOK_POSTS_PAGE_SIZE } from "@/constants/app";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin-server";
import type { FacebookPost, FacebookPostsPage } from "@/types/facebook";

function mapDocToPost(id: string, data: DocumentData): FacebookPost {
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
): Promise<FacebookPostsPage> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Download a service account key (Firebase Console → Project settings → Service accounts), save it as firebase-service-account.json in the project root, then add FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json to .env.local and restart the dev server.",
    );
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
}
