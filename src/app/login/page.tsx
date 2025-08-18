"use client";

import { useEffect } from 'react';
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
  const { user, loginWithGoogle, loading } = useAuth();
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
        <CardHeader className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4">Welcome to BookLook</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <Button className="w-full" onClick={loginWithGoogle} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon className="h-5 w-5 mr-2" />
              )}
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
