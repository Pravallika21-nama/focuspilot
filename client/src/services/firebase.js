import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);
const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* values in client/.env.");
  }

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  return {
    idToken,
    profile: {
      name: result.user.displayName,
      email: result.user.email,
      avatar: result.user.photoURL
    }
  };
}

export async function sendFirebasePasswordReset(email) {
  if (!auth) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* values in client/.env.");
  }

  if (!email) {
    throw new Error("Enter your email first.");
  }

  await sendPasswordResetEmail(auth, email);
}
