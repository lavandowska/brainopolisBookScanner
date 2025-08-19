import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
      console.error('Firebase admin initialization error', error.stack);
      // Don't throw, just log the error. The functions below will handle the uninitialized state.
    }
  } else {
    console.warn("Firebase Admin SDK credentials are not set. Skipping initialization.");
  }
} else {
  app = admin.apps[0]!;
}

// Throw a clear error if the app isn't initialized, which guides the user to set up credentials.
const ensureInitialized = () => {
    if (!app) {
        throw new Error("Firebase Admin SDK has not been initialized. Please check your environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).");
    }
};

// Lazy-initialized instances
let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

export const getAdminDb = () => {
    ensureInitialized();
    if (!db) {
        db = admin.firestore();
    }
    return db;
};

export const getAdminAuth = () => {
    ensureInitialized();
    if (!auth) {
        auth = admin.auth();
    }
    return auth;
};
