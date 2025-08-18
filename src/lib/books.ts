"use server";

import { Book } from "@/lib/types";
import { saveBook } from "./firebase";
import { googleBooksByIsbn } from "./googleBooksByIsbn";
import { booksRunByIsbn } from "./booksRunByIsbn";

export async function fetchBookData(isbn: string, userId: string): Promise<{ book?: Book, error?: string }> {
  if (isbn.length < 10 || isbn.length > 13) {
    return { error: "Invalid ISBN." };
  }
  
  const { book, error } = await googleBooksByIsbn(isbn, userId);

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
  await saveBook(`${book.id}_${book.userId}`, book);
  
  return { book: book };
}

