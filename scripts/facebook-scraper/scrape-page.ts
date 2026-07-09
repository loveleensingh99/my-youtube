import type { Page } from "playwright";
import type { FacebookPageConfig } from "../../src/types/facebook";
import { logger } from "./logger";

export interface ScrapedFacebookPost {
  postId: string;
  postUrl: string;
  caption: string;
  imageUrl: string;
  createdTime: string;
}

const MAX_POSTS_PER_PAGE = 12;
const SCROLL_ATTEMPTS = 6;

function getPostsUrl(pageUrl: string): string {
  const base = pageUrl.replace(/\/$/, "");
  if (base.endsWith("/posts")) {
    return base;
  }
  return `${base}/posts`;
}

function normalizePostId(rawId: string): string {
  return rawId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function extractPostIdFromUrl(url: string): string | null {
  const patterns = [
    /\/posts\/(?:pfbid)?([a-zA-Z0-9_-]+)/,
    /story_fbid=(\d+)/,
    /\/permalink\/(\d+)/,
    /\/videos\/(\d+)/,
    /\/photos\/(?:a\.\d+\/)?(\d+)/,
    /fbid=(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return normalizePostId(match[1]);
    }
  }

  return null;
}

function parseRelativeTime(label: string): string {
  const now = new Date();
  const normalized = label.trim().toLowerCase();

  const minuteMatch = normalized.match(/(\d+)\s*m(?:in(?:ute)?s?)?/);
  if (minuteMatch) {
    now.setMinutes(now.getMinutes() - Number(minuteMatch[1]));
    return now.toISOString();
  }

  const hourMatch = normalized.match(/(\d+)\s*h(?:ou?rs?)?/);
  if (hourMatch) {
    now.setHours(now.getHours() - Number(hourMatch[1]));
    return now.toISOString();
  }

  const dayMatch = normalized.match(/(\d+)\s*d(?:ays?)?/);
  if (dayMatch) {
    now.setDate(now.getDate() - Number(dayMatch[1]));
    return now.toISOString();
  }

  if (normalized.includes("just now") || normalized === "now") {
    return now.toISOString();
  }

  if (normalized.includes("yesterday")) {
    now.setDate(now.getDate() - 1);
    return now.toISOString();
  }

  const parsed = new Date(label);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return now.toISOString();
}

async function dismissCookieBanner(page: Page): Promise<void> {
  const selectors = [
    'button[data-cookiebanner="accept_button"]',
    'button[title="Allow all cookies"]',
    'button:has-text("Allow all cookies")',
    'button:has-text("Accept All")',
  ];

  for (const selector of selectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1500 }).catch(() => false)) {
      await button.click({ timeout: 3000 }).catch(() => undefined);
      break;
    }
  }
}

async function scrollFeed(page: Page): Promise<void> {
  for (let index = 0; index < SCROLL_ATTEMPTS; index += 1) {
    await page.mouse.wheel(0, 1800);
    await page.waitForTimeout(1200);
  }
}

