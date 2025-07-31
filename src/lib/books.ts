"use server";

import { Book } from "@/lib/types";
import { upcToIsbn } from "@/ai/flows/upc-to-isbn";
//import { amazonPricingByAsin } from '@/lib/amazon';

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

 /*
  const { price, error: priceError } = await amazonPricingByAsin(book.asin);

  if (priceError) {
    console.error("Error fetching Amazon pricing:", priceError);
    // Continue without price if fetching fails
  } else if (price) {
    book.price = price;
  }
*/
  return { book: book };
}

async function googleBooksByIsbn(isbn: string): Promise<{ book?: Book, error?: string }> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    return { book: undefined, error: "Google Books API key not configured." };
  }
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}&country=US`
  )
  if (response.status !== 200) {
    return { book: undefined, error: `Error fetching book for this ISBN. [${response.statusText}]`  };
  }
  console.log(response);
  const json = await response.json();
  if (!json || !json.items || json.items.length === 0) {
    return { book: undefined, error: "Unable to fetch book for this ISBN." };
  }
  
  const volumeInfo = json.items[0].volumeInfo;
  const industryIdentifiers = volumeInfo.industryIdentifiers;
  let asin = undefined;
  if (industryIdentifiers) {
    for (const identifier of industryIdentifiers) {
      if (identifier.type === 'OTHER' && identifier.identifier.length === 10) {
        asin = identifier.identifier;
        break;
      }
    }
  }

  return {  
    book: {
      id: isbn,
      title: volumeInfo.title,
      authors: volumeInfo.authors,
      description: volumeInfo.description,
      imageUrl: volumeInfo.imageLinks?.thumbnail,
      genre: volumeInfo.categories,
      imageHint: json.items[0].searchInfo?.textSnippet,
      asin: asin
    },
    error: undefined
  };
}

export async function convertUpcToIsbn(upc: string): Promise<{ isbn?: string, error?: string }> {
    try {
        const result = await upcToIsbn({ upc });
        if (result.isbn) {
            return { isbn: result.isbn };
        }
        return { error: "Could not convert UPC to a valid ISBN or book not found." };
    } catch (e) {
        console.error(e);
        return { error: "Failed to convert UPC to ISBN." };
    }
}
