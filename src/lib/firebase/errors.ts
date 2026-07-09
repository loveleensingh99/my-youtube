interface FirebaseErrorLike {
  code?: string;
  message?: string;
}

export function getFriendlyFirebaseAuthError(error: unknown): string {
  const firebaseError = error as FirebaseErrorLike | null;
  const code = firebaseError?.code ?? "";

  if (code === "auth/operation-not-allowed") {
    return "Email/Password sign-in is disabled in Firebase. Enable it in Firebase Console > Authentication > Sign-in method > Email/Password.";
  }

  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return "Invalid email or password.";
  }

  if (code === "auth/user-not-found") {
    return "No user found for this email.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please try again in a few minutes.";
  }

  if (typeof firebaseError?.message === "string" && firebaseError.message.trim()) {
    return firebaseError.message;
  }

  return "Login failed. Please check Firebase authentication settings.";
}
