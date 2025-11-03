// Firebase initialization for the Skill Exchange Platform
// If you're using Vite, make sure all env keys are prefixed with VITE_

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Read config from environment variables (Vite exposes them on import.meta.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Basic validation to help during local setup
const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  // Non-fatal: app will still start, but Firebase calls will fail until filled in
  // eslint-disable-next-line no-console
  console.warn('[Firebase] Missing env values:', missing.join(', '));
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Ensure auth state persists across reloads/tabs
setPersistence(auth, browserLocalPersistence).catch((err) => {
  // eslint-disable-next-line no-console
  console.warn('[Firebase] Auth persistence setup failed:', err?.message || err);
});

export { app, auth, db, rtdb };
export default app;