export async function scrapeFacebookPage(
  page: Page,
  pageConfig: FacebookPageConfig,
): Promise<ScrapedFacebookPost[]> {
  const targetUrl = getPostsUrl(pageConfig.url);

  logger.info("Scraping Facebook page", {
    pageId: pageConfig.pageId,
    pageName: pageConfig.pageName,
    url: targetUrl,
  });

  await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await dismissCookieBanner(page);

  await page
    .waitForSelector('[role="article"], [data-pagelet="ProfileTimeline"]', {
      timeout: 15_000,
    })
    .catch(() => undefined);

  await page.waitForTimeout(3000);
  await scrollFeed(page);

  const pageTitle = await page.title();
  if (
    /log in|login|sign up/i.test(pageTitle) ||
    (await page.locator('input[name="email"]').count()) > 0
  ) {
    logger.warn("Facebook login page detected — run: npm run facebook:login", {
      pageId: pageConfig.pageId,
    });
    return [];
  }

  const posts = await page.evaluate(
    ({ pageId, maxPosts }) => {
      const results = [];
      const seen = new Set();
      const patterns = [
        /\/posts\/pfbid[a-zA-Z0-9_-]+/,
        /\/posts\/(?:pfbid)?([a-zA-Z0-9_-]+)/,
        /story_fbid=(\d+)/,
        /\/permalink\/(\d+)/,
        /\/videos\/(\d+)/,
        /\/photos\/(?:a\.\d+\/)?(\d+)/,
        /fbid=(\d+)/,
      ];

      const articles = Array.from(
        document.querySelectorAll('[role="article"]'),
      );

      for (const article of articles) {
        if (results.length >= maxPosts) {
          break;
        }

        const links = Array.from(
          article.querySelectorAll(
            'a[href*="/posts/"], a[href*="story_fbid"], a[href*="/permalink/"], a[href*="/videos/"], a[href*="/photos/"], a[href*="pfbid"]',
          ),
        );

        let href = "";
        let postId = null;

        for (const link of links) {
          const candidate = (link as HTMLAnchorElement)?.href ?? "";
          if (!candidate) {
            continue;
          }

          const pfbidMatch = candidate.match(/\/posts\/(pfbid[a-zA-Z0-9_-]+)/);
          if (pfbidMatch?.[1]) {
            href = candidate;
            postId = pfbidMatch[1].replace(/[^a-zA-Z0-9_-]/g, "_");
            break;
          }

          for (const pattern of patterns) {
            const match = candidate.match(pattern);
            if (match?.[1]) {
              href = candidate;
              postId = match[1].replace(/[^a-zA-Z0-9_-]/g, "_");
              break;
            }
          }

          if (postId) {
            break;
          }
        }

        if (!postId || seen.has(postId)) {
          continue;
        }

        const captionNode =
          article.querySelector('[data-ad-preview="message"]') ??
          article.querySelector('[data-ad-comet-preview="message"]') ??
          article.querySelector(
            'div[data-ad-rendering-role="story_message"]',
          ) ??
          article.querySelector('div[dir="auto"]');

        const caption = captionNode?.textContent?.trim() ?? "";

        const image =
          article.querySelector('img[src*="scontent"]') ??
          article.querySelector('img[src*="fbcdn"]');

        const imageUrl = (image as HTMLImageElement)?.src ?? "";

        const timeNode =
          article.querySelector("abbr[aria-label]") ??
          article.querySelector("a[aria-label][role='link']") ??
          article.querySelector("a[role='link'] span");

        const createdTime =
          timeNode?.getAttribute("aria-label")?.trim() ||
          timeNode?.textContent?.trim() ||
          new Date().toISOString();

        const postUrl =
          href || `https://www.facebook.com/${pageId}/posts/${postId}`;

        seen.add(postId);
        results.push({
          postId,
          postUrl,
          caption,
          imageUrl,
          createdTime,
        });
      }

      return results;
    },
    { pageId: pageConfig.pageId, maxPosts: MAX_POSTS_PER_PAGE },
  );

  const normalizedPosts = posts
    .map((post) => ({
      ...post,
      postId: normalizePostId(post.postId),
      createdTime: parseRelativeTime(post.createdTime),
      postUrl:
        post.postUrl ||
        `https://www.facebook.com/${pageConfig.pageId}/posts/${post.postId}`,
    }))
    .filter((post) => post.postId);

  logger.info("Extracted Facebook posts", {
    pageId: pageConfig.pageId,
    count: normalizedPosts.length,
  });

  if (normalizedPosts.length === 0) {
    logger.warn("No posts found for Facebook page", {
      pageId: pageConfig.pageId,
      pageName: pageConfig.pageName,
      hint: "Run: npm run facebook:login — then add FACEBOOK_AUTH_PATH=facebook-auth.json to .env.local",
    });
  }

  return normalizedPosts;
}

export function buildPostDocument(
  pageConfig: FacebookPageConfig,
  scraped: ScrapedFacebookPost,
  imageUrl: string,
): {
  pageId: string;
  pageName: string;
  postId: string;
  postUrl: string;
  caption: string;
  imageUrl: string;
  createdTime: string;
  scrapedAt: string;
  source: "facebook";
} {
  return {
    pageId: pageConfig.pageId,
    pageName: pageConfig.pageName,
    postId: scraped.postId,
    postUrl: scraped.postUrl,
    caption: scraped.caption,
    imageUrl,
    createdTime: scraped.createdTime,
    scrapedAt: new Date().toISOString(),
    source: "facebook",
  };
}

// Keep helper exported for tests and future URL parsing reuse.
export { extractPostIdFromUrl, normalizePostId };
