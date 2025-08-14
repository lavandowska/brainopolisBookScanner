"use client";

import { BookOpen, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">BookLook</h1>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground">Welcome, {user.displayName || user.email}</span>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
