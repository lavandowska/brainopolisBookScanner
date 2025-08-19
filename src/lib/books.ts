"use server";

import { Book } from "@/lib/types";
import { getBook, saveBook, saveUserBook } from "./firebaseFunctions";
import { googleBooksByIsbn } from "./googleBooksByIsbn";
import { booksRunByIsbn } from "./booksRunByIsbn";

export async function fetchBookData(isbn: string, userId: string): Promise<{ book?: Book, error?: string }> {
  try {
    if (isbn.length < 10 || isbn.length > 13) {
      return { error: "Invalid ISBN." };
    }
    
    // use saved books to save on calls out to APIs
    const savedBook = await getBook(isbn);

    if (savedBook != null) {
      await saveUserBook(isbn, userId);
      return { book: savedBook };
    }

    var { book, error } = await googleBooksByIsbn(isbn, userId);

    if (error) {
      return { error: error };    
    } else if (!book) {
      return { error: "Book not found for this ISBN." };
    }

    const { price, tag, error: priceError } = await booksRunByIsbn(book.id);

    if (priceError) {
      console.error("Error fetching BookRun pricing:", priceError);
      // Continue without price if fetching fails
    } else if (price) {
      book.price = price;
    }
    if (tag) {
      book.tag = tag;
    }
    // Save the book to Firebase
    await saveBook(book.id, book);
    await saveUserBook(book.id, userId);  
    
    return { book: book };
  } catch (e: any) {
    console.error("Error in fetchBookData: ", e);
    return { error: "An unexpected error occurred while fetching book data. " + e.message };
  }
}