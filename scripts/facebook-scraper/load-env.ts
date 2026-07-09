import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filename: string): void {
  const filePath = resolve(process.cwd(), filename);
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, "utf8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");
