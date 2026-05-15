import admin from "firebase-admin";

function getFirebaseApp() {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId) return null;

  if (!clientEmail || !privateKey) {
    return admin.initializeApp({ projectId });
  }

  return admin.initializeApp({
    projectId,
    credential: admin.credential.cert({ projectId, clientEmail, privateKey })
  });
}

export async function verifyGoogleIdToken(idToken) {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase project is not configured on the server. Add FIREBASE_PROJECT_ID in server/.env.");
  }

  return admin.auth(app).verifyIdToken(idToken);
}
