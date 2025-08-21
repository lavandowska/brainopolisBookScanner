"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';

const GoogleIcon = (props: any) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.8-4.51 1.8-3.66 0-6.59-3.09-6.59-6.91s2.93-6.91 6.59-6.91c2.06 0 3.88.81 5.24 2.1l2.3-2.3C18.16 3.79 15.49 3 12.48 3c-5.21 0-9.48 4.25-9.48 9.49s4.27 9.49 9.48 9.49c2.76 0 5.09-1.02 6.9-2.91 1.86-1.86 2.5-4.54 2.5-6.91 0-.58-.05-1.15-.14-1.71h-9.22z" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, loginWithGoogle, loginWithEmailAndPassword, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null; // Or a loading spinner, as the redirect will happen
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">      
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center" style={{"paddingBottom": 12}}>
          <BookOpen className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4">Welcome to Book Look</CardTitle>
          <CardContent className="text-sm" style={{"paddingBottom": 4}}>
            <p className="mt-1">Book Look wants to make it easy to create your inventory.</p>
            <p className="mt-1">You can manually enter ISBN values, or scan the UPC code-box 
            (usually on the back of the book).
            </p>
            <p className="mt-1">Once you've completed scanning your inventory, you can then choose 
              which to export.  Currently only the WooCommerce import format is supported.
            </p>
            <p className="mt-1">You'll need an account to track your inventory, future goals are to support OAuth 
              via Google and Facebook.
            </p>
            {/* REGISTER */}
            <div className="mt-4 text-sm text-center text-gray-600">
              Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Sign up here.</a>
            </div>
          </CardContent>
          <CardDescription className="mt-0">Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* login with Google Auth */}
            <Button className="w-full" onClick={loginWithGoogle} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon className="h-5 w-5 mr-2" />
              )}
              Sign in with Google
            </Button>
            
            {/* login with email and password */}
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded-md text-gray-900"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') loginWithEmailAndPassword(email, password);
                      }}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-2 py-1 text-sm border rounded-md text-gray-900"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') loginWithEmailAndPassword(email, password);
                      }} />
            </div>
            <Button className="w-full" onClick={() => loginWithEmailAndPassword(email, password)} disabled={loading}>Login with Email</Button>
 
            {/* REGISTER */}
            <div className="mt-4 text-sm text-center text-gray-600">
              Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Sign up here.</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
