import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (app) {
    return app;
  }

  const config = getFirebaseConfig();
  if (!config) {
    return null;
  }

  app = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  return app;
}

export function getFirebaseDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }

  db ??= getFirestore(firebaseApp);
  return db;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }

  auth ??= getAuth(firebaseApp);
  return auth;
}
