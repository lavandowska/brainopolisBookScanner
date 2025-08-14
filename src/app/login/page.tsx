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

const AppleIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.01,2.02c-1.42,0-2.73,0.48-3.81,1.23c-1.4,0.97-2.48,2.48-2.9,4.13c-0.02,0.08-0.04,0.17-0.04,0.25 c0,0.13,0.02,0.26,0.05,0.39c-1.6,0.12-3.1,0.8-4.14,1.86c-1.05,1.06-1.75,2.5-1.94,4.04C-0.9,15.68,0.73,20,3.47,22 c0.6,0.45,1.3,0.7,2.05,0.71c0.19,0,0.37-0.02,0.55-0.05c0.55-0.1,1.1-0.34,1.57-0.69c0.71-0.53,1.33-1.21,1.83-1.95 c0.45-0.67,0.85-1.4,1.2-2.18c0.18,0.02,0.35,0.03,0.52,0.03c0.12,0,0.24-0.01,0.35-0.02c0.56,1.4,1.34,2.56,2.3,3.45 c0.84,0.78,1.8,1.25,2.83,1.35c0.23,0.02,0.46,0.04,0.7,0.04c1.23,0,2.37-0.4,3.3-1.1c1.29-0.98,2.1-2.43,2.23-4.06 c0.01-0.1,0.01-0.2,0.01-0.3c0-0.03,0-0.06-0.01-0.09c0.02-2.13-1.15-4.22-2.85-5.32c-1.39-0.9-3.15-1.1-4.75-0.61 c-0.42,0.13-0.84,0.34-1.23,0.6c-0.17,0.12-0.34,0.24-0.5,0.38c-0.3-0.18-0.61-0.34-0.92-0.49c-1.4-0.67-2.9-1-4.32-0.78 c-0.16,0.02-0.32,0.06-0.47,0.1c-0.18-0.81-0.21-1.63-0.09-2.42c0.24-1.63,0.96-3.11,2.06-4.17c1.03-1.01,2.4-1.6,3.83-1.63 c0.1,0,0.19-0.01,0.29-0.01C11.81,2.02,11.91,2.02,12.01,2.02z M11.26,3.13c-1.2,0.02-2.3,0.51-3.13,1.28 c-0.91,0.84-1.5,2.02-1.69,3.3c-0.05,0.34-0.07,0.7-0.05,1.06c0.01,0.21,0.04,0.41,0.08,0.62c0.01,0.04,0.01,0.09,0.02,0.13 c0.33,1.35,1.21,2.48,2.44,3.16c0.44,0.25,0.9,0.42,1.37,0.52c0.08,0.02,0.17,0.03,0.25,0.05c-0.14-0.47-0.25-0.95-0.3-1.45 c-0.05-0.5-0.03-1.01,0.07-1.5c0.1-0.5,0.27-0.99,0.52-1.45c0.24-0.46,0.55-0.89,0.91-1.29c0.7-0.78,1.66-1.26,2.69-1.28 c0.02,0,0.03,0,0.05,0c0.3,0,0.6,0.04,0.88,0.12c-0.82-1.28-2.12-2.12-3.56-2.12C11.45,3.13,11.35,3.13,11.26,3.13z"/>
    </svg>
);


export default function Login() {
  const { user, loginWithGoogle, loginWithFacebook, loginWithApple } = useAuth();
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
            <Button className="w-full" onClick={loginWithApple}>
                <AppleIcon className="h-5 w-5 mr-2"/>
                Sign in with Apple
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
