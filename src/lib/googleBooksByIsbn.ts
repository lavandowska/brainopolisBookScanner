"use server";
import { Book } from "./types";

export async function googleBooksByIsbn(isbn: string): Promise<{ book?: Book; error?: string; }> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    return { book: undefined, error: "Google Books API key not configured." };
  }
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}&country=US`
  );
  if (response.status !== 200) {
    return { book: undefined, error: `Error fetching book for this ISBN. [${response.statusText}]` };
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
