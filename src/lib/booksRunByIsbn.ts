
"use server";

import { Book } from "./types";

export async function booksRunByIsbn(isbn: string): Promise<{ price?: number; tag?: string; error?: string; }> {
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
  var result = {price: 9.99, tag: "Used"};
  if (json.result.offers.booksrun.used != "none") {
    result = { price: json.result.offers.booksrun.used.price, tag: "Used" };
  }
  else if (json.result.offers.booksrun.new != "none") {
    result = { price: json.result.offers.booksrun.new.price, tag: "New" };
  }
  if (json.result.offers.marketplace && Array.isArray(json.result.offers.marketplace)) {
    json.result.offers.marketplace.forEach((offer) => {
      if (offer.used && offer.used.price && offer.used.price >= 3.99 && offer.used.price < result.price) {
        result.price = offer.used.price;
        result.tag = "Used";
      }
    });
  }
  return result;

}
