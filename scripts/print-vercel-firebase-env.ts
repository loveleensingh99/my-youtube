import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const filePath = resolve(process.cwd(), "firebase-service-account.json");

try {
  const json = JSON.parse(readFileSync(filePath, "utf8"));
  console.log("\nCopy this entire line into Vercel as FIREBASE_SERVICE_ACCOUNT_JSON:\n");
  console.log(JSON.stringify(json));
  console.log("\nThen redeploy your site.\n");
} catch {
  console.error("Could not read firebase-service-account.json in the project root.");
  process.exitCode = 1;
}
