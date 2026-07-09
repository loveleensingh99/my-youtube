import type { FacebookPageConfig } from "../../src/types/facebook";
import { getAdminDb } from "../../src/lib/firebase/admin-shared";
import { logger } from "./logger";
import { buildPostDocument, type ScrapedFacebookPost } from "./scrape-page";
import { uploadImageToStorage } from "./upload-image";

const COLLECTION = "facebook_posts";

export async function saveNewPosts(
  pageConfig: FacebookPageConfig,
  scrapedPosts: ScrapedFacebookPost[],
): Promise<{ saved: number; skipped: number }> {
  const db = getAdminDb();
  let saved = 0;
  let skipped = 0;

  for (const scraped of scrapedPosts) {
    const docRef = db.collection(COLLECTION).doc(scraped.postId);
    const existing = await docRef.get();

    if (existing.exists) {
      skipped += 1;
      continue;
    }

    let imageUrl = scraped.imageUrl;
    if (imageUrl) {
      const uploadedUrl = await uploadImageToStorage(imageUrl, scraped.postId);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const document = buildPostDocument(pageConfig, scraped, imageUrl);
    await docRef.set(document);

    saved += 1;
    logger.info("Saved new Facebook post", {
      pageId: pageConfig.pageId,
      postId: scraped.postId,
    });
  }

  return { saved, skipped };
}
