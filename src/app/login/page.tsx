"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function Login() {
  const { user, loginWithGoogle } = useAuth();
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
          <Button className="w-full" onClick={loginWithGoogle}>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
