"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

interface FirebaseAuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const ALLOWED_LOGIN_EMAIL = "pasta@gmail.com";

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(null);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      setUser(null);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      if (nextUser?.email?.toLowerCase() !== ALLOWED_LOGIN_EMAIL) {
        void signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(nextUser);
      setLoading(false);
    });
  }, [configured]);

  const value = useMemo<FirebaseAuthContextValue>(
    () => ({
      user,
      loading,
      configured,
      async signInWithEmail(email, password) {
        if (email.trim().toLowerCase() !== ALLOWED_LOGIN_EMAIL) {
          throw new Error("Only pasta@gmail.com is allowed.");
        }
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase is not configured.");
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      async signOutUser() {
        const auth = getFirebaseAuth();
        if (!auth) return;
        await signOut(auth);
      },
    }),
    [user, loading, configured],
  );

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
}

export function useFirebaseAuthContext() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useFirebaseAuthContext must be used within FirebaseAuthProvider");
  }
  return context;
}
