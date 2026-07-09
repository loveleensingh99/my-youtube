import "./load-env";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { chromium } from "playwright";
import { logger } from "./logger";

const OUTPUT_FILE = process.env.FACEBOOK_AUTH_PATH?.trim() || "facebook-auth.json";

async function waitForEnter(prompt: string): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  await new Promise<void>((resolvePromise) => {
    rl.question(prompt, () => {
      rl.close();
      resolvePromise();
    });
  });
}

async function main(): Promise<void> {
  const outputPath = resolve(process.cwd(), OUTPUT_FILE);

  logger.info("Opening Facebook login window", {
    instructions: "Log in manually, then return here and press Enter",
  });

  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
  });
  const page = await context.newPage();

  await page.goto("https://www.facebook.com/", { waitUntil: "domcontentloaded" });

  await waitForEnter(
    "\nAfter you are logged in to Facebook in the browser, press Enter here to save cookies...\n",
  );

  const storageState = await context.storageState();
  writeFileSync(outputPath, JSON.stringify(storageState, null, 2), "utf8");

  await browser.close();

  logger.info("Saved Facebook login session", { outputPath });
  console.log("\nNext steps:");
  console.log(`1. Add this line to .env.local:`);
  console.log(`   FACEBOOK_AUTH_PATH=${OUTPUT_FILE}`);
  console.log("2. Run: npm run scrape:facebook");
  console.log("3. Refresh the Facebook tab in the app\n");
}

main().catch((error) => {
  logger.error("Facebook login helper failed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
