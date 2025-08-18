"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, User, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth, googleProvider, facebookProvider, appleProvider } from '@/lib/firebase-auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => void;
  loginWithFacebook: () => void;
  loginWithApple: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      googleProvider.setCustomParameters({
        'auth_domain': auth.config.authDomain
      });
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const loginWithFacebook = async () => {
    try {
      facebookProvider.setCustomParameters({
        'auth_domain': auth.config.authDomain
      });
      await signInWithPopup(auth, facebookProvider);
      router.push('/');
    } catch (error) {
      console.error("Error signing in with Facebook: ", error);
    }
  };

  const loginWithApple = async () => {
    try {
      appleProvider.setCustomParameters({
        'auth_domain': auth.config.authDomain
      });
      await signInWithPopup(auth, appleProvider);
      router.push('/');
    } catch (error) {
      console.error("Error signing in with Apple: ", error);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithFacebook, loginWithApple, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
