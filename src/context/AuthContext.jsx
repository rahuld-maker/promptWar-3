import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  getIdToken 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    // Listen for auth state changes (clean up on unmount)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google sign in helper
  const signInWithGoogle = async () => {
    if (!auth) {
      console.warn('Firebase Auth client is unconfigured. Simulating a mock login for preview/developer mode.');
      setLoading(true);
      const mockUser = {
        uid: 'mock-user-123',
        displayName: 'Eco Pioneer (Preview)',
        email: 'pioneer@sagecorp.com',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
      };
      setUser(mockUser);
      setLoading(false);
      return mockUser;
    }
    
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google Authentication Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout helper
  const logout = async () => {
    if (!auth) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch the raw JWT token from Firebase
  const getFirebaseToken = async (forceRefresh = false) => {
    if (!auth) return 'mock-jwt-token-12345';
    if (!auth.currentUser) return null;
    try {
      return await getIdToken(auth.currentUser, forceRefresh);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
    getIdToken: getFirebaseToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the auth context easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
