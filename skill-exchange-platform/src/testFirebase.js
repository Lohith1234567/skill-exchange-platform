// Quick Firebase test - run this in browser console or create a test button
import { auth } from './config/firebase';

export const testFirebaseConnection = () => {
  console.log('Firebase Auth instance:', auth);
  console.log('Firebase Config:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
  });
};

// Check if user is logged in
export const checkAuthState = () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('✅ User is signed in:', user.email);
    } else {
      console.log('❌ No user signed in');
    }
  });
};
