import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;

function readServiceAccountFromPath(filePath: string): Record<string, string> {
  const resolvedPath = resolve(process.cwd(), filePath);
  if (!existsSync(resolvedPath)) {
    throw new Error(`Service account file not found: ${resolvedPath}`);
  }

  try {
    return JSON.parse(readFileSync(resolvedPath, "utf8")) as Record<string, string>;
  } catch {
    throw new Error(`Service account file is not valid JSON: ${resolvedPath}`);
  }
}

export function isFirebaseAdminConfigured(): boolean {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineJson) {
    return true;
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();

  if (!filePath) {
    return false;
  }

  return existsSync(resolve(process.cwd(), filePath));
}

function getServiceAccount(): Record<string, string> {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineJson) {
    try {
      return JSON.parse(inlineJson) as Record<string, string>;
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.");
    }
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();

  if (filePath) {
    return readServiceAccountFromPath(filePath);
  }

  throw new Error(
    "Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json to .env.local (recommended), or set FIREBASE_SERVICE_ACCOUNT_JSON.",
  );
}

function getStorageBucket(): string {
  const bucket =
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

  if (!bucket) {
    throw new Error(
      "FIREBASE_STORAGE_BUCKET or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required.",
    );
  }

  return bucket;
}

export function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0]!;
    return adminApp;
  }

  adminApp = initializeApp({
    credential: cert(getServiceAccount()),
    storageBucket: getStorageBucket(),
  });

  return adminApp;
}

export function getAdminDb(): Firestore {
  adminDb ??= getFirestore(getAdminApp());
  return adminDb;
}

export function getAdminStorage(): Storage {
  adminStorage ??= getStorage(getAdminApp());
  return adminStorage;
}
