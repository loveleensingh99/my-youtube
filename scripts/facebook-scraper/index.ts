import "./load-env";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, type BrowserContextOptions } from "playwright";
import { loadFacebookPagesConfig } from "./load-config";
import { logger } from "./logger";
import { scrapeFacebookPage } from "./scrape-page";
import { saveNewPosts } from "./save-posts";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function getBrowserContextOptions(): BrowserContextOptions {
  const options: BrowserContextOptions = {
    userAgent: USER_AGENT,
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
  };

  const cookiesJson = process.env.FACEBOOK_COOKIES_JSON?.trim();
  if (cookiesJson) {
    try {
      const cookies = JSON.parse(cookiesJson) as BrowserContextOptions["storageState"];
      options.storageState = cookies;
      logger.info("Loaded Facebook cookies from FACEBOOK_COOKIES_JSON");
    } catch {
      logger.warn("FACEBOOK_COOKIES_JSON is invalid JSON — continuing without cookies");
    }
  } else {
    const authPath = process.env.FACEBOOK_AUTH_PATH?.trim();
    if (authPath) {
      const resolvedPath = resolve(process.cwd(), authPath);
      if (existsSync(resolvedPath)) {
        try {
          options.storageState = JSON.parse(
            readFileSync(resolvedPath, "utf8"),
          ) as BrowserContextOptions["storageState"];
          logger.info("Loaded Facebook session from FACEBOOK_AUTH_PATH", { authPath });
        } catch {
          logger.warn("FACEBOOK_AUTH_PATH file is invalid JSON — continuing without cookies");
        }
      } else {
        logger.warn("FACEBOOK_AUTH_PATH file not found", { authPath: resolvedPath });
      }
    }
  }

  return options;
}

function hasFacebookAuth(): boolean {
  if (process.env.FACEBOOK_COOKIES_JSON?.trim()) {
    return true;
  }

  const authPath = process.env.FACEBOOK_AUTH_PATH?.trim();
  if (!authPath) {
    return false;
  }

  return existsSync(resolve(process.cwd(), authPath));
}

async function main(): Promise<void> {
  const startedAt = Date.now();

  if (!hasFacebookAuth()) {
    logger.error("Facebook login is required (free — uses your own account)", {
      step1: "Run: npm run facebook:login",
      step2: "Log in to Facebook in the browser window",
      step3: "Add to .env.local: FACEBOOK_AUTH_PATH=facebook-auth.json",
      step4: "Run: npm run scrape:facebook",
    });
    process.exitCode = 1;
    return;
  }

  const pages = await loadFacebookPagesConfig();

  logger.info("Starting Facebook scraper", { pages: pages.length });

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let totalSaved = 0;
  let totalSkipped = 0;
  let failedPages = 0;

  try {
    const context = await browser.newContext(getBrowserContextOptions());
    const page = await context.newPage();

    for (const pageConfig of pages) {
      try {
        const scrapedPosts = await scrapeFacebookPage(page, pageConfig);
        const { saved, skipped } = await saveNewPosts(pageConfig, scrapedPosts);
        totalSaved += saved;
        totalSkipped += skipped;
      } catch (error) {
        failedPages += 1;
        logger.error("Failed to scrape Facebook page", {
          pageId: pageConfig.pageId,
          pageName: pageConfig.pageName,
          url: pageConfig.url,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    await context.close();
  } finally {
    await browser.close();
  }

  const durationMs = Date.now() - startedAt;
  logger.info("Facebook scraper finished", {
    totalSaved,
    totalSkipped,
    failedPages,
    durationMs,
  });

  if (failedPages === pages.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  logger.error("Facebook scraper crashed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
