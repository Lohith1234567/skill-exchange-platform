// Firebase initialization for the Skill Exchange Platform
// If you're using Vite, make sure all env keys are prefixed with VITE_

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

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

// Check if config is valid (not just present, but actually configured)
const isValidConfig = (config) => {
  // Check if all required fields exist
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const hasAllRequired = required.every(key => config[key]);
  
  // Check if values are not placeholders
  const notPlaceholders = !config.apiKey?.includes('your_') && 
                          !config.projectId?.includes('your-project');
  
  return hasAllRequired && notPlaceholders;
};

// Basic validation to help during local setup
const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

// Initialize Firebase
let app, auth, db, rtdb, storage;

if (!isValidConfig(firebaseConfig)) {
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.warn('⚠️  FIREBASE NOT CONFIGURED');
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.warn('');
  console.warn('📝 To enable Firebase features:');
  console.warn('   1. Go to https://console.firebase.google.com/');
  console.warn('   2. Create or select your project');
  console.warn('   3. Copy your Firebase config values');
  console.warn('   4. Update the .env file with your credentials');
  console.warn('');
  if (missing.length) {
    console.warn('❌ Missing values:', missing.join(', '));
  } else {
    console.warn('❌ Please replace placeholder values in .env file');
  }
  console.warn('');
  console.warn('🔧 App is running in OFFLINE MODE');
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Set to null to prevent initialization
  app = null;
  auth = null;
  db = null;
  rtdb = null;
  storage = null;
} else {
  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    
    // Bind storage explicitly to the configured bucket
    const bucket = firebaseConfig.storageBucket ? `gs://${firebaseConfig.storageBucket}` : undefined;
    storage = getStorage(app, bucket);
    
    // Ensure auth state persists across reloads/tabs
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('[Firebase] Auth persistence setup failed:', err?.message || err);
    });
    
    console.log('✅ Firebase successfully initialized');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.warn('🔧 App will run in offline mode. Please check your Firebase configuration.');
    
    // Set to null to prevent crashes
    app = null;
    auth = null;
    db = null;
    rtdb = null;
    storage = null;
  }
}

export { app, auth, db, rtdb, storage };
export default app;
