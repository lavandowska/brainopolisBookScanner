"use server";

import { Book } from "@/lib/types";
import { googleBooksByIsbn } from "./googleBooksByIsbn";
import { booksRunByIsbn } from "./booksRunByIsbn";

export async function fetchBookData(isbn: string): Promise<{ book?: Book, error?: string }> {
  if (isbn.length < 10 || isbn.length > 13) {
    return { error: "Invalid ISBN." };
  }
  
  const { book, error } = await googleBooksByIsbn(isbn);

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
    book.tags = [tag];
  }
  return { book: book };
}

