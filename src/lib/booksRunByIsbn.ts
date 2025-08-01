"use server";
export async function booksRunByIsbn(isbn: string): Promise<{ price?: number; error?: string; }> {
  const apiKey = process.env.BOOKS_RUN_API_KEY;
  if (!apiKey) {
    return { price: undefined, error: "Books.run API key not configured." };
  }
  const response = await fetch(
    `https://booksrun.com/api/v3/price/buy/${isbn}?key=${apiKey}`
  );
  if (response.status !== 200) {
    return { price: undefined, error: `Error pricing book for this ISBN. [${response.statusText}]` };
  }
  const json = await response.json();
  if (json.result.status != "success") {
    return { price: undefined, error: `Unable to fetch price for ISBN ${isbn}.` };
  }
  // prefers used price over new as most of my books are used
  if (json.result.offers.booksrun.used != "none") {
    return { price: json.result.offers.booksrun.used.price };
  }
  if (json.result.offers.booksrun.new != "none") {
    return { price: json.result.offers.booksrun.new.price };
  }

  return { price: undefined, error: "No price info found for this ISBN." };
}
