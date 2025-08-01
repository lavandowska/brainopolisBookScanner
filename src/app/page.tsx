"use client";

import { useState } from "react";
import { Book } from "@/lib/types";
import { fetchBookData } from "@/lib/books";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { ISBNScanner } from "@/components/ISBNScanner";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Download, Trash2, BookX, CheckSquare, XSquare } from "lucide-react";
import { exportToWooCommerceCsv } from "@/lib/csv";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScan = async (isbn: string) => {
    if (books.some(book => book.id === isbn)) {
      toast({
        variant: "destructive",
        title: "Duplicate Book",
        description: "This book is already in your list: " + isbn,
      });
      return;
    }

    setIsScanning(true);
    const { book, error } = await fetchBookData(isbn.replaceAll("\D", ""));
    setIsScanning(false);

    if (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    } else if (book) {
      setBooks(prevBooks => [book, ...prevBooks]);
      toast({
        title: "Book Added",
        description: `"${book.title}" has been added to your list.`,
      });
    }
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

  const allSelected = selectedBooks.size > 0 && selectedBooks.size === books.length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <ISBNScanner onScan={handleScan} isScanning={isScanning} />

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
