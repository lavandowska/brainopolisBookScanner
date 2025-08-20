
"use client";

import { useState, useEffect } from "react";
import { Book, UserProfile } from "@/lib/types";
import { fetchBookData } from "@/lib/books";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { ISBNScanner } from "@/components/ISBNScanner";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Download, Trash2, BookX, CheckSquare, XSquare } from "lucide-react";
import { exportToWooCommerceCsv } from "@/lib/wooCommerceCsv";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getUserBooks, getUserProfile, saveUserProfile } from "@/lib/firebaseFunctions";


export default function Home() {
  const [profile, setProfile] = useState<UserProfile>();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const fetchBooks = async () => {
      if (user) {
        try {
          setBooks(await getUserBooks(user.uid));
        } catch (e) {
          console.error("Failed to fetch user books:", e);
          toast({
              variant: "destructive",
              title: "Error",
              description: "Could not load your books. Please try again later.",
          });
        }
      }
    }
    const fetchProfile = async () => {
      if (user) {
        try {
            setProfile(await getUserProfile(user.uid));
        } catch (e) {
          console.error("Failed to fetch user profile:", e);
          toast({
              variant: "destructive",
              title: "Error",
              description: "Could not load your profile. Please try again later.",
          });
        }
      }
    };
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProfile(); // Only fetch profile if user is logged in
      fetchBooks(); //do not tie the two actions together, it may take awhile to fetch all the books
    }
  }, [user, loading, router, toast]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  const handleScan = async (isbn: string): Promise<{error?: string}> => {
    if (books.some(book => book.id === isbn)) {
      const errorMsg = "This book is already in your list: " + isbn;
      toast({
        variant: "destructive",
        title: "Duplicate Book",
        description: errorMsg,
      });
      setIsScanning(false);
      return { error: errorMsg };
    }

    setIsScanning(true);
    const { book, error } = await fetchBookData(isbn.replaceAll(/\\D/g, ""), user.uid);
    setIsScanning(false);
    
    if (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
      return { error };
    } else if (book) {
      setBooks(prevBooks => {
        // Final check to prevent duplicates from race conditions
        if (prevBooks.some(b => b.id === book.id)) {
          return prevBooks;
        }
        return [book, ...prevBooks];
      });
      toast({
        title: "Book Added",
        description: `"${book.title}" has been added to your list.`,
      });
      setProfile(await getUserProfile(user.uid));
    }
    return {};
  };

  const handleSelectionChange = (bookId: string, isSelected: boolean) => {
    setSelectedBooks(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(bookId);
      } else {
        newSelection.delete(bookId);
      }
      return newSelection;
    });
  };
  
  const handleDescriptionEnhance = (bookId: string) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === bookId ? { ...book } : book
      )
    );
  };

  const handleDeleteSelected = () => {
    setBooks(prevBooks => prevBooks.filter(book => !selectedBooks.has(book.id)));
    if (profile) {
      profile.isbns = profile.isbns.filter(item => !selectedBooks.has(item));
      saveUserProfile(profile);
    }
    setSelectedBooks(new Set());
    toast({
        title: "Books Deleted",
        description: `${selectedBooks.size} book(s) have been removed.`,
    });
  };
  
  const handleExportSelected = () => {
      const booksToExport = books.filter(book => selectedBooks.has(book.id));
      if(booksToExport.length > 0) {
          exportToWooCommerceCsv(booksToExport);
          toast({
              title: "Export Successful",
              description: `${booksToExport.length} book(s) exported to CSV.`,
          });
      } else {
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: `No books selected for export.`,
        });
      }
  };

  const handleSelectAll = () => {
    if (selectedBooks.size === books.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(books.map(b => b.id)));
    }
  };
  
  const handleScannerCancel = () => {
    setIsScanning(false);
  }

  const allSelected = selectedBooks.size > 0 && selectedBooks.size === books.length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 pt-0">
        <div className="space-y-8">
          <ISBNScanner onScan={handleScan} isScanning={isScanning} onCancel={handleScannerCancel} userProfile={profile} />
          {profile && (
            <div className="flex items-center justify-center mt-0 mb-0" style={{"marginTop":0}}>
              <span
                className={`text-sm my-0 mt-0 mb-0 
                  ${profile.credits < 1 ? 'font-bold text-red-500' : 'text-foreground'}`
                }
              >Credits Remaining: {profile.credits}</span>
            </div>
          )}

          {books.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center p-4 bg-card border rounded-lg shadow-sm">
                <div className="font-medium text-foreground">
                  {selectedBooks.size} of {books.length} book(s) selected
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                   <Button variant="outline" onClick={handleSelectAll} disabled={books.length === 0}>
                    {allSelected ? <XSquare className="mr-2 h-4 w-4" /> : <CheckSquare className="mr-2 h-4 w-4" />}
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button variant="outline" onClick={handleExportSelected} disabled={selectedBooks.size === 0}>
                    <Download className="mr-2 h-4 w-4" /> Export Selected
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteSelected} disabled={selectedBooks.size === 0}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                {books.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isSelected={selectedBooks.has(book.id)}
                    onSelectionChange={handleSelectionChange}
                    onDescriptionEnhance={handleDescriptionEnhance}
                  />
                ))}
              </div>
            </div>
          )}
          
          {books.length === 0 && !isScanning && (
            <div className="text-center py-16 text-muted-foreground">
              <BookX className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">No Books Yet</h3>
              <p className="mt-1 text-sm">Scan an ISBN to get started.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
        BookLook by Firebase Studio
      </footer>
    </div>
  );
}
