import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase is configured
    if (!auth) {
      console.warn('[Auth] Firebase not configured. Running in offline mode.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Subscribe to Firebase auth state changes
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return; // Prevent state updates after unmount
        
        console.log('[Auth] onAuthStateChanged fired. user:', firebaseUser ? firebaseUser.uid : null);
        if (firebaseUser) {
          // User is signed in, fetch additional user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (!isMounted) return; // Check again after async operation
            
            if (userDoc.exists()) {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...userDoc.data()
              });
              console.log('[Auth] User set from Firestore:', firebaseUser.uid);
            } else {
              // If no Firestore doc exists, use basic Firebase user data
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'User',
                avatar: firebaseUser.displayName?.split(' ').map(n => n[0]).join('') || 'U'
              });
              console.log('[Auth] User set from basic profile:', firebaseUser.uid);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            if (!isMounted) return;
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              avatar: firebaseUser.displayName?.split(' ').map(n => n[0]).join('') || 'U'
            });
            console.log('[Auth] User set after Firestore error:', firebaseUser.uid);
          }
        } else {
          // User is signed out
          setUser(null);
          console.log('[Auth] User signed out');
        }
        setLoading(false);
        console.log('[Auth] Loading false');
      });

      // Cleanup subscription on unmount
      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (error) {
      console.error('[Auth] Error setting up auth listener:', error);
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  const login = async (email, password) => {
    if (!auth) {
      throw new Error('Firebase authentication is not configured. Please check your .env file.');
    }
    
    try {
      console.log('🔐 Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Firebase auth successful:', firebaseUser.uid);
      
      // Try to fetch user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        console.log('📄 Firestore doc exists:', userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userDoc.data()
          };
          console.log('👤 User data loaded:', userData);
          setUser(userData);
          return userData;
        }
      } catch (firestoreError) {
        console.warn('⚠️ Firestore access blocked or unavailable:', firestoreError.message);
        console.log('📦 Continuing with basic auth data...');
      }
      
      // If Firestore fails or no doc exists, use basic user object
      const basicUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        avatar: firebaseUser.displayName?.split(' ').map(n => n[0]).join('') || 'U',
        bio: '',
        skillsToTeach: [],
        skillsToLearn: [],
        xp: 0,
        level: 1
      };
      console.log('👤 Using basic user data:', basicUser);
      setUser(basicUser);
      return basicUser;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    if (!auth || !db) {
      throw new Error('Firebase is not configured. Please check your .env file.');
    }
    
    try {
      console.log('📝 Creating account for:', email);
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Account created:', firebaseUser.uid);
      
      // Update display name
      await updateProfile(firebaseUser, {
        displayName: name
      });
      
      // Create user document in Firestore
      const userData = {
        name,
        email,
        avatar: name.split(' ').map(n => n[0]).join(''),
        createdAt: new Date().toISOString(),
        bio: '',
        skillsToTeach: [],
        skillsToLearn: [],
        xp: 0,
        level: 1
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      const newUser = {
        uid: firebaseUser.uid,
        ...userData
      };
      
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error.message);
    }
  };

  const loginWithGoogle = async () => {
    if (!auth || !db) {
      throw new Error('Firebase is not configured. Please check your .env file.');
    }

    try {
      console.log('🔐 Attempting Google sign-in...');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      console.log('✅ Google sign-in successful:', firebaseUser.uid);

      // Check if user document exists in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          // Existing user - load their data
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            ...userDoc.data()
          };
          console.log('👤 Existing user data loaded:', userData);
          setUser(userData);
          return userData;
        } else {
          // New user - create profile
          const newUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || '',
            bio: 'Share a bit about yourself and what you want to learn or teach!',
            skillsToTeach: [],
            skillsToLearn: [],
            avatar: firebaseUser.displayName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U',
            xp: 0,
            level: 1,
            createdAt: new Date().toISOString()
          };

          await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
          console.log('✅ New user profile created in Firestore');
          setUser(newUserData);
          return newUserData;
        }
      } catch (firestoreError) {
        console.warn('⚠️ Firestore access issue:', firestoreError.message);
        // Fallback to basic user data
        const basicUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || '',
          bio: '',
          skillsToTeach: [],
          skillsToLearn: [],
          xp: 0,
          level: 1
        };
        setUser(basicUser);
        return basicUser;
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    isAuthenticated: !!user,
    refreshUser: async () => {
      // Refresh user data from Firestore
      if (!auth?.currentUser) {
        console.warn('[Auth] No current user to refresh');
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUser({
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            ...userDoc.data()
          });
          console.log('[Auth] User data refreshed successfully');
        } else {
          console.warn('[Auth] User document does not exist');
        }
      } catch (error) {
        console.error('[Auth] Error refreshing user data:', error);
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
