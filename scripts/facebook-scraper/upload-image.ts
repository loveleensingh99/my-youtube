import { getAdminStorage } from "../../src/lib/firebase/admin-shared";
import { logger } from "./logger";

const IMAGE_FETCH_TIMEOUT_MS = 20_000;

export async function uploadImageToStorage(
  imageUrl: string,
  postId: string,
): Promise<string | null> {
  if (!imageUrl) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      logger.warn("Failed to download Facebook image", {
        postId,
        status: response.status,
        imageUrl,
      });
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const extension = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0) {
      logger.warn("Downloaded Facebook image was empty", { postId, imageUrl });
      return null;
    }

    const bucket = getAdminStorage().bucket();
    const objectPath = `facebook-posts/${postId}.${extension}`;
    const file = bucket.file(objectPath);

    await file.save(buffer, {
      metadata: {
        contentType,
        cacheControl: "public,max-age=31536000",
      },
      resumable: false,
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${objectPath}`;

    logger.info("Uploaded Facebook image to Storage", { postId, publicUrl });
    return publicUrl;
  } catch (error) {
    logger.error("Image upload failed", {
      postId,
      imageUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
