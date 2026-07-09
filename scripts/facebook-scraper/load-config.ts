import { readFile } from "node:fs/promises";
import path from "node:path";
import type { FacebookPageConfig } from "../../src/types/facebook";
import { logger } from "./logger";

export async function loadFacebookPagesConfig(): Promise<FacebookPageConfig[]> {
  const configPath = path.join(process.cwd(), "data", "facebook-pages.json");
  const raw = await readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as FacebookPageConfig[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("facebook-pages.json must contain at least one page");
  }

  const pages = parsed.filter(
    (page) =>
      typeof page.pageId === "string" &&
      page.pageId.trim() &&
      typeof page.pageName === "string" &&
      page.pageName.trim() &&
      typeof page.url === "string" &&
      page.url.trim(),
  );

  if (pages.length === 0) {
    throw new Error("No valid Facebook pages found in facebook-pages.json");
  }

  logger.info("Loaded Facebook pages configuration", { count: pages.length });
  return pages;
}
