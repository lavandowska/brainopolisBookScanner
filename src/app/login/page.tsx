"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const GoogleIcon = (props: any) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.8-4.51 1.8-3.66 0-6.59-3.09-6.59-6.91s2.93-6.91 6.59-6.91c2.06 0 3.88.81 5.24 2.1l2.3-2.3C18.16 3.79 15.49 3 12.48 3c-5.21 0-9.48 4.25-9.48 9.49s4.27 9.49 9.48 9.49c2.76 0 5.09-1.02 6.9-2.91 1.86-1.86 2.5-4.54 2.5-6.91 0-.58-.05-1.15-.14-1.71h-9.22z" />
  </svg>
);

const FacebookIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
);

const MicrosoftIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.4 22.5H1.5V12.6H11.4V22.5zM22.5 22.5H12.6V12.6H22.5V22.5zM11.4 11.4H1.5V1.5H11.4V11.4zM22.5 11.4H12.6V1.5H22.5V11.4z"/>
    </svg>
);


export default function Login() {
  const { user, loginWithGoogle, loginWithFacebook, loginWithMicrosoft } = useAuth();
  const router = useRouter();

  if (user) {
    router.push('/');
    return null;
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
            <Button className="w-full" onClick={loginWithGoogle}>
              <GoogleIcon className="h-5 w-5 mr-2" />
              Sign in with Google
            </Button>
            <Button className="w-full" onClick={loginWithFacebook}>
                <FacebookIcon className="h-5 w-5 mr-2"/>
              Sign in with Facebook
            </Button>
            <Button className="w-full" onClick={loginWithMicrosoft}>
                <MicrosoftIcon className="h-5 w-5 mr-2"/>
                Sign in with Microsoft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
