"use server";
import { Book } from "./types";

export async function googleBooksByIsbn(isbn: string, userId: string): Promise<{ book?: Book; error?: string; }> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    return { book: undefined, error: "Google Books API key not configured." };
  }
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}&country=US`
  );
  if (response.status !== 200) {
    const errorText = await response.text();
    console.error(`Error fetching book for this ISBN. [${response.statusText}]`, errorText);
    return { book: undefined, error: `Error fetching book for this ISBN. Status: ${response.status}` };
  }
  
  const json = await response.json();
  if (!json || !json.items || json.items.length === 0) {
    return { book: undefined, error: "Unable to fetch book for this ISBN." };
  }

  const volumeInfo = json.items[0].volumeInfo;

  const book = {
    book: {
      id: isbn,
      title: volumeInfo.title,
      authors: volumeInfo.authors,
      description: volumeInfo.description ?? "No description available.",
      imageUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`, //volumeInfo.imageLinks?.thumbnail,
      genre: volumeInfo.categories,
      imageHint: json.items[0].searchInfo?.textSnippet,
      userId: userId,
      weight: "",
      height: volumeInfo.dimensions?.height,
      width: volumeInfo.dimensions?.width,
      length: volumeInfo.dimensions?.length,
      tag: "",
      price: json.items[0].saleInfo?.retailPrice?.amount,
      asin: "",
      isbn10: ""
    },
    error: ""
  };

  const industryIdentifiers = volumeInfo.industryIdentifiers;
  if (industryIdentifiers) {
    for (const identifier of industryIdentifiers) {
      if (identifier.type === 'ISBN_13' && identifier.identifier.length === 13) {
        book.book.id = identifier.identifier;
      }
      if (identifier.type === 'ISBN_10' && identifier.identifier.length === 10) {
        book.book.isbn10 = identifier.identifier;
      }
      if (identifier.type === 'OTHER' && identifier.identifier.length === 10) {
        book.book.asin = identifier.identifier;
      }
    }
  }

  return book;
}
