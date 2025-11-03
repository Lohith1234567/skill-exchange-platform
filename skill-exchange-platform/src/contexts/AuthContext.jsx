import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged fired. user:', firebaseUser ? firebaseUser.uid : null);
      if (firebaseUser) {
        // User is signed in, fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
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
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
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
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
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

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
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
