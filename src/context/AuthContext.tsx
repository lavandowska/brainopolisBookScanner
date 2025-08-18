"use client";

import { createContext, useContext, useEffect, useState, ReactNode, } from 'react';
import { onAuthStateChanged, signInWithRedirect, User, GoogleAuthProvider, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase-auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
  registerWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<void>;
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

    // Handle the redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // This is the signed-in user
          const user = result.user;
          setUser(user);
          router.push('/');
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      }).finally(() => {
        setLoading(false);
      });

    return () => unsubscribe();
  }, [router]);

  const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const registerWithEmailAndPassword = async (email: string, password: string) => {
    setLoading(true);
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      router.push('/');
    } catch (error) {
      console.error("Error registering with email and password:", error);
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmailAndPassword = async (email: string, password: string) => {
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      router.push('/');
    } catch (error) {
      console.error("Error signing in with email and password:", error);
    } finally {
      setLoading(false);
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
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, registerWithEmailAndPassword, loginWithEmailAndPassword }}>
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
